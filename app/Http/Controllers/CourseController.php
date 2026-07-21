<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\Review;
use Illuminate\Support\Facades\Auth;

class CourseController extends Controller
{
    public function index(Request $request)
    {
        $query = Course::with('user:id,name,avatar')
            ->where('is_published', true);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('short_description', 'like', "%{$search}%");
            });
        }

        $courses = $query->latest()->get();

        return response()->json([
            'success' => true,
            'courses' => $courses
        ]);
    }

    public function publicBlogs(Request $request)
    {
        $query = \App\Models\BlogPost::with('author:id,name,avatar', 'category:id,name,slug')
            ->where('status', 'published')
            ->latest();

        if ($request->filled('limit')) {
            $query->take($request->limit);
        }

        $posts = $query->get();

        return response()->json([
            'success' => true,
            'posts' => $posts
        ]);
    }

    public function publicBlogCategories(Request $request)
    {
        $categories = \App\Models\BlogCategory::withCount('posts')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'categories' => $categories
        ]);
    }

    public function publicProducts(Request $request)
    {
        $query = \App\Models\Product::where('is_active', true);

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $products = $query->orderBy('order')->orderBy('id', 'desc')->get();

        return response()->json([
            'success' => true,
            'products' => $products
        ]);
    }

    public function show($slug)
    {
        $course = Course::with(['user:id,name,avatar', 'category', 'chapters' => function($q) {
            $q->where('is_published', true)->with(['lessons' => function($l) {
                $l->where('is_published', true)->orderBy('sort_order');
            }])->orderBy('sort_order');
        }])
        ->withCount('enrollments')
        ->where('slug', $slug)
        ->firstOrFail();

        $enrollment = null;
        $completedLessons = [];

        if (Auth::check()) {
            $enrollment = Enrollment::where('user_id', Auth::id())
                ->where('course_id', $course->id)
                ->first();

            if ($enrollment) {
                // Get completed lesson IDs for this user in this course
                $lessonIds = [];
                foreach ($course->chapters as $chapter) {
                    foreach ($chapter->lessons as $lesson) {
                        $lessonIds[] = $lesson->id;
                    }
                }

                $completedLessons = LessonProgress::where('user_id', Auth::id())
                    ->whereIn('lesson_id', $lessonIds)
                    ->where('is_completed', true)
                    ->pluck('lesson_id')
                    ->toArray();
            }
        }

        $recentStudents = Enrollment::where('course_id', $course->id)
            ->with('user:id,name,avatar')
            ->latest()
            ->take(3)
            ->get()
            ->map(function ($enrollment) {
                return $enrollment->user;
            })
            ->filter()
            ->values();

        return response()->json([
            'success' => true,
            'course' => $course,
            'is_enrolled' => !is_null($enrollment),
            'enrollment' => $enrollment,
            'completed_lessons' => $completedLessons,
            'recent_students' => $recentStudents
        ]);
    }

    public function reviews($slug)
    {
        $course = Course::where('slug', $slug)->firstOrFail();

        $reviews = Review::where('course_id', $course->id)
            ->where('is_active', true)
            ->with('user:id,name,avatar')
            ->latest()
            ->get();

        $avgRating = $reviews->avg('rating') ?: 0;
        $totalReviews = $reviews->count();

        $distribution = [];
        for ($i = 5; $i >= 1; $i--) {
            $distribution[$i] = $reviews->where('rating', $i)->count();
        }

        return response()->json([
            'success' => true,
            'avg_rating' => round($avgRating, 1),
            'total_reviews' => $totalReviews,
            'distribution' => $distribution,
            'reviews' => $reviews->map(fn($r) => [
                'id' => $r->id,
                'rating' => $r->rating,
                'comment' => $r->comment,
                'created_at' => $r->created_at->format('M d, Y'),
                'user' => [
                    'name' => $r->user?->name ?? 'Anonymous',
                    'avatar' => $r->user?->avatar ?? null,
                ],
            ]),
        ]);
    }

    public function enroll(Request $request, $id)
    {
        $course = Course::findOrFail($id);
        
        $existing = Enrollment::where('user_id', Auth::id())
            ->where('course_id', $course->id)
            ->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'You are already enrolled in this course.'
            ], 400);
        }

        $enrollment = Enrollment::create([
            'user_id' => Auth::id(),
            'course_id' => $course->id,
            'status' => 'active',
            'progress' => 0,
            'completed_lessons_count' => 0
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Successfully enrolled in this course.',
            'enrollment' => $enrollment
        ]);
    }

    public function toggleLessonProgress(Request $request, $lessonId)
    {
        $lesson = Lesson::findOrFail($lessonId);
        $chapter = $lesson->chapter;
        $course = $chapter->course;

        // Check enrollment
        $enrollment = Enrollment::where('user_id', Auth::id())
            ->where('course_id', $course->id)
            ->first();

        if (!$enrollment) {
            return response()->json([
                'success' => false,
                'message' => 'You are not enrolled in this course.'
            ], 403);
        }

        // Toggle progress
        $progress = LessonProgress::where('user_id', Auth::id())
            ->where('lesson_id', $lesson->id)
            ->first();

        if ($progress) {
            $progress->is_completed = !$progress->is_completed;
            $progress->completed_at = $progress->is_completed ? now() : null;
            $progress->save();
        } else {
            $progress = LessonProgress::create([
                'user_id' => Auth::id(),
                'lesson_id' => $lesson->id,
                'is_completed' => true,
                'completed_at' => now()
            ]);
        }

        // Recalculate course progress
        $lessonIds = Lesson::whereIn('chapter_id', $course->chapters->pluck('id'))->pluck('id')->toArray();
        $totalLessons = count($lessonIds);
        
        $completedLessonsCount = LessonProgress::where('user_id', Auth::id())
            ->whereIn('lesson_id', $lessonIds)
            ->where('is_completed', true)
            ->count();

        $progressPercent = $totalLessons > 0 ? round(($completedLessonsCount / $totalLessons) * 100) : 0;

        $enrollment->update([
            'progress' => $progressPercent,
            'completed_lessons_count' => $completedLessonsCount
        ]);

        return response()->json([
            'success' => true,
            'is_completed' => $progress->is_completed,
            'progress' => $progressPercent,
            'completed_lessons_count' => $completedLessonsCount
        ]);
    }

    public function dashboard()
    {
        $user = Auth::user();
        
        $enrollments = Enrollment::where('user_id', $user->id)
            ->with(['course' => function($q) {
                $q->with(['user:id,name', 'chapters' => function($c) {
                    $c->where('is_published', true)->with('lessons');
                }]);
            }])
            ->get();

        $formattedEnrollments = [];
        $activeCount = 0;
        $completedCount = 0;
        $pendingCount = 0;

        foreach ($enrollments as $enrollment) {
            $course = $enrollment->course;
            if (!$course) continue;

            $lessonIds = [];
            foreach ($course->chapters as $chapter) {
                foreach ($chapter->lessons as $lesson) {
                    if ($lesson->is_published) {
                        $lessonIds[] = $lesson->id;
                    }
                }
            }
            $totalLessons = count($lessonIds);

            $completedLessonsCount = LessonProgress::where('user_id', $user->id)
                ->whereIn('lesson_id', $lessonIds)
                ->where('is_completed', true)
                ->count();

            $progressPercent = $totalLessons > 0 ? round(($completedLessonsCount / $totalLessons) * 100) : 0;

            if ($enrollment->progress != $progressPercent || $enrollment->completed_lessons_count != $completedLessonsCount) {
                $enrollment->update([
                    'progress' => $progressPercent,
                    'completed_lessons_count' => $completedLessonsCount
                ]);
            }

            if ($progressPercent == 100) {
                $completedCount++;
            } elseif ($progressPercent > 0) {
                $activeCount++;
            } else {
                $pendingCount++;
            }

            $formattedEnrollments[] = [
                'id' => $enrollment->id,
                'course_id' => $course->id,
                'title' => $course->title,
                'slug' => $course->slug,
                'thumbnail' => $course->thumbnail,
                'price' => $course->price,
                'discount_price' => $course->discount_price,
                'instructor_name' => $course->user ? $course->user->name : 'Expert',
                'progress' => $progressPercent,
                'completed_lessons_count' => $completedLessonsCount,
                'total_lessons_count' => $totalLessons
            ];
        }

        return response()->json([
            'success' => true,
            'stats' => [
                'enrolled_count' => count($formattedEnrollments),
                'active_count' => $activeCount,
                'completed_count' => $completedCount,
                'pending_count' => $pendingCount,
            ],
            'enrollments' => $formattedEnrollments
        ]);
    }

    public function publicBlogShow($slug)
    {
        $post = \App\Models\BlogPost::with(['author:id,name,avatar', 'category:id,name,slug', 'tags'])
            ->where('slug', $slug)
            ->where('status', 'published')
            ->firstOrFail();

        // Increment view count (once per session)
        $viewKey = 'blog_post_viewed_' . $post->id;
        if (!session()->has($viewKey)) {
            $post->increment('views_count');
            session()->put($viewKey, true);
        }

        // Get related posts
        $relatedPosts = \App\Models\BlogPost::where('status', 'published')
            ->where('id', '!=', $post->id)
            ->where('blog_category_id', $post->blog_category_id)
            ->latest()
            ->take(3)
            ->get();

        // Get related courses
        $relatedCourses = [];
        if (!empty($post->related_courses)) {
            $relatedCourses = \App\Models\Course::whereIn('id', $post->related_courses)->get();
        } else {
            $relatedCourses = \App\Models\Course::where('is_published', true)->latest()->take(2)->get();
        }

        // Previous and Next posts for navigation
        $previousPost = \App\Models\BlogPost::where('status', 'published')
            ->where('published_at', '<', $post->published_at)
            ->orderByDesc('published_at')
            ->first(['id', 'title', 'slug', 'featured_image']);

        $nextPost = \App\Models\BlogPost::where('status', 'published')
            ->where('published_at', '>', $post->published_at)
            ->orderBy('published_at')
            ->first(['id', 'title', 'slug', 'featured_image']);

        // Table of contents
        $tableOfContents = $this->extractTableOfContents($post->content ?? '');

        return response()->json([
            'success' => true,
            'post' => $post,
            'relatedPosts' => $relatedPosts,
            'relatedCourses' => $relatedCourses,
            'previousPost' => $previousPost,
            'nextPost' => $nextPost,
            'tableOfContents' => $tableOfContents,
        ]);
    }

    private function extractTableOfContents(string $html): array
    {
        $toc = [];
        preg_match_all('/<h([23])[^>]*id=["\']([^"\']+)["\'][^>]*>(.+?)<\/h\1>/i', $html, $matches, PREG_SET_ORDER);
        foreach ($matches as $match) {
            $toc[] = [
                'level' => (int) $match[1],
                'id' => $match[2],
                'text' => strip_tags($match[3]),
            ];
        }
        return $toc;
    }

    public function expressInterest(Request $request, $id)
    {
        $course = Course::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
        ], [
            'name.required' => 'নাম প্রদান করা আবশ্যক।',
            'email.required' => 'ইমেইল প্রদান করা আবশ্যক।',
            'email.email' => 'সঠিক ইমেইল ঠিকানা প্রদান করুন।',
        ]);

        $name = $request->name;
        $email = $request->email;

        // Check if interest already exists
        $existing = \App\Models\CourseLead::where('course_id', $course->id)
            ->where('email', $email)
            ->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'আপনি ইতিমধ্যে এই কোর্সে আপনার আগ্রহ প্রকাশ করেছেন।'
            ], 400);
        }

        \App\Models\CourseLead::create([
            'course_id' => $course->id,
            'name' => $name,
            'email' => $email,
            'notified' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'ধন্যবাদ! কোর্সটি লাইভ হলে আপনাকে ইমেইলের মাধ্যমে জানানো হবে।'
        ]);
    }
}
