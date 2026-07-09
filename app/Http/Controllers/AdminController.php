<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\Course;
use App\Models\Category;
use App\Models\Chapter;
use App\Models\Lesson;
use App\Models\User;
use App\Models\Enrollment;
use App\Models\Payment;
use App\Models\SupportTicket;
use App\Models\TicketCategory;
use App\Models\TicketReply;
use App\Services\CloudinaryService;

class AdminController extends Controller
{
    /**
     * Verify admin role on every action.
     */
    private function ensureAdmin()
    {
        if (!Auth::check() || Auth::user()->role !== 'admin') {
            abort(403, 'অ্যাডমিন অ্যাক্সেস প্রয়োজন।');
        }
    }

    // ─────────────────────────────────────────
    // Dashboard Stats
    // ─────────────────────────────────────────

    public function stats()
    {
        $this->ensureAdmin();

        // Revenue
        $totalRevenue     = Payment::where('status', 'completed')->sum('amount');
        $lastMonthRevenue = Payment::where('status', 'completed')
            ->whereMonth('created_at', now()->subMonth()->month)
            ->whereYear('created_at', now()->subMonth()->year)
            ->sum('amount');
        $thisMonthRevenue = Payment::where('status', 'completed')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('amount');

        // Users
        $totalUsers  = User::where('role', 'student')->count();
        $activeUsers = User::where('role', 'student')
            ->whereHas('enrollments')
            ->count();

        // Courses
        $totalCourses    = Course::count();
        $publishedCourses = Course::where('is_published', true)->count();

        // Enrollments
        $totalEnrollments     = Enrollment::count();
        $thisMonthEnrollments = Enrollment::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        // Monthly revenue for chart (last 12 months)
        $monthlyRevenue = Payment::where('status', 'completed')
            ->selectRaw('YEAR(created_at) as year, MONTH(created_at) as month, SUM(amount) as total')
            ->where('created_at', '>=', now()->subMonths(11)->startOfMonth())
            ->groupByRaw('YEAR(created_at), MONTH(created_at)')
            ->orderByRaw('YEAR(created_at), MONTH(created_at)')
            ->get();

        // Pending tickets
        $openTickets = SupportTicket::where('status', 'open')->count();

        // Recent payments
        $recentPayments = Payment::with(['user:id,name,email', 'course:id,title'])
            ->latest()
            ->take(8)
            ->get();

        // Recent users
        $recentUsers = User::where('role', 'student')
            ->latest()
            ->take(6)
            ->get(['id', 'name', 'email', 'created_at', 'avatar']);

        // Revenue growth %
        $revenueGrowth = $lastMonthRevenue > 0
            ? round((($thisMonthRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100, 1)
            : 0;

        return response()->json([
            'success' => true,
            'stats'   => [
                'total_revenue'        => $totalRevenue,
                'revenue_growth'       => $revenueGrowth,
                'total_users'          => $totalUsers,
                'active_users'         => $activeUsers,
                'total_courses'        => $totalCourses,
                'published_courses'    => $publishedCourses,
                'total_enrollments'    => $totalEnrollments,
                'month_enrollments'    => $thisMonthEnrollments,
                'open_tickets'         => $openTickets,
            ],
            'monthly_revenue' => $monthlyRevenue,
            'recent_payments' => $recentPayments,
            'recent_users'    => $recentUsers,
        ]);
    }

    // ─────────────────────────────────────────
    // Courses
    // ─────────────────────────────────────────

    public function courses(Request $request)
    {
        $this->ensureAdmin();

        $query = Course::with('user:id,name')
            ->withCount(['enrollments', 'chapters']);

        if ($request->filled('search')) {
            $q = $request->search;
            $query->where('title', 'like', "%{$q}%");
        }

        if ($request->filled('status')) {
            $query->where('is_published', $request->status === 'published');
        }

        $courses = $query->latest()->paginate(15);

        return response()->json([
            'success' => true,
            'courses' => $courses,
        ]);
    }

    public function showCourse($id)
    {
        $this->ensureAdmin();
        $course = Course::with('user:id,name')
            ->withCount(['enrollments', 'chapters'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'course'  => $course,
        ]);
    }

    public function toggleCoursePublish($id)
    {
        $this->ensureAdmin();
        $course = Course::findOrFail($id);
        $course->update(['is_published' => !$course->is_published]);

        return response()->json([
            'success'      => true,
            'is_published' => $course->is_published,
            'message'      => $course->is_published ? 'কোর্স প্রকাশিত হয়েছে।' : 'কোর্স আনপাবলিশ হয়েছে।',
        ]);
    }

    public function storeCourse(Request $request)
    {
        $this->ensureAdmin();

        $request->validate([
            'title'             => 'required|string|max:255',
            'category_id'       => 'nullable|integer',
            'short_description' => 'nullable|string',
            'language'          => 'nullable|string|max:50',
            'price'             => 'nullable|numeric|min:0',
            'discount_price'    => 'nullable|numeric|min:0',
            'is_published'      => 'boolean',
            'thumbnail'         => 'nullable|image|max:4096',
        ]);

        $data = [
            'user_id'           => Auth::id(),
            'title'             => $request->title,
            'slug'              => Str::slug($request->title) . '-' . uniqid(),
            'category_id'       => $request->category_id ?: null,
            'short_description' => $request->short_description,
            'language'          => $request->language ?? 'Bengali',
            'price'             => $request->price ?? 0,
            'discount_price'    => $request->discount_price ?? null,
            'is_published'      => $request->boolean('is_published', false),
        ];

        if ($request->hasFile('thumbnail')) {
            $cloudinary = new CloudinaryService();
            $result = $cloudinary->uploadThumbnail($request->file('thumbnail'));
            if ($result) {
                $data['thumbnail'] = $result['url'];
            }
        }

        $course = Course::create($data);

        return response()->json([
            'success' => true,
            'message' => 'কোর্স তৈরি হয়েছে।',
            'course'  => $course->load('user:id,name')->loadCount(['enrollments', 'chapters']),
        ]);
    }

    public function updateCourse(Request $request, $id)
    {
        $this->ensureAdmin();
        $course = Course::findOrFail($id);

        $request->validate([
            'title'             => 'required|string|max:255',
            'slug'              => 'nullable|string|max:255|unique:courses,slug,' . $id,
            'category_id'       => 'nullable|integer',
            'short_description' => 'nullable|string',
            'language'          => 'nullable|string|max:50',
            'price'             => 'nullable|numeric|min:0',
            'discount_price'    => 'nullable|numeric|min:0',
            'is_published'      => 'boolean',
            'thumbnail'         => 'nullable|image|max:4096',
        ]);

        $data = [
            'title'             => $request->title,
            'slug'              => $request->slug ?: (Str::slug($request->title) . '-' . $id),
            'category_id'       => $request->category_id ?: null,
            'short_description' => $request->short_description,
            'language'          => $request->language ?? 'Bengali',
            'price'             => $request->price ?? 0,
            'discount_price'    => $request->discount_price ?? null,
            'is_published'      => $request->boolean('is_published', false),
        ];

        if ($request->hasFile('thumbnail')) {
            $cloudinary = new CloudinaryService();

            // Delete old Cloudinary thumbnail if exists
            if ($course->thumbnail && $cloudinary->isCloudinaryUrl($course->thumbnail)) {
                $publicId = $cloudinary->extractPublicId($course->thumbnail);
                if ($publicId) $cloudinary->deleteImage($publicId);
            }

            $result = $cloudinary->uploadThumbnail($request->file('thumbnail'));
            if ($result) {
                $data['thumbnail'] = $result['url'];
            }
        }

        $course->update($data);

        return response()->json([
            'success' => true,
            'message' => 'কোর্স আপডেট হয়েছে।',
            'course'  => $course->fresh()->load('user:id,name')->loadCount(['enrollments', 'chapters']),
        ]);
    }

    public function destroyCourse($id)
    {
        $this->ensureAdmin();
        $course = Course::with(['chapters.lessons', 'enrollments'])->findOrFail($id);

        // Delete thumbnail from Cloudinary if it exists
        if ($course->thumbnail) {
            $cloudinary = new CloudinaryService();
            if ($cloudinary->isCloudinaryUrl($course->thumbnail)) {
                $publicId = $cloudinary->extractPublicId($course->thumbnail);
                if ($publicId) $cloudinary->deleteImage($publicId);
            }
        }

        // Cascade delete: lessons → chapters → enrollments → course
        foreach ($course->chapters as $chapter) {
            $chapter->lessons()->delete();
        }
        $course->chapters()->delete();
        $course->enrollments()->delete();
        $course->delete();

        return response()->json([
            'success' => true,
            'message' => 'কোর্স মুছে ফেলা হয়েছে।',
        ]);
    }

    public function categories()
    {
        $this->ensureAdmin();
        $categories = DB::table('categories')->select('id', 'name')->orderBy('name')->get();
        return response()->json(['success' => true, 'categories' => $categories]);
    }

    public function adminCategoriesList(Request $request)
    {
        $this->ensureAdmin();

        $query = Category::withCount('courses');

        if ($request->filled('search')) {
            $q = $request->search;
            $query->where(function($sq) use ($q) {
                $sq->where('name', 'like', "%{$q}%")
                   ->orWhere('description', 'like', "%{$q}%");
            });
        }

        $categories = $query->latest()->paginate(15);

        return response()->json([
            'success'    => true,
            'categories' => $categories,
        ]);
    }

    public function storeCategory(Request $request)
    {
        $this->ensureAdmin();

        $request->validate([
            'name'        => 'required|string|max:255|unique:categories,name',
            'description' => 'nullable|string',
        ]);

        $category = Category::create([
            'name'        => $request->name,
            'slug'        => Str::slug($request->name) . '-' . uniqid(),
            'description' => $request->description,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'ক্যাটাগরি তৈরি সম্পন্ন হয়েছে।',
            'category'=> $category->loadCount('courses'),
        ]);
    }

    public function updateCategory(Request $request, $id)
    {
        $this->ensureAdmin();
        $category = Category::findOrFail($id);

        $request->validate([
            'name'        => 'required|string|max:255|unique:categories,name,' . $id,
            'description' => 'nullable|string',
        ]);

        $category->update([
            'name'        => $request->name,
            'slug'        => Str::slug($request->name) . '-' . $id,
            'description' => $request->description,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'ক্যাটাগরি সফলভাবে আপডেট করা হয়েছে।',
            'category'=> $category->fresh()->loadCount('courses'),
        ]);
    }

    public function destroyCategory($id)
    {
        $this->ensureAdmin();
        $category = Category::findOrFail($id);

        // disassociate courses
        Course::where('category_id', $category->id)->update(['category_id' => null]);

        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'ক্যাটাগরি মুছে ফেলা হয়েছে।',
        ]);
    }


    // ─────────────────────────────────────────
    // Users
    // ─────────────────────────────────────────

    public function users(Request $request)
    {
        $this->ensureAdmin();

        $query = User::withCount('enrollments');

        if ($request->filled('search')) {
            $q = $request->search;
            $query->where(function ($sq) use ($q) {
                $sq->where('name', 'like', "%{$q}%")
                   ->orWhere('email', 'like', "%{$q}%");
            });
        }

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        $users = $query->latest()->paginate(15);

        return response()->json([
            'success' => true,
            'users'   => $users,
        ]);
    }

    public function updateUser(Request $request, $id)
    {
        $this->ensureAdmin();
        $user = User::findOrFail($id);

        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|max:255|unique:users,email,' . $id,
            'phone'    => 'nullable|string|max:50',
            'role'     => 'required|in:admin,student',
            'password' => 'nullable|string|min:6',
        ]);

        $data = $request->only(['name', 'email', 'phone', 'role']);

        if ($request->filled('password')) {
            $data['password'] = bcrypt($request->password);
        }

        $user->update($data);

        return response()->json([
            'success' => true,
            'message' => 'ব্যবহারকারী সফলভাবে আপডেট করা হয়েছে।',
            'user'    => $user->fresh()->loadCount('enrollments'),
        ]);
    }

    public function deleteUser($id)
    {
        $this->ensureAdmin();
        $user = User::findOrFail($id);

        if ($user->id === Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'আপনি নিজেকে মুছে ফেলতে পারবেন না।',
            ], 400);
        }

        $user->enrollments()->delete();
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'ব্যবহারকারী মুছে ফেলা হয়েছে।',
        ]);
    }


    // ─────────────────────────────────────────
    // Enrollments
    // ─────────────────────────────────────────

    public function enrollments(Request $request)
    {
        $this->ensureAdmin();

        $query = Enrollment::with(['user:id,name,email', 'course:id,title,slug']);

        if ($request->filled('search')) {
            $q = $request->search;
            $query->whereHas('user', fn($u) => $u->where('name', 'like', "%{$q}%")
                ->orWhere('email', 'like', "%{$q}%"));
        }

        $enrollments = $query->latest()->paginate(15);

        return response()->json([
            'success'     => true,
            'enrollments' => $enrollments,
        ]);
    }

    public function enrollmentResources()
    {
        $this->ensureAdmin();
        $users = User::select('id', 'name', 'email')->orderBy('name')->get();
        $courses = Course::select('id', 'title')->orderBy('title')->get();
        return response()->json([
            'success' => true,
            'users'   => $users,
            'courses' => $courses
        ]);
    }

    public function storeEnrollment(Request $request)
    {
        $this->ensureAdmin();
        $request->validate([
            'user_id'   => 'required|exists:users,id',
            'course_id' => 'required|exists:courses,id',
        ]);

        // Check if already enrolled
        $exists = Enrollment::where('user_id', $request->user_id)
            ->where('course_id', $request->course_id)
            ->exists();

        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'এই শিক্ষার্থী ইতিমধ্যে এই কোর্সে ইনরোল করা আছেন।',
            ], 422);
        }

        $enrollment = Enrollment::create([
            'user_id'   => $request->user_id,
            'course_id' => $request->course_id,
            'status'    => 'active',
            'progress'  => 0,
        ]);

        return response()->json([
            'success'    => true,
            'message'    => 'ম্যানুয়াল ইনরোলমেন্ট সফল হয়েছে।',
            'enrollment' => $enrollment->load(['user:id,name,email', 'course:id,title,slug']),
        ]);
    }


    // ─────────────────────────────────────────
    // Payments
    // ─────────────────────────────────────────

    public function payments(Request $request)
    {
        $this->ensureAdmin();

        $query = Payment::with(['user:id,name,email', 'course:id,title']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $q = $request->search;
            $query->whereHas('user', fn($u) => $u->where('name', 'like', "%{$q}%")
                ->orWhere('email', 'like', "%{$q}%"));
        }

        $payments = $query->latest()->paginate(15);

        $summary = [
            'total'     => Payment::sum('amount'),
            'completed' => Payment::where('status', 'completed')->sum('amount'),
            'pending'   => Payment::where('status', 'pending')->count(),
        ];

        return response()->json([
            'success'  => true,
            'payments' => $payments,
            'summary'  => $summary,
        ]);
    }

    // ─────────────────────────────────────────
    // Support Tickets (Admin view)
    // ─────────────────────────────────────────

    public function tickets(Request $request)
    {
        $this->ensureAdmin();

        $query = SupportTicket::with([
            'user:id,name,email',
            'category:id,name,color',
        ])->withCount('replies');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $q = $request->search;
            $query->where(function ($sq) use ($q) {
                $sq->where('subject', 'like', "%{$q}%")
                   ->orWhere('ticket_number', 'like', "%{$q}%");
            });
        }

        $tickets = $query->latest()->paginate(15);

        $stats = [
            'open'        => SupportTicket::where('status', 'open')->count(),
            'in_progress' => SupportTicket::where('status', 'in_progress')->count(),
            'resolved'    => SupportTicket::where('status', 'resolved')->count(),
            'closed'      => SupportTicket::where('status', 'closed')->count(),
        ];

        return response()->json([
            'success' => true,
            'tickets' => $tickets,
            'stats'   => $stats,
        ]);
    }

    public function updateTicketStatus(Request $request, $id)
    {
        $this->ensureAdmin();

        $ticket = SupportTicket::findOrFail($id);
        $request->validate(['status' => 'required|in:open,in_progress,resolved,closed']);

        $data = ['status' => $request->status];
        if ($request->status === 'resolved') $data['resolved_at'] = now();
        if ($request->status === 'closed')   $data['closed_at']   = now();

        $ticket->update($data);

        return response()->json([
            'success' => true,
            'message' => 'স্ট্যাটাস আপডেট হয়েছে।',
            'ticket'  => $ticket->fresh(),
        ]);
    }

    public function replyTicket(Request $request, $id)
    {
        $this->ensureAdmin();

        $ticket = SupportTicket::findOrFail($id);
        $request->validate(['message' => 'required|string']);

        $reply = TicketReply::create([
            'ticket_id'      => $ticket->id,
            'user_id'        => Auth::id(),
            'message'        => $request->message,
            'is_admin_reply' => true,
        ]);

        $ticket->update(['last_reply_at' => now(), 'status' => 'in_progress']);

        return response()->json([
            'success' => true,
            'reply'   => $reply->load('user:id,name,avatar'),
        ]);
    }

    // ─────────────────────────────────────────
    // Curriculum — Chapters
    // ─────────────────────────────────────────

    public function getChapters($courseId)
    {
        $this->ensureAdmin();
        $chapters = Chapter::where('course_id', $courseId)
            ->with(['lessons' => fn($q) => $q->orderBy('sort_order')])
            ->orderBy('sort_order')
            ->get();

        return response()->json(['success' => true, 'chapters' => $chapters]);
    }

    public function storeChapter(Request $request, $courseId)
    {
        $this->ensureAdmin();
        $request->validate(['title' => 'required|string|max:255']);

        $maxOrder = Chapter::where('course_id', $courseId)->max('sort_order') ?? -1;

        $chapter = Chapter::create([
            'course_id'  => $courseId,
            'title'      => $request->title,
            'sort_order' => $maxOrder + 1,
        ]);

        return response()->json(['success' => true, 'chapter' => $chapter->load('lessons')]);
    }

    public function updateChapter(Request $request, $chapterId)
    {
        $this->ensureAdmin();
        $chapter = Chapter::findOrFail($chapterId);
        $chapter->update($request->only(['title', 'is_published']));

        return response()->json(['success' => true, 'chapter' => $chapter]);
    }

    public function deleteChapter($chapterId)
    {
        $this->ensureAdmin();
        $chapter = Chapter::findOrFail($chapterId);
        $chapter->lessons()->delete();
        $chapter->delete();

        return response()->json(['success' => true]);
    }

    public function reorderChapters(Request $request, $courseId)
    {
        $this->ensureAdmin();
        foreach ($request->order as $item) {
            Chapter::where('id', $item['id'])->where('course_id', $courseId)
                ->update(['sort_order' => $item['sort_order']]);
        }
        return response()->json(['success' => true]);
    }

    // ─────────────────────────────────────────
    // Curriculum — Lessons
    // ─────────────────────────────────────────

    public function storeLessonInChapter(Request $request, $chapterId)
    {
        $this->ensureAdmin();
        $request->validate([
            'title' => 'required|string|max:255',
            'type'  => 'required|in:video,text,file',
        ]);

        $maxOrder = Lesson::where('chapter_id', $chapterId)->max('sort_order') ?? -1;

        $lesson = Lesson::create([
            'chapter_id'  => $chapterId,
            'title'       => $request->title,
            'type'        => $request->type,
            'slug'        => Str::uuid(),
            'video_url'   => $request->video_url ?? null,
            'content'     => $request->content ?? null,
            'description' => $request->description ?? null,
            'duration'    => $request->duration ?? null,
            'is_published'=> $request->boolean('is_published', false),
            'is_preview'  => $request->boolean('is_preview', false),
            'sort_order'  => $maxOrder + 1,
        ]);

        return response()->json(['success' => true, 'lesson' => $lesson]);
    }

    public function updateLesson(Request $request, $lessonId)
    {
        $this->ensureAdmin();
        $lesson = Lesson::findOrFail($lessonId);
        $lesson->update([
            'title'       => $request->title       ?? $lesson->title,
            'type'        => $request->type        ?? $lesson->type,
            'video_url'   => $request->video_url   ?? $lesson->video_url,
            'content'     => $request->content     ?? $lesson->content,
            'description' => $request->description ?? $lesson->description,
            'duration'    => $request->duration    ?? $lesson->duration,
            'is_published'=> $request->boolean('is_published', $lesson->is_published),
            'is_preview'  => $request->boolean('is_preview', $lesson->is_preview),
        ]);

        return response()->json(['success' => true, 'lesson' => $lesson]);
    }

    public function deleteLesson($lessonId)
    {
        $this->ensureAdmin();
        Lesson::findOrFail($lessonId)->delete();
        return response()->json(['success' => true]);
    }

    public function reorderLessons(Request $request, $chapterId)
    {
        $this->ensureAdmin();
        foreach ($request->order as $item) {
            Lesson::where('id', $item['id'])->where('chapter_id', $chapterId)
                ->update(['sort_order' => $item['sort_order']]);
        }
        return response()->json(['success' => true]);
    }
}
