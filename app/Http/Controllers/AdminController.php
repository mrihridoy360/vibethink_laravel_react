<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\Course;
use App\Models\Category;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Chapter;
use App\Models\Lesson;
use App\Models\User;
use App\Models\Enrollment;
use App\Models\Payment;
use App\Models\PaymentGateway;
use App\Models\Coupon;
use App\Models\CouponUsage;
use App\Models\ErrorLog;
use App\Models\Announcement;
use App\Models\Gift;
use App\Models\SocialReview;
use App\Models\SupportTicket;
use App\Models\TicketCategory;
use App\Models\TicketReply;
use App\Models\Tool;
use App\Models\ToolCategory;
use App\Models\Product;
use App\Models\ProductOrder;
use App\Models\ReferralSetting;
use App\Models\ReferralUser;
use App\Models\ReferralCommission;
use App\Models\UserWallet;
use App\Models\WalletTransaction;
use App\Models\BlogPost;
use App\Models\BlogCategory;
use App\Models\BlogTag;
use App\Models\Review;
use App\Models\Setting;
use App\Services\CloudinaryService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

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

        // Fetch visitor stats from settings
        $analyticsSetting = Setting::where('key', 'visitor_analytics')->first();
        $analytics = $analyticsSetting ? json_decode($analyticsSetting->value, true) : null;
        if (!$analytics) {
            $analytics = [
                'total_pageviews' => 0,
                'total_uniques' => 0,
                'referrers' => [],
                'countries' => [],
                'daily' => []
            ];
        }

        // Get currently online count and list
        $online = Cache::get('online_visitors', []);
        $now = time();
        $online = array_filter($online, function($v) use ($now) {
            return $v['last_seen'] >= ($now - 300);
        });
        
        $onlineCount = count($online);

        $onlineList = [];
        foreach ($online as $ip => $details) {
            // Anonymize IP address for security & compliance (e.g. 192.168.1.100 -> 192.168.*.*)
            $maskedIp = preg_replace('/(\d+)\.(\d+)\.(\d+)\.(\d+)/', '$1.$2.*.*', $ip);
            // If IPv6
            if (str_contains($ip, ':')) {
                $parts = explode(':', $ip);
                $maskedIp = count($parts) > 2 ? $parts[0] . ':' . $parts[1] . ':*:*:*:*' : $ip;
            }

            $onlineList[] = [
                'ip'        => $maskedIp,
                'url'       => $details['url'] ?? '/',
                'referrer'  => $details['referrer'] ?? 'Direct',
                'country'   => $details['country'] ?? 'Unknown',
                'user_name' => $details['user_name'] ?? 'Guest',
                'last_seen' => $details['last_seen']
            ];
        }
        
        // Sort by last seen descending
        usort($onlineList, function($a, $b) {
            return $b['last_seen'] - $a['last_seen'];
        });

        // Top Referrers
        $referrersList = [];
        if (!empty($analytics['referrers'])) {
            arsort($analytics['referrers']);
            foreach (array_slice($analytics['referrers'], 0, 10, true) as $ref => $count) {
                $referrersList[] = ['name' => $ref, 'count' => $count];
            }
        }

        // Top Countries
        $countriesList = [];
        if (!empty($analytics['countries'])) {
            arsort($analytics['countries']);
            foreach (array_slice($analytics['countries'], 0, 10, true) as $cCode => $count) {
                $countriesList[] = ['code' => $cCode, 'count' => $count];
            }
        }

        $visitorStats = [
            'total_pageviews' => $analytics['total_pageviews'] ?? 0,
            'total_uniques'   => $analytics['total_uniques'] ?? 0,
            'referrers'       => $referrersList,
            'countries'       => $countriesList,
            'daily'           => $analytics['daily'] ?? new \stdClass(),
            'online_count'    => $onlineCount,
            'online_list'     => $onlineList
        ];

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
            'visitor_stats'   => $visitorStats,
        ]);
    }

    public function systemInfo()
    {
        $this->ensureAdmin();

        return response()->json([
            'success' => true,
            'info' => [
                'php_version' => PHP_VERSION,
                'laravel_version' => app()->version(),
                'server_os' => PHP_OS,
                'db_driver' => config('database.default'),
                'cache_driver' => config('cache.default'),
                'mail_mailer' => config('mail.default'),
                'app_env' => config('app.env'),
                'debug_mode' => config('app.debug') ? 'ON' : 'OFF',
            ]
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

        if ($course->is_published) {
            $this->notifyCourseLeads($course);
        }

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
            'description'       => 'nullable|string',
            'language'          => 'nullable|string|max:50',
            'price'             => 'nullable|numeric|min:0',
            'discount_price'    => 'nullable|numeric|min:0',
            'is_published'      => 'boolean',
            'money_back_days'   => 'nullable|integer|min:0',
            'lifetime_access'   => 'boolean',
            'thumbnail'         => 'nullable|image|max:4096',
            'what_youll_learn'  => 'nullable|string',
            'requirements'      => 'nullable|string',
            'audience'          => 'nullable|string',
            'this_course_includes' => 'nullable|string',
            'problems'          => 'nullable|string',
            'solutions'         => 'nullable|string',
            'faq'               => 'nullable|string',
            'section_titles'    => 'nullable|string',
        ]);

        $data = [
            'user_id'           => Auth::id(),
            'title'             => $request->title,
            'slug'              => Str::slug($request->title) . '-' . uniqid(),
            'category_id'       => $request->category_id ?: null,
            'short_description' => $request->short_description,
            'description'       => $request->description,
            'language'          => $request->language ?? 'Bengali',
            'price'             => $request->price ?? 0,
            'discount_price'    => $request->discount_price ?? null,
            'is_published'      => $request->boolean('is_published', false),
            'money_back_days'   => $request->input('money_back_days', 0) ?: 0,
            'lifetime_access'   => $request->boolean('lifetime_access', false),
        ];

        // Process JSON arrays
        $jsonFields = ['what_youll_learn', 'requirements', 'audience', 'this_course_includes', 'problems', 'solutions', 'faq', 'section_titles'];
        foreach ($jsonFields as $field) {
            if ($request->has($field)) {
                $decoded = json_decode($request->input($field), true);
                $data[$field] = is_array($decoded) ? $decoded : null;
            }
        }

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
            'title'                => 'required|string|max:255',
            'slug'                 => 'nullable|string|max:255|unique:courses,slug,' . $id,
            'category_id'          => 'nullable|integer',
            'short_description'    => 'nullable|string',
            'description'          => 'nullable|string',
            'language'             => 'nullable|string|max:50',
            'price'                => 'nullable|numeric|min:0',
            'discount_price'       => 'nullable|numeric|min:0',
            'is_published'         => 'boolean',
            'money_back_days'      => 'nullable|integer|min:0',
            'lifetime_access'      => 'boolean',
            'thumbnail'            => 'nullable|image|max:4096',
            'seo_title'            => 'nullable|string|max:255',
            'seo_description'      => 'nullable|string',
            'seo_image'            => 'nullable|image|max:4096',
            'instructor_image'     => 'nullable|image|max:4096',
            'what_youll_learn'     => 'nullable|string',
            'requirements'         => 'nullable|string',
            'audience'             => 'nullable|string',
            'this_course_includes' => 'nullable|string',
            'problems'             => 'nullable|string',
            'solutions'           => 'nullable|string',
            'faq'                 => 'nullable|string',
            'section_titles'      => 'nullable|string',
        ]);

        $data = [
            'title'             => $request->title,
            'slug'              => $request->slug ?: (Str::slug($request->title) . '-' . $id),
            'category_id'       => $request->category_id ?: null,
            'short_description' => $request->short_description,
            'description'       => $request->description,
            'language'          => $request->language ?? 'Bengali',
            'price'             => $request->price ?? 0,
            'discount_price'    => $request->discount_price ?? null,
            'is_published'      => $request->boolean('is_published', false),
            'money_back_days'   => $request->input('money_back_days', 0) ?: 0,
            'lifetime_access'   => $request->boolean('lifetime_access', false),
            'seo_title'         => $request->seo_title,
            'seo_description'   => $request->seo_description,
        ];

        // Process JSON arrays
        $jsonFields = ['what_youll_learn', 'requirements', 'audience', 'this_course_includes', 'problems', 'solutions', 'faq', 'section_titles'];
        foreach ($jsonFields as $field) {
            if ($request->has($field)) {
                $decoded = json_decode($request->input($field), true);
                $data[$field] = is_array($decoded) ? $decoded : null;
            }
        }

        $cloudinary = new CloudinaryService();

        // Process Thumbnail
        if ($request->hasFile('thumbnail')) {
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

        // Process SEO Image
        if ($request->hasFile('seo_image')) {
            // Delete old Cloudinary seo_image if exists
            if ($course->seo_image && $cloudinary->isCloudinaryUrl($course->seo_image)) {
                $publicId = $cloudinary->extractPublicId($course->seo_image);
                if ($publicId) $cloudinary->deleteImage($publicId);
            }

            $result = $cloudinary->uploadThumbnail($request->file('seo_image'));
            if ($result) {
                $data['seo_image'] = $result['url'];
            }
        }

        // Process Instructor Image
        if ($request->hasFile('instructor_image')) {
            // Get current section titles from $data or fallback to database
            $sectionTitles = isset($data['section_titles']) ? $data['section_titles'] : ($course->section_titles ?? []);

            // Delete old Cloudinary instructor image if exists
            $oldInstructorImage = $sectionTitles['instructor_image'] ?? null;
            if ($oldInstructorImage && $cloudinary->isCloudinaryUrl($oldInstructorImage)) {
                $publicId = $cloudinary->extractPublicId($oldInstructorImage);
                if ($publicId) $cloudinary->deleteImage($publicId);
            }

            $result = $cloudinary->uploadThumbnail($request->file('instructor_image'));
            if ($result) {
                $sectionTitles['instructor_image'] = $result['url'];
                $data['section_titles'] = $sectionTitles;
            }
        }

        $oldIsPublished = $course->is_published;
        $course->update($data);

        if (!$oldIsPublished && $course->is_published) {
            $this->notifyCourseLeads($course);
        }

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

    public function cancelEnrollment($id)
    {
        $this->ensureAdmin();

        $enrollment = Enrollment::find($id);

        if (!$enrollment) {
            return response()->json([
                'success' => false,
                'message' => 'ইনরোলমেন্টটি পাওয়া যায়নি।',
            ], 404);
        }

        $enrollment->delete();

        return response()->json([
            'success' => true,
            'message' => 'ইনরোলমেন্টটি সফলভাবে বাতিল করা হয়েছে।',
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

    // ─────────────────────────────────────────
    // Assignments
    // ─────────────────────────────────────────

    public function assignments(Request $request)
    {
        $this->ensureAdmin();

        $query = Assignment::with(['lesson.chapter.course'])->withCount('submissions');

        if ($request->filled('search')) {
            $q = $request->search;
            $query->whereHas('lesson', function($l) use ($q) {
                $l->where('title', 'like', "%{$q}%")
                  ->orWhereHas('chapter.course', function($c) use ($q) {
                      $c->where('title', 'like', "%{$q}%");
                  });
            });
        }

        $assignments = $query->latest()->paginate(15);

        return response()->json([
            'success'     => true,
            'assignments' => $assignments,
        ]);
    }

    public function getLessonsForAssignment($courseId)
    {
        $this->ensureAdmin();
        
        $lessons = Lesson::whereHas('chapter', function($c) use ($courseId) {
                $c->where('course_id', $courseId);
            })
            ->whereDoesntHave('assignment')
            ->orderBy('sort_order')
            ->select('id', 'title')
            ->get();

        return response()->json([
            'success' => true,
            'lessons' => $lessons,
        ]);
    }

    public function storeAssignment(Request $request)
    {
        $this->ensureAdmin();

        $request->validate([
            'lesson_id'        => 'required|exists:lessons,id|unique:assignments,lesson_id',
            'total_points'     => 'required|integer|min:1',
            'due_date'         => 'nullable|date',
            'file_requirement' => 'required|in:required,optional,none',
        ]);

        $assignment = Assignment::create($request->only([
            'lesson_id', 'total_points', 'due_date', 'file_requirement'
        ]));

        return response()->json([
            'success'    => true,
            'message'    => 'এসাইনমেন্ট তৈরি করা হয়েছে।',
            'assignment' => $assignment->load('lesson.chapter.course')->loadCount('submissions'),
        ]);
    }

    public function updateAssignment(Request $request, $id)
    {
        $this->ensureAdmin();
        $assignment = Assignment::findOrFail($id);

        $request->validate([
            'total_points'     => 'required|integer|min:1',
            'due_date'         => 'nullable|date',
            'file_requirement' => 'required|in:required,optional,none',
        ]);

        $assignment->update($request->only([
            'total_points', 'due_date', 'file_requirement'
        ]));

        return response()->json([
            'success'    => true,
            'message'    => 'এসাইনমেন্ট আপডেট সম্পন্ন হয়েছে।',
            'assignment' => $assignment->fresh()->load('lesson.chapter.course')->loadCount('submissions'),
        ]);
    }

    public function destroyAssignment($id)
    {
        $this->ensureAdmin();
        $assignment = Assignment::findOrFail($id);
        
        $assignment->submissions()->delete();
        $assignment->delete();

        return response()->json([
            'success' => true,
            'message' => 'এসাইনমেন্ট এবং এর সাবমিশনগুলো মুছে ফেলা হয়েছে।',
        ]);
    }

    // ─────────────────────────────────────────
    // Submissions & Grading
    // ─────────────────────────────────────────

    public function getSubmissions(Request $request)
    {
        $this->ensureAdmin();

        $query = AssignmentSubmission::with(['user:id,name,email', 'assignment.lesson.chapter.course']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('assignment_id')) {
            $query->where('assignment_id', $request->assignment_id);
        }

        if ($request->filled('search')) {
            $q = $request->search;
            $query->whereHas('user', function($u) use ($q) {
                $u->where('name', 'like', "%{$q}%")
                  ->orWhere('email', 'like', "%{$q}%");
            });
        }

        $submissions = $query->latest()->paginate(15);

        return response()->json([
            'success'     => true,
            'submissions' => $submissions,
        ]);
    }

    public function gradeSubmission(Request $request, $id)
    {
        $this->ensureAdmin();
        $submission = AssignmentSubmission::with('assignment')->findOrFail($id);

        $request->validate([
            'grade'    => 'required|integer|min:0|max:' . $submission->assignment->total_points,
            'feedback' => 'nullable|string',
            'status'   => 'required|in:graded,passed,rejected,returned',
        ]);

        $submission->update([
            'grade'    => $request->grade,
            'feedback' => $request->feedback,
            'status'   => $request->status,
        ]);

        return response()->json([
            'success'    => true,
            'message'    => 'এসাইনমেন্ট সফলভাবে গ্রেড করা হয়েছে।',
            'submission' => $submission->fresh()->load(['user:id,name,email', 'assignment.lesson.chapter.course']),
        ]);
    }

    // ─────────────────────────────────────────
    // Payment Gateways
    // ─────────────────────────────────────────

    public function paymentGateways(Request $request)
    {
        $this->ensureAdmin();
        $gateways = PaymentGateway::orderBy('sort_order')->get();
        return response()->json([
            'success'  => true,
            'gateways' => $gateways,
        ]);
    }

    public function storePaymentGateway(Request $request)
    {
        $this->ensureAdmin();

        $request->validate([
            'name'        => 'required|string|max:255',
            'type'        => 'required|in:automatic,manual',
            'mode'        => 'required|in:live,sandbox',
            'config'      => 'nullable|array',
            'description' => 'nullable|string',
            'is_active'   => 'required|boolean',
            'sort_order'  => 'nullable|integer',
        ]);

        $gateway = PaymentGateway::create([
            'name'        => $request->name,
            'key'         => Str::slug($request->name) . '-' . uniqid(),
            'type'        => $request->type,
            'mode'        => $request->mode,
            'config'      => $request->config ?? [],
            'description' => $request->description,
            'is_active'   => $request->is_active,
            'sort_order'  => $request->sort_order ?? 0,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'পেমেন্ট গেটওয়ে সফলভাবে তৈরি করা হয়েছে।',
            'gateway' => $gateway,
        ]);
    }

    public function updatePaymentGateway(Request $request, $id)
    {
        $this->ensureAdmin();
        $gateway = PaymentGateway::findOrFail($id);

        $request->validate([
            'name'        => 'required|string|max:255',
            'mode'        => 'required|in:live,sandbox',
            'config'      => 'nullable|array',
            'description' => 'nullable|string',
            'is_active'   => 'required|boolean',
            'sort_order'  => 'nullable|integer',
        ]);

        $gateway->update([
            'name'        => $request->name,
            'mode'        => $request->mode,
            'config'      => $request->config ?? [],
            'description' => $request->description,
            'is_active'   => $request->is_active,
            'sort_order'  => $request->sort_order ?? 0,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'পেমেন্ট গেটওয়ে আপডেট সম্পন্ন হয়েছে।',
            'gateway' => $gateway->fresh(),
        ]);
    }

    public function destroyPaymentGateway($id)
    {
        $this->ensureAdmin();
        $gateway = PaymentGateway::findOrFail($id);
        $gateway->delete();

        return response()->json([
            'success' => true,
            'message' => 'পেমেন্ট গেটওয়ে মুছে ফেলা হয়েছে।',
        ]);
    }

    // ─────────────────────────────────────────
    // Coupons
    // ─────────────────────────────────────────

    public function coupons(Request $request)
    {
        $this->ensureAdmin();

        $query = Coupon::query();

        if ($request->filled('search')) {
            $q = $request->search;
            $query->where('code', 'like', "%{$q}%")
                  ->orWhere('name', 'like', "%{$q}%");
        }

        $coupons = $query->latest()->paginate(15);

        return response()->json([
            'success' => true,
            'coupons' => $coupons,
        ]);
    }

    public function storeCoupon(Request $request)
    {
        $this->ensureAdmin();

        $request->validate([
            'code'                  => 'required|string|max:255|unique:coupons,code',
            'name'                  => 'nullable|string|max:255',
            'description'           => 'nullable|string',
            'type'                  => 'required|in:percentage,fixed',
            'value'                 => 'required|numeric|min:0',
            'min_purchase'          => 'nullable|numeric|min:0',
            'max_discount'          => 'nullable|numeric|min:0',
            'usage_limit'           => 'nullable|integer|min:1',
            'usage_limit_per_user'  => 'required|integer|min:1',
            'applicable_courses'    => 'nullable|array',
            'applicable_categories' => 'nullable|array',
            'starts_at'             => 'nullable|date',
            'expires_at'            => 'nullable|date|after_or_equal:starts_at',
            'is_active'             => 'required|boolean',
        ]);

        $coupon = Coupon::create($request->only([
            'code', 'name', 'description', 'type', 'value', 'min_purchase', 'max_discount',
            'usage_limit', 'usage_limit_per_user', 'applicable_courses', 'applicable_categories',
            'starts_at', 'expires_at', 'is_active'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'কুপন সফলভাবে তৈরি করা হয়েছে।',
            'coupon'  => $coupon,
        ]);
    }

    public function updateCoupon(Request $request, $id)
    {
        $this->ensureAdmin();
        $coupon = Coupon::findOrFail($id);

        $request->validate([
            'code'                  => 'required|string|max:255|unique:coupons,code,' . $id,
            'name'                  => 'nullable|string|max:255',
            'description'           => 'nullable|string',
            'type'                  => 'required|in:percentage,fixed',
            'value'                 => 'required|numeric|min:0',
            'min_purchase'          => 'nullable|numeric|min:0',
            'max_discount'          => 'nullable|numeric|min:0',
            'usage_limit'           => 'nullable|integer|min:1',
            'usage_limit_per_user'  => 'required|integer|min:1',
            'applicable_courses'    => 'nullable|array',
            'applicable_categories' => 'nullable|array',
            'starts_at'             => 'nullable|date',
            'expires_at'            => 'nullable|date|after_or_equal:starts_at',
            'is_active'             => 'required|boolean',
        ]);

        $coupon->update($request->only([
            'code', 'name', 'description', 'type', 'value', 'min_purchase', 'max_discount',
            'usage_limit', 'usage_limit_per_user', 'applicable_courses', 'applicable_categories',
            'starts_at', 'expires_at', 'is_active'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'কুপন আপডেট সম্পন্ন হয়েছে।',
            'coupon'  => $coupon->fresh(),
        ]);
    }

    public function destroyCoupon($id)
    {
        $this->ensureAdmin();
        $coupon = Coupon::findOrFail($id);
        $coupon->delete();

        return response()->json([
            'success' => true,
            'message' => 'কুপন মুছে ফেলা হয়েছে।',
        ]);
    }

    // ─────────────────────────────────────────
    // Error Logs
    // ─────────────────────────────────────────

    public function errorLogs(Request $request)
    {
        $this->ensureAdmin();

        $query = ErrorLog::with(['user:id,name,email', 'resolver:id,name']);

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('severity')) {
            $query->where('severity', $request->severity);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $q = $request->search;
            $query->where(function($sub) use ($q) {
                $sub->where('message', 'like', "%{$q}%")
                    ->orWhere('file', 'like', "%{$q}%")
                    ->orWhere('error_code', 'like', "%{$q}%")
                    ->orWhere('user_email', 'like', "%{$q}%")
                    ->orWhere('url', 'like', "%{$q}%");
            });
        }

        $logs = $query->latest('id')->paginate(15);

        return response()->json([
            'success' => true,
            'logs'    => $logs,
        ]);
    }

    public function updateErrorLog(Request $request, $id)
    {
        $this->ensureAdmin();
        $log = ErrorLog::findOrFail($id);

        $request->validate([
            'status'           => 'required|in:new,investigating,resolved,ignored',
            'resolution_notes' => 'nullable|string',
        ]);

        $updateData = [
            'status'           => $request->status,
            'resolution_notes' => $request->resolution_notes,
        ];

        if ($request->status === 'resolved') {
            $updateData['resolved_by'] = Auth::id();
            $updateData['resolved_at'] = now();
        } else {
            $updateData['resolved_by'] = null;
            $updateData['resolved_at'] = null;
        }

        $log->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'এরর লগ আপডেট সম্পন্ন হয়েছে।',
            'log'     => $log->fresh()->load(['user:id,name,email', 'resolver:id,name']),
        ]);
    }

    public function destroyErrorLog($id)
    {
        $this->ensureAdmin();
        $log = ErrorLog::findOrFail($id);
        $log->delete();

        return response()->json([
            'success' => true,
            'message' => 'এরর লগ মুছে ফেলা হয়েছে।',
        ]);
    }

    public function clearErrorLogs()
    {
        $this->ensureAdmin();
        ErrorLog::truncate();

        return response()->json([
            'success' => true,
            'message' => 'সব এরর লগ সফলভাবে সাফ করা হয়েছে।',
        ]);
    }

    public function bulkDestroyErrorLogs(Request $request)
    {
        $this->ensureAdmin();
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:error_logs,id'
        ]);

        ErrorLog::whereIn('id', $request->ids)->delete();

        return response()->json([
            'success' => true,
            'message' => 'নির্বাচিত এরর লগসমূহ মুছে ফেলা হয়েছে।',
        ]);
    }

    // ─────────────────────────────────────────
    // Announcements
    // ─────────────────────────────────────────

    public function announcements(Request $request)
    {
        $this->ensureAdmin();

        $query = Announcement::with(['creator:id,name,email', 'course:id,title']);

        if ($request->filled('search')) {
            $q = $request->search;
            $query->where(function($sub) use ($q) {
                $sub->where('title', 'like', "%{$q}%")
                    ->orWhere('content', 'like', "%{$q}%");
            });
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        $announcements = $query->latest('is_pinned')->latest('id')->paginate(15);

        return response()->json([
            'success'       => true,
            'announcements' => $announcements,
        ]);
    }

    public function announcementResources()
    {
        $this->ensureAdmin();

        $courses = Course::select('id', 'title')->get();

        return response()->json([
            'success' => true,
            'courses' => $courses,
        ]);
    }

    public function storeAnnouncement(Request $request)
    {
        $this->ensureAdmin();

        $request->validate([
            'title'      => 'required|string|max:255',
            'content'    => 'required|string',
            'type'       => 'required|in:info,warning,success,danger',
            'priority'   => 'required|in:low,normal,high,urgent',
            'is_active'  => 'required|boolean',
            'is_pinned'  => 'required|boolean',
            'expires_at' => 'nullable|date',
            'course_id'  => 'nullable|exists:courses,id',
        ]);

        $announcement = Announcement::create([
            'title'      => $request->title,
            'content'    => $request->content,
            'type'       => $request->type,
            'priority'   => $request->priority,
            'is_active'  => $request->is_active,
            'is_pinned'  => $request->is_pinned,
            'expires_at' => $request->expires_at,
            'course_id'  => $request->course_id,
            'created_by' => Auth::id(),
        ]);

        return response()->json([
            'success'      => true,
            'message'      => 'ঘোষণা সফলভাবে প্রকাশ করা হয়েছে।',
            'announcement' => $announcement->load(['creator:id,name,email', 'course:id,title']),
        ]);
    }

    public function updateAnnouncement(Request $request, $id)
    {
        $this->ensureAdmin();
        $announcement = Announcement::findOrFail($id);

        $request->validate([
            'title'      => 'required|string|max:255',
            'content'    => 'required|string',
            'type'       => 'required|in:info,warning,success,danger',
            'priority'   => 'required|in:low,normal,high,urgent',
            'is_active'  => 'required|boolean',
            'is_pinned'  => 'required|boolean',
            'expires_at' => 'nullable|date',
            'course_id'  => 'nullable|exists:courses,id',
        ]);

        $announcement->update([
            'title'      => $request->title,
            'content'    => $request->content,
            'type'       => $request->type,
            'priority'   => $request->priority,
            'is_active'  => $request->is_active,
            'is_pinned'  => $request->is_pinned,
            'expires_at' => $request->expires_at,
            'course_id'  => $request->course_id,
        ]);

        return response()->json([
            'success'      => true,
            'message'      => 'ঘোষণা আপডেট সম্পন্ন হয়েছে।',
            'announcement' => $announcement->fresh()->load(['creator:id,name,email', 'course:id,title']),
        ]);
    }

    public function destroyAnnouncement($id)
    {
        $this->ensureAdmin();
        $announcement = Announcement::findOrFail($id);
        $announcement->delete();

        return response()->json([
            'success' => true,
            'message' => 'ঘোষণাটি মুছে ফেলা হয়েছে।',
        ]);
    }

    // ─────────────────────────────────────────
    // Gifts
    // ─────────────────────────────────────────

    public function gifts(Request $request)
    {
        $this->ensureAdmin();

        $query = Gift::with('creator:id,name,email');

        if ($request->filled('search')) {
            $q = $request->search;
            $query->where(function($sub) use ($q) {
                $sub->where('title', 'like', "%{$q}%")
                    ->orWhere('description', 'like', "%{$q}%")
                    ->orWhere('code', 'like', "%{$q}%");
            });
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        if ($request->filled('is_locked')) {
            $query->where('is_locked', $request->is_locked);
        }

        $gifts = $query->latest('id')->paginate(15);

        return response()->json([
            'success' => true,
            'gifts'   => $gifts,
        ]);
    }

    public function storeGift(Request $request)
    {
        $this->ensureAdmin();

        $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'required|string',
            'code'        => 'nullable|string|max:255',
            'priority'    => 'required|in:low,normal,high,urgent',
            'is_active'   => 'required|boolean',
            'is_locked'   => 'required|boolean',
            'expires_at'  => 'nullable|date',
            'image'       => 'nullable|image|max:4096',
        ]);

        $data = [
            'title'       => $request->title,
            'description' => $request->description,
            'code'        => $request->code,
            'priority'    => $request->priority,
            'is_active'   => $request->is_active,
            'is_locked'   => $request->is_locked,
            'expires_at'  => $request->expires_at,
            'created_by'  => Auth::id(),
        ];

        if ($request->hasFile('image')) {
            $cloudinary = new CloudinaryService();
            $result = $cloudinary->uploadImage($request->file('image'), 'gifts');
            if ($result) {
                $data['image'] = $result['url'];
            }
        }

        $gift = Gift::create($data);

        return response()->json([
            'success' => true,
            'message' => 'গিফট সফলভাবে তৈরি করা হয়েছে।',
            'gift'    => $gift->load('creator:id,name,email'),
        ]);
    }

    public function updateGift(Request $request, $id)
    {
        $this->ensureAdmin();
        $gift = Gift::findOrFail($id);

        $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'required|string',
            'code'        => 'nullable|string|max:255',
            'priority'    => 'required|in:low,normal,high,urgent',
            'is_active'   => 'required|boolean',
            'is_locked'   => 'required|boolean',
            'expires_at'  => 'nullable|date',
            'image'       => 'nullable|image|max:4096',
        ]);

        $data = [
            'title'       => $request->title,
            'description' => $request->description,
            'code'        => $request->code,
            'priority'    => $request->priority,
            'is_active'   => $request->is_active,
            'is_locked'   => $request->is_locked,
            'expires_at'  => $request->expires_at,
        ];

        if ($request->hasFile('image')) {
            $cloudinary = new CloudinaryService();

            // delete old image if exists
            if ($gift->image && $cloudinary->isCloudinaryUrl($gift->image)) {
                $publicId = $cloudinary->extractPublicId($gift->image);
                if ($publicId) $cloudinary->deleteImage($publicId);
            }

            $result = $cloudinary->uploadImage($request->file('image'), 'gifts');
            if ($result) {
                $data['image'] = $result['url'];
            }
        }

        $gift->update($data);

        return response()->json([
            'success' => true,
            'message' => 'গিফট আপডেট সম্পন্ন হয়েছে।',
            'gift'    => $gift->fresh()->load('creator:id,name,email'),
        ]);
    }

    public function destroyGift($id)
    {
        $this->ensureAdmin();
        $gift = Gift::findOrFail($id);

        // delete old image if exists
        if ($gift->image) {
            $cloudinary = new CloudinaryService();
            if ($cloudinary->isCloudinaryUrl($gift->image)) {
                $publicId = $cloudinary->extractPublicId($gift->image);
                if ($publicId) $cloudinary->deleteImage($publicId);
            }
        }

        $gift->delete();

        return response()->json([
            'success' => true,
            'message' => 'গিফট মুছে ফেলা হয়েছে।',
        ]);
    }

    // ─────────────────────────────────────────
    // Social Reviews
    // ─────────────────────────────────────────

    public function socialReviews(Request $request)
    {
        $this->ensureAdmin();

        $query = SocialReview::with('user:id,name,email');

        if ($request->filled('search')) {
            $q = $request->search;
            $query->where(function($sub) use ($q) {
                $sub->where('review_url', 'like', "%{$q}%")
                    ->orWhereHas('user', function($uQuery) use ($q) {
                        $uQuery->where('name', 'like', "%{$q}%")
                               ->orWhere('email', 'like', "%{$q}%");
                    });
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $reviews = $query->latest('id')->paginate(15);

        return response()->json([
            'success' => true,
            'reviews' => $reviews,
        ]);
    }

    public function updateSocialReview(Request $request, $id)
    {
        $this->ensureAdmin();
        $review = SocialReview::findOrFail($id);

        $request->validate([
            'status'         => 'required|in:pending,approved,rejected',
            'admin_feedback' => 'nullable|string',
        ]);

        $review->update([
            'status'         => $request->status,
            'admin_feedback' => $request->admin_feedback,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'সোশ্যাল রিভিউ স্ট্যাটাস আপডেট করা হয়েছে।',
            'review'  => $review->fresh()->load('user:id,name,email'),
        ]);
    }

    public function destroySocialReview($id)
    {
        $this->ensureAdmin();
        $review = SocialReview::findOrFail($id);
        $review->delete();

        return response()->json([
            'success' => true,
            'message' => 'সোশ্যাল রিভিউ মুছে ফেলা হয়েছে।',
        ]);
    }

    // ─────────────────────────────────────────
    // Tool Categories Management
    // ─────────────────────────────────────────

    public function toolCategories(Request $request)
    {
        $this->ensureAdmin();

        $query = ToolCategory::withCount('tools');

        if ($request->filled('search')) {
            $q = $request->search;
            $query->where('name', 'like', "%{$q}%")
                  ->orWhere('description', 'like', "%{$q}%");
        }

        $categories = $query->orderBy('order', 'asc')->orderBy('id', 'desc')->get();

        return response()->json([
            'success' => true,
            'categories' => $categories,
        ]);
    }

    public function storeToolCategory(Request $request)
    {
        $this->ensureAdmin();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|unique:tool_categories,slug',
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:255',
            'color' => 'required|string|max:7',
            'order' => 'nullable|integer',
            'is_active' => 'boolean',
        ]);

        $category = ToolCategory::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'টুলস ক্যাটাগরি সফলভাবে তৈরি করা হয়েছে।',
            'category' => $category,
        ]);
    }

    public function updateToolCategory(Request $request, $id)
    {
        $this->ensureAdmin();
        $category = ToolCategory::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|unique:tool_categories,slug,' . $id,
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:255',
            'color' => 'required|string|max:7',
            'order' => 'nullable|integer',
            'is_active' => 'boolean',
        ]);

        $category->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'টুলস ক্যাটাগরি সফলভাবে আপডেট করা হয়েছে।',
            'category' => $category->fresh(),
        ]);
    }

    public function destroyToolCategory($id)
    {
        $this->ensureAdmin();
        $category = ToolCategory::findOrFail($id);

        // Delete associated tools
        $tools = $category->tools;
        $cloudinary = new CloudinaryService();
        foreach ($tools as $tool) {
            // Delete icon from Cloudinary if exists
            if ($tool->icon && $cloudinary->isCloudinaryUrl($tool->icon)) {
                $publicId = $cloudinary->extractPublicId($tool->icon);
                if ($publicId) {
                    $cloudinary->deleteImage($publicId);
                }
            }

            // Delete thumbnail from Cloudinary if exists
            if ($tool->thumbnail && $cloudinary->isCloudinaryUrl($tool->thumbnail)) {
                $publicId = $cloudinary->extractPublicId($tool->thumbnail);
                if ($publicId) {
                    $cloudinary->deleteImage($publicId);
                }
            }
            $tool->delete();
        }

        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'টুলস ক্যাটাগরি এবং এর অধীনস্থ সকল টুলস সফলভাবে মুছে ফেলা হয়েছে।',
        ]);
    }

    // ─────────────────────────────────────────
    // Tools Management
    // ─────────────────────────────────────────

    public function adminTools(Request $request)
    {
        $this->ensureAdmin();

        $query = Tool::with('category');

        if ($request->filled('search')) {
            $q = $request->search;
            $query->where('name', 'like', "%{$q}%")
                  ->orWhere('description', 'like', "%{$q}%")
                  ->orWhere('url', 'like', "%{$q}%");
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $tools = $query->orderBy('order', 'asc')->orderBy('id', 'desc')->paginate(15);

        return response()->json([
            'success' => true,
            'tools' => $tools,
        ]);
    }

    public function storeTool(Request $request)
    {
        $this->ensureAdmin();

        $validated = $request->validate([
            'category_id' => 'required|exists:tool_categories,id',
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|unique:tools,slug',
            'description' => 'nullable|string',
            'url' => 'required|url',
            'icon' => 'nullable|string|max:255',
            'thumbnail' => 'nullable|string',
            'icon_file' => 'nullable|image|max:2048',
            'thumbnail_file' => 'nullable|image|max:4096',
            'is_external' => 'boolean',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
            'order' => 'nullable|integer',
            'button_text' => 'nullable|string|max:255',
        ]);

        $data = $validated;
        unset($data['icon_file'], $data['thumbnail_file']);

        // Handle icon upload
        if ($request->hasFile('icon_file')) {
            $cloudinary = new CloudinaryService();
            $result = $cloudinary->uploadImage($request->file('icon_file'), 'tools/icons', [
                'transformation' => 'w_256,h_256,c_limit,q_auto'
            ]);
            if ($result) {
                $data['icon'] = $result['url'];
            }
        }

        // Handle thumbnail upload
        if ($request->hasFile('thumbnail_file')) {
            $cloudinary = new CloudinaryService();
            $result = $cloudinary->uploadThumbnail($request->file('thumbnail_file'));
            if ($result) {
                $data['thumbnail'] = $result['url'];
            }
        }

        // Set booleans safely
        $data['is_external'] = $request->boolean('is_external', true);
        $data['is_featured'] = $request->boolean('is_featured', false);
        $data['is_active'] = $request->boolean('is_active', true);

        $tool = Tool::create($data);

        return response()->json([
            'success' => true,
            'message' => 'টুল সফলভাবে তৈরি করা হয়েছে।',
            'tool' => $tool->load('category'),
        ]);
    }

    public function updateTool(Request $request, $id)
    {
        $this->ensureAdmin();
        $tool = Tool::findOrFail($id);

        $validated = $request->validate([
            'category_id' => 'required|exists:tool_categories,id',
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|unique:tools,slug,' . $id,
            'description' => 'nullable|string',
            'url' => 'required|url',
            'icon' => 'nullable|string|max:255',
            'thumbnail' => 'nullable|string',
            'icon_file' => 'nullable|image|max:2048',
            'thumbnail_file' => 'nullable|image|max:4096',
            'is_external' => 'boolean',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
            'order' => 'nullable|integer',
            'button_text' => 'nullable|string|max:255',
        ]);

        $data = $validated;
        unset($data['icon_file'], $data['thumbnail_file']);

        $cloudinary = new CloudinaryService();

        // Handle icon upload
        if ($request->hasFile('icon_file')) {
            $result = $cloudinary->uploadImage($request->file('icon_file'), 'tools/icons', [
                'transformation' => 'w_256,h_256,c_limit,q_auto'
            ]);
            if ($result) {
                $data['icon'] = $result['url'];
                // Delete old icon
                if ($tool->icon && $cloudinary->isCloudinaryUrl($tool->icon)) {
                    $publicId = $cloudinary->extractPublicId($tool->icon);
                    if ($publicId) {
                        $cloudinary->deleteImage($publicId);
                    }
                }
            }
        }

        // Handle thumbnail upload
        if ($request->hasFile('thumbnail_file')) {
            $result = $cloudinary->uploadThumbnail($request->file('thumbnail_file'));
            if ($result) {
                $data['thumbnail'] = $result['url'];
                // Delete old thumbnail
                if ($tool->thumbnail && $cloudinary->isCloudinaryUrl($tool->thumbnail)) {
                    $publicId = $cloudinary->extractPublicId($tool->thumbnail);
                    if ($publicId) {
                        $cloudinary->deleteImage($publicId);
                    }
                }
            }
        }

        // Set booleans safely
        $data['is_external'] = $request->boolean('is_external', $tool->is_external);
        $data['is_featured'] = $request->boolean('is_featured', $tool->is_featured);
        $data['is_active'] = $request->boolean('is_active', $tool->is_active);

        $tool->update($data);

        return response()->json([
            'success' => true,
            'message' => 'টুল সফলভাবে আপডেট করা হয়েছে।',
            'tool' => $tool->fresh()->load('category'),
        ]);
    }

    public function destroyTool($id)
    {
        $this->ensureAdmin();
        $tool = Tool::findOrFail($id);

        $cloudinary = new CloudinaryService();

        // Delete icon from Cloudinary if exists
        if ($tool->icon && $cloudinary->isCloudinaryUrl($tool->icon)) {
            $publicId = $cloudinary->extractPublicId($tool->icon);
            if ($publicId) {
                $cloudinary->deleteImage($publicId);
            }
        }

        // Delete thumbnail from Cloudinary if exists
        if ($tool->thumbnail && $cloudinary->isCloudinaryUrl($tool->thumbnail)) {
            $publicId = $cloudinary->extractPublicId($tool->thumbnail);
            if ($publicId) {
                $cloudinary->deleteImage($publicId);
            }
        }

        $tool->delete();

        return response()->json([
            'success' => true,
            'message' => 'টুল সফলভাবে মুছে ফেলা হয়েছে।',
        ]);
    }

    // ─────────────────────────────────────────
    // Products Management
    // ─────────────────────────────────────────

    public function adminProducts(Request $request)
    {
        $this->ensureAdmin();

        $query = Product::query();

        if ($request->filled('search')) {
            $q = $request->search;
            $query->where('name', 'like', "%{$q}%")
                  ->orWhere('description', 'like', "%{$q}%");
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $products = $query->orderBy('order', 'asc')->orderBy('id', 'desc')->paginate(15);

        return response()->json([
            'success' => true,
            'products' => $products,
        ]);
    }

    public function storeProduct(Request $request)
    {
        $this->ensureAdmin();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|unique:products,slug',
            'description' => 'nullable|string',
            'features' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'image_file' => 'nullable|image|max:2048',
            'type' => 'required|in:digital,physical,service',
            'download_link' => 'nullable|url',
            'access_instructions' => 'nullable|string',
            'stock' => 'nullable|integer|min:0',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
            'order' => 'nullable|integer',
        ]);

        $data = $validated;
        unset($data['image_file']);

        // Handle image upload with Cloudinary
        if ($request->hasFile('image_file')) {
            $cloudinary = new CloudinaryService();
            $result = $cloudinary->uploadImage($request->file('image_file'), 'products/images', [
                'transformation' => 'w_800,c_limit,q_auto'
            ]);
            if ($result) {
                $data['image'] = $result['url'];
            }
        }

        $data['is_featured'] = $request->boolean('is_featured', false);
        $data['is_active'] = $request->boolean('is_active', true);

        $product = Product::create($data);

        return response()->json([
            'success' => true,
            'message' => 'পণ্য সফলভাবে তৈরি করা হয়েছে।',
            'product' => $product,
        ]);
    }

    public function updateProduct(Request $request, $id)
    {
        $this->ensureAdmin();
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|unique:products,slug,' . $id,
            'description' => 'nullable|string',
            'features' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'image_file' => 'nullable|image|max:2048',
            'type' => 'required|in:digital,physical,service',
            'download_link' => 'nullable|url',
            'access_instructions' => 'nullable|string',
            'stock' => 'nullable|integer|min:0',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
            'order' => 'nullable|integer',
        ]);

        $data = $validated;
        unset($data['image_file']);

        // Handle image update with Cloudinary (Safe Swap)
        if ($request->hasFile('image_file')) {
            $cloudinary = new CloudinaryService();
            $result = $cloudinary->uploadImage($request->file('image_file'), 'products/images', [
                'transformation' => 'w_800,c_limit,q_auto'
            ]);
            
            if ($result) {
                $data['image'] = $result['url'];
                
                // Delete old image from Cloudinary if exists (only on success)
                if ($product->image && $cloudinary->isCloudinaryUrl($product->image)) {
                    $publicId = $cloudinary->extractPublicId($product->image);
                    if ($publicId) {
                        $cloudinary->deleteImage($publicId);
                    }
                }
            }
        }

        $data['is_featured'] = $request->boolean('is_featured', $product->is_featured);
        $data['is_active'] = $request->boolean('is_active', $product->is_active);

        $product->update($data);

        return response()->json([
            'success' => true,
            'message' => 'পণ্য সফলভাবে আপডেট করা হয়েছে।',
            'product' => $product->fresh(),
        ]);
    }

    public function destroyProduct($id)
    {
        $this->ensureAdmin();
        $product = Product::findOrFail($id);

        $cloudinary = new CloudinaryService();

        // Delete images from Cloudinary
        if ($product->image && $cloudinary->isCloudinaryUrl($product->image)) {
            $publicId = $cloudinary->extractPublicId($product->image);
            if ($publicId) {
                $cloudinary->deleteImage($publicId);
            }
        }

        // Delete gallery images if any
        if ($product->gallery) {
            $gallery = is_string($product->gallery) ? json_decode($product->gallery, true) : $product->gallery;
            if (is_array($gallery)) {
                foreach ($gallery as $image) {
                    if ($image && $cloudinary->isCloudinaryUrl($image)) {
                        $publicId = $cloudinary->extractPublicId($image);
                        if ($publicId) {
                            $cloudinary->deleteImage($publicId);
                        }
                    }
                }
            }
        }

        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'পণ্য সফলভাবে মুছে ফেলা হয়েছে।',
        ]);
    }

    // ─────────────────────────────────────────
    // Product Orders Management
    // ─────────────────────────────────────────

    public function adminProductOrders(Request $request)
    {
        $this->ensureAdmin();

        $query = ProductOrder::with(['user:id,name,email', 'product:id,name,image,type']);

        if ($request->filled('search')) {
            $q = $request->search;
            $query->where(function($sub) use ($q) {
                $sub->where('order_number', 'like', "%{$q}%")
                    ->orWhereHas('user', function($uQuery) use ($q) {
                        $uQuery->where('name', 'like', "%{$q}%")
                               ->orWhere('email', 'like', "%{$q}%");
                    })
                    ->orWhereHas('product', function($pQuery) use ($q) {
                        $pQuery->where('name', 'like', "%{$q}%");
                    });
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $orders = $query->latest('id')->paginate(15);

        return response()->json([
            'success' => true,
            'orders' => $orders,
        ]);
    }

    public function updateProductOrderStatus(Request $request, $id)
    {
        $this->ensureAdmin();
        $order = ProductOrder::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:pending,completed,cancelled,refunded',
            'notes' => 'nullable|string|max:1000',
        ]);

        $oldStatus = $order->status;
        $newStatus = $validated['status'];

        if (isset($validated['notes'])) {
            $order->notes = $validated['notes'];
        }

        // If completing, handle stock
        if ($newStatus === 'completed' && $oldStatus !== 'completed') {
            $product = $order->product;
            if ($product->stock !== null) {
                if ($product->stock < $order->quantity) {
                    return response()->json([
                        'success' => false,
                        'message' => 'অর্ডারটি সম্পন্ন করার জন্য পণ্যটির পর্যাপ্ত স্টক নেই।',
                    ], 422);
                }
                $product->decrement('stock', $order->quantity);
            }
            $order->completed_at = now();
        }

        // If moving AWAY from completed, restore stock
        if ($oldStatus === 'completed' && in_array($newStatus, ['cancelled', 'refunded'])) {
            $product = $order->product;
            if ($product->stock !== null) {
                $product->increment('stock', $order->quantity);
            }
            $order->completed_at = null;
        }

        $order->status = $newStatus;
        $order->save();

        return response()->json([
            'success' => true,
            'message' => 'অর্ডার স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে।',
            'order' => $order->fresh()->load(['user:id,name,email', 'product:id,name,image,type']),
        ]);
    }

    // ─────────────────────────────────────────
    // Referral Management
    // ─────────────────────────────────────────

    public function referralIndex(Request $request)
    {
        $this->ensureAdmin();

        $settings = ReferralSetting::first();
        if (!$settings) {
            $settings = ReferralSetting::create([
                'commission_percentage' => 10.00,
                'auto_approve' => false,
                'is_active' => true,
                'minimum_payout' => 100.00,
            ]);
        }

        // Stats
        $stats = [
            'settings' => $settings,
            'total_referral_users' => ReferralUser::count(),
            'approved_users' => ReferralUser::where('status', 'approved')->count(),
            'pending_users' => ReferralUser::where('status', 'pending')->count(),
            'total_commissions_paid' => ReferralCommission::where('status', 'credited')->sum('commission_amount'),
            'pending_commissions' => ReferralCommission::where('status', 'pending')->sum('commission_amount'),
            'total_referrals' => User::whereNotNull('referred_by')->count(),
        ];

        // Paginated applications / users
        $query = ReferralUser::with('user:id,name,email');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $q = $request->search;
            $query->whereHas('user', function ($uQuery) use ($q) {
                $uQuery->where('name', 'like', "%{$q}%")
                       ->orWhere('email', 'like', "%{$q}%");
            })->orWhere('referral_code', 'like', "%{$q}%");
        }

        $referralUsers = $query->latest('id')->paginate(15);

        return response()->json([
            'success' => true,
            'stats' => $stats,
            'referralUsers' => $referralUsers,
        ]);
    }

    public function referralSettings()
    {
        $this->ensureAdmin();
        $settings = ReferralSetting::first();
        if (!$settings) {
            $settings = ReferralSetting::create([
                'commission_percentage' => 10.00,
                'auto_approve' => false,
                'is_active' => true,
                'minimum_payout' => 100.00,
            ]);
        }

        return response()->json([
            'success' => true,
            'settings' => $settings,
        ]);
    }

    public function updateReferralSettings(Request $request)
    {
        $this->ensureAdmin();
        $settings = ReferralSetting::first();
        if (!$settings) {
            $settings = new ReferralSetting();
        }

        $validated = $request->validate([
            'commission_percentage' => 'required|numeric|min:0|max:100',
            'auto_approve' => 'required|boolean',
            'is_active' => 'required|boolean',
            'minimum_payout' => 'nullable|numeric|min:0',
            'terms_conditions' => 'nullable|string',
        ]);

        $settings->fill($validated)->save();

        return response()->json([
            'success' => true,
            'message' => 'রেফারেল সেটিংস সফলভাবে আপডেট করা হয়েছে।',
            'settings' => $settings->fresh(),
        ]);
    }

    public function showReferralUser($id)
    {
        $this->ensureAdmin();
        $referralUser = ReferralUser::with('user')->findOrFail($id);
        
        $commissions = ReferralCommission::where('referrer_id', $referralUser->user_id)
            ->with(['referred:id,name,email', 'course:id,title', 'payment:id,amount,status'])
            ->latest('id')
            ->paginate(10);

        $referredUsers = User::where('referred_by', $referralUser->referral_code)
            ->select('id', 'name', 'email', 'created_at')
            ->latest('id')
            ->get();

        $wallet = UserWallet::where('user_id', $referralUser->user_id)->first();
        
        $transactions = [];
        if ($wallet) {
            $transactions = WalletTransaction::where('user_id', $referralUser->user_id)
                ->latest('id')
                ->paginate(10);
        }

        return response()->json([
            'success' => true,
            'referralUser' => $referralUser,
            'commissions' => $commissions,
            'referredUsers' => $referredUsers,
            'wallet' => $wallet,
            'transactions' => $transactions,
        ]);
    }

    public function approveReferralUser($id)
    {
        $this->ensureAdmin();
        $referralUser = ReferralUser::findOrFail($id);
        $referralUser->update([
            'status' => 'approved',
            'approved_at' => now(),
            'rejection_reason' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'এফিলিয়েট আবেদন সফলভাবে এপ্রুভ করা হয়েছে।',
            'referralUser' => $referralUser->fresh()->load('user:id,name,email'),
        ]);
    }

    public function rejectReferralUser(Request $request, $id)
    {
        $this->ensureAdmin();
        $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        $referralUser = ReferralUser::findOrFail($id);
        $referralUser->update([
            'status' => 'rejected',
            'rejection_reason' => $request->reason,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'এফিলিয়েট আবেদন রিজেক্ট করা হয়েছে।',
            'referralUser' => $referralUser->fresh()->load('user:id,name,email'),
        ]);
    }

    public function suspendReferralUser($id)
    {
        $this->ensureAdmin();
        $referralUser = ReferralUser::findOrFail($id);
        $referralUser->update([
            'status' => 'suspended',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'এফিলিয়েট একাউন্ট সফলভাবে সাসপেন্ড করা হয়েছে।',
            'referralUser' => $referralUser->fresh()->load('user:id,name,email'),
        ]);
    }

    public function resetReferralUser($id)
    {
        $this->ensureAdmin();
        $referralUser = ReferralUser::findOrFail($id);
        $referralUser->delete();

        return response()->json([
            'success' => true,
            'message' => 'আবেদন রিসেট করা হয়েছে। ব্যবহারকারী আবার আবেদন করতে পারবেন।',
        ]);
    }

    public function referralCommissions(Request $request)
    {
        $this->ensureAdmin();
        $query = ReferralCommission::with(['referrer:id,name,email', 'referred:id,name,email', 'course:id,title', 'payment:id,amount,status']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $q = $request->search;
            $query->whereHas('referrer', function ($rQuery) use ($q) {
                $rQuery->where('name', 'like', "%{$q}%")
                       ->orWhere('email', 'like', "%{$q}%");
            });
        }

        $commissions = $query->latest('id')->paginate(15);

        $totalPaid = ReferralCommission::where('status', 'credited')->sum('commission_amount');
        $totalPending = ReferralCommission::where('status', 'pending')->sum('commission_amount');

        return response()->json([
            'success' => true,
            'commissions' => $commissions,
            'totalPaid' => $totalPaid,
            'totalPending' => $totalPending,
        ]);
    }

    public function creditReferralCommission($id)
    {
        $this->ensureAdmin();
        $commission = ReferralCommission::findOrFail($id);

        if ($commission->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'এই কমিশনটি ইতিপূর্বে ক্রেডিট করা হয়েছে বা প্রসেসিং যোগ্য নয়।',
            ], 422);
        }

        $commission->creditToWallet();

        return response()->json([
            'success' => true,
            'message' => 'কমিশন সফলভাবে ওয়ালেটে ক্রেডিট করা হয়েছে।',
            'commission' => $commission->fresh()->load(['referrer:id,name,email', 'referred:id,name,email', 'course:id,title']),
        ]);
    }

    // ─────────────────────────────────────────
    // Blog Management
    // ─────────────────────────────────────────

    public function adminBlogPosts(Request $request)
    {
        $this->ensureAdmin();

        $posts = BlogPost::with(['author:id,name,email', 'category:id,name', 'tags:id,name'])
            ->when($request->filled('search'), function ($query) use ($request) {
                $query->where('title', 'like', "%{$request->search}%");
            })
            ->when($request->filled('status'), function ($query) use ($request) {
                $query->where('status', $request->status);
            })
            ->when($request->filled('category'), function ($query) use ($request) {
                $query->where('blog_category_id', $request->category);
            })
            ->latest('id')
            ->paginate(15);

        $categories = BlogCategory::orderBy('name')->get();
        $tags = BlogTag::orderBy('name')->get();
        $courses = Course::where('is_published', true)->orderBy('title')->get(['id', 'title', 'slug']);

        return response()->json([
            'success' => true,
            'posts' => $posts,
            'categories' => $categories,
            'tags' => $tags,
            'courses' => $courses,
        ]);
    }

    public function storeBlogPost(Request $request)
    {
        $this->ensureAdmin();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:blog_posts,slug',
            'excerpt' => 'nullable|string|max:500',
            'content' => 'required|string',
            'blog_category_id' => 'nullable|exists:blog_categories,id',
            'featured_image_file' => 'nullable|image|max:2048',
            'featured_image_alt' => 'nullable|string|max:255',
            'meta_title' => 'nullable|string|max:70',
            'meta_description' => 'nullable|string|max:160',
            'meta_keywords' => 'nullable|string|max:255',
            'canonical_url' => 'nullable|url|max:255',
            'og_image_file' => 'nullable|image|max:2048',
            'schema_type' => 'nullable|in:Article,BlogPosting,NewsArticle',
            'is_indexable' => 'boolean',
            'is_followable' => 'boolean',
            'status' => 'required|in:draft,published,scheduled',
            'published_at' => 'nullable|date',
            'scheduled_at' => 'nullable|date|after:now',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:blog_tags,id',
            'related_courses' => 'nullable|array',
            'related_courses.*' => 'exists:courses,id',
        ]);

        $validated['slug'] = $validated['slug'] ?? Str::slug($validated['title']);
        
        // Ensure unique slug
        $baseSlug = $validated['slug'];
        $counter = 1;
        while (BlogPost::where('slug', $validated['slug'])->exists()) {
            $validated['slug'] = $baseSlug . '-' . $counter++;
        }

        // Upload featured image with Cloudinary
        if ($request->hasFile('featured_image_file')) {
            $cloudinary = new CloudinaryService();
            $result = $cloudinary->uploadImage($request->file('featured_image_file'), 'blog_posts');
            if ($result) {
                $validated['featured_image'] = $result;
            }
        }

        // Upload OG image with Cloudinary
        if ($request->hasFile('og_image_file')) {
            $cloudinary = new CloudinaryService();
            $result = $cloudinary->uploadImage($request->file('og_image_file'), 'blog_posts_og');
            if ($result) {
                $validated['og_image'] = $result;
            }
        }

        if ($validated['status'] === 'published' && empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        $validated['user_id'] = auth()->id() ?: 1;

        $tags = $validated['tags'] ?? [];
        unset($validated['tags']);

        $post = BlogPost::create($validated);

        if (!empty($tags)) {
            $post->tags()->sync($tags);
        }

        return response()->json([
            'success' => true,
            'message' => 'ব্লগ পোস্টটি সফলভাবে তৈরি করা হয়েছে।',
            'post' => $post->load(['category', 'tags']),
        ]);
    }

    public function updateBlogPost(Request $request, $id)
    {
        $this->ensureAdmin();
        $post = BlogPost::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:blog_posts,slug,' . $post->id,
            'excerpt' => 'nullable|string|max:500',
            'content' => 'required|string',
            'blog_category_id' => 'nullable|exists:blog_categories,id',
            'featured_image_file' => 'nullable|image|max:2048',
            'featured_image_alt' => 'nullable|string|max:255',
            'meta_title' => 'nullable|string|max:70',
            'meta_description' => 'nullable|string|max:160',
            'meta_keywords' => 'nullable|string|max:255',
            'canonical_url' => 'nullable|url|max:255',
            'og_image_file' => 'nullable|image|max:2048',
            'schema_type' => 'nullable|in:Article,BlogPosting,NewsArticle',
            'is_indexable' => 'boolean',
            'is_followable' => 'boolean',
            'status' => 'required|in:draft,published,scheduled',
            'published_at' => 'nullable|date',
            'scheduled_at' => 'nullable|date|after:now',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:blog_tags,id',
            'related_courses' => 'nullable|array',
            'related_courses.*' => 'exists:courses,id',
        ]);

        if (!empty($validated['slug']) && $validated['slug'] !== $post->slug) {
            $baseSlug = $validated['slug'];
            $counter = 1;
            while (BlogPost::where('slug', $validated['slug'])->where('id', '!=', $post->id)->exists()) {
                $validated['slug'] = $baseSlug . '-' . $counter++;
            }
        }

        // Upload featured image with Cloudinary
        if ($request->hasFile('featured_image_file')) {
            $cloudinary = new CloudinaryService();
            $result = $cloudinary->uploadImage($request->file('featured_image_file'), 'blog_posts');
            if ($result) {
                // Delete old image if exists
                if ($post->featured_image && str_contains($post->featured_image, 'cloudinary.com')) {
                    $parts = explode('/v2_uploads/', $post->featured_image);
                    if (count($parts) > 1) {
                        $pId = 'v2_uploads/' . explode('.', $parts[1])[0];
                        $cloudinary->deleteImage($pId);
                    }
                }
                $validated['featured_image'] = $result;
            }
        }

        // Upload OG image with Cloudinary
        if ($request->hasFile('og_image_file')) {
            $cloudinary = new CloudinaryService();
            $result = $cloudinary->uploadImage($request->file('og_image_file'), 'blog_posts_og');
            if ($result) {
                if ($post->og_image && str_contains($post->og_image, 'cloudinary.com')) {
                    $parts = explode('/v2_uploads/', $post->og_image);
                    if (count($parts) > 1) {
                        $pId = 'v2_uploads/' . explode('.', $parts[1])[0];
                        $cloudinary->deleteImage($pId);
                    }
                }
                $validated['og_image'] = $result;
            }
        }

        if ($validated['status'] === 'published' && $post->status !== 'published' && empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        $tags = $validated['tags'] ?? [];
        unset($validated['tags']);

        $post->update($validated);
        $post->tags()->sync($tags);

        return response()->json([
            'success' => true,
            'message' => 'ব্লগ পোস্টটি সফলভাবে আপডেট করা হয়েছে।',
            'post' => $post->fresh()->load(['category', 'tags']),
        ]);
    }

    public function destroyBlogPost($id)
    {
        $this->ensureAdmin();
        $post = BlogPost::findOrFail($id);

        $cloudinary = new CloudinaryService();
        if ($post->featured_image && str_contains($post->featured_image, 'cloudinary.com')) {
            $parts = explode('/v2_uploads/', $post->featured_image);
            if (count($parts) > 1) {
                $pId = 'v2_uploads/' . explode('.', $parts[1])[0];
                $cloudinary->deleteImage($pId);
            }
        }

        if ($post->og_image && str_contains($post->og_image, 'cloudinary.com')) {
            $parts = explode('/v2_uploads/', $post->og_image);
            if (count($parts) > 1) {
                $pId = 'v2_uploads/' . explode('.', $parts[1])[0];
                $cloudinary->deleteImage($pId);
            }
        }

        $post->delete();

        return response()->json([
            'success' => true,
            'message' => 'ব্লগ পোস্টটি সফলভাবে মুছে ফেলা হয়েছে।',
        ]);
    }

    public function adminBlogCategories()
    {
        $this->ensureAdmin();
        $categories = BlogCategory::withCount('posts')
            ->orderBy('name')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'categories' => $categories,
        ]);
    }

    public function storeBlogCategory(Request $request)
    {
        $this->ensureAdmin();
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:blog_categories,slug',
            'description' => 'nullable|string',
            'meta_title' => 'nullable|string|max:70',
            'meta_description' => 'nullable|string|max:160',
        ]);

        $validated['slug'] = $validated['slug'] ?? Str::slug($validated['name']);

        $category = BlogCategory::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'ক্যাটাগরি সফলভাবে তৈরি করা হয়েছে।',
            'category' => $category,
        ]);
    }

    public function updateBlogCategory(Request $request, $id)
    {
        $this->ensureAdmin();
        $category = BlogCategory::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:blog_categories,slug,' . $category->id,
            'description' => 'nullable|string',
            'meta_title' => 'nullable|string|max:70',
            'meta_description' => 'nullable|string|max:160',
        ]);

        if (!empty($validated['slug']) && $validated['slug'] !== $category->slug) {
            $validated['slug'] = Str::slug($validated['slug']);
        }

        $category->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'ক্যাটাগরি সফলভাবে আপডেট করা হয়েছে।',
            'category' => $category->fresh(),
        ]);
    }

    public function destroyBlogCategory($id)
    {
        $this->ensureAdmin();
        $category = BlogCategory::findOrFail($id);
        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'ক্যাটাগরি সফলভাবে মুছে ফেলা হয়েছে।',
        ]);
    }

    public function adminBlogTags()
    {
        $this->ensureAdmin();
        $tags = BlogTag::withCount('posts')
            ->orderBy('name')
            ->paginate(30);

        return response()->json([
            'success' => true,
            'tags' => $tags,
        ]);
    }

    public function storeBlogTag(Request $request)
    {
        $this->ensureAdmin();
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:blog_tags,slug',
        ]);

        $validated['slug'] = $validated['slug'] ?? Str::slug($validated['name']);

        $tag = BlogTag::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'ট্যাগ সফলভাবে তৈরি করা হয়েছে।',
            'tag' => $tag,
        ]);
    }

    public function updateBlogTag(Request $request, $id)
    {
        $this->ensureAdmin();
        $tag = BlogTag::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:blog_tags,slug,' . $tag->id,
        ]);

        if (!empty($validated['slug']) && $validated['slug'] !== $tag->slug) {
            $validated['slug'] = Str::slug($validated['slug']);
        }

        $tag->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'ট্যাগ সফলভাবে আপডেট করা হয়েছে।',
            'tag' => $tag->fresh(),
        ]);
    }

    public function destroyBlogTag($id)
    {
        $this->ensureAdmin();
        $tag = BlogTag::findOrFail($id);
        $tag->delete();

        return response()->json([
            'success' => true,
            'message' => 'ট্যাগ সফলভাবে মুছে ফেলা হয়েছে।',
        ]);
    }

    // ─────────────────────────────────────────
    // Reviews Management
    // ─────────────────────────────────────────

    public function adminReviews(Request $request)
    {
        $this->ensureAdmin();

        $query = Review::with(['user:id,name,email', 'course:id,title']);

        if ($request->filled('rating')) {
            $query->where('rating', $request->rating);
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->status === 'active' ? 1 : 0);
        }

        if ($request->filled('search')) {
            $q = $request->search;
            $query->where(function ($sQuery) use ($q) {
                $sQuery->where('comment', 'like', "%{$q}%")
                       ->orWhereHas('user', function ($uQuery) use ($q) {
                           $uQuery->where('name', 'like', "%{$q}%")
                                  ->orWhere('email', 'like', "%{$q}%");
                       })
                       ->orWhereHas('course', function ($cQuery) use ($q) {
                           $cQuery->where('title', 'like', "%{$q}%");
                       });
            });
        }

        $reviews = $query->latest('id')->paginate(15);

        // Stats summary
        $totalReviews = Review::count();
        $activeReviews = Review::where('is_active', 1)->count();
        $pendingReviews = Review::where('is_active', 0)->count();
        $avgRating = Review::avg('rating') ?: 0;

        return response()->json([
            'success' => true,
            'reviews' => $reviews,
            'stats' => [
                'total' => $totalReviews,
                'active' => $activeReviews,
                'pending' => $pendingReviews,
                'average' => round($avgRating, 1),
            ],
        ]);
    }

    public function toggleReviewStatus($id)
    {
        $this->ensureAdmin();
        $review = Review::findOrFail($id);
        $review->is_active = !$review->is_active;
        $review->save();

        return response()->json([
            'success' => true,
            'message' => 'রিভিউ স্ট্যাটাস সফলভাবে পরিবর্তন করা হয়েছে।',
            'review' => $review->fresh()->load(['user:id,name,email', 'course:id,title']),
        ]);
    }

    public function destroyReview($id)
    {
        $this->ensureAdmin();
        $review = Review::findOrFail($id);
        $review->delete();

        return response()->json([
            'success' => true,
            'message' => 'রিভিউটি সফলভাবে মুছে ফেলা হয়েছে।',
        ]);
    }
    // ─────────────────────────────────────────
    // Site Settings
    // ─────────────────────────────────────────

    public function getSettings()
    {
        $this->ensureAdmin();
        $rows = Setting::all();
        $grouped = [];
        foreach ($rows as $row) {
            $grouped[$row->group][$row->key] = $row->value;
        }
        return response()->json(['success' => true, 'settings' => $grouped]);
    }

    public function updateSettings(Request $request)
    {
        $this->ensureAdmin();
        $group    = $request->input('group', 'general');
        $settings = $request->input('settings', []);
        if (!is_array($settings) || empty($settings)) {
            return response()->json(['success' => false, 'message' => 'কোনো সেটিংস পাওয়া যায়নি।'], 422);
        }
        foreach ($settings as $key => $value) {
            Setting::updateOrCreate(['key' => $key], ['value' => $value, 'group' => $group]);
        }
        return response()->json(['success' => true, 'message' => 'সেটিংস সফলভাবে আপডেট করা হয়েছে।']);
    }

    public function uploadSettingsImage(Request $request)
    {
        $this->ensureAdmin();
        $request->validate(['file' => 'required|file|image|max:2048', 'type' => 'required|in:logo,favicon,footer_logo']);
        $cloudinary = new CloudinaryService();
        $result = $cloudinary->uploadImage($request->file('file'), 'logos');
        if (!$result || empty($result['url'])) {
            return response()->json(['success' => false, 'message' => 'ইমেজ আপলোড ব্যর্থ হয়েছে।'], 500);
        }
        $url = $result['url'];
        $typeMap = ['logo' => 'site_logo', 'favicon' => 'site_favicon', 'footer_logo' => 'footer_logo'];
        $key = $typeMap[$request->type];
        Setting::updateOrCreate(['key' => $key], ['value' => $url, 'group' => 'appearance']);
        return response()->json(['success' => true, 'message' => 'ইমেজ সফলভাবে আপলোড হয়েছে।', 'url' => $url, 'key' => $key]);
    }

    public function publicSettings()
    {
        $rows = Setting::whereIn('group', ['general', 'appearance', 'footer', 'marketing', 'features', 'verification'])->get();
        $grouped = [];
        foreach ($rows as $row) {
            if ($row->group === 'marketing' && $row->key === 'meta_capi_access_token') {
                continue;
            }
            $grouped[$row->group][$row->key] = $row->value;
        }
        return response()->json(['success' => true, 'settings' => $grouped]);
    }

    public function trackVisit(Request $request)
    {
        $ip = $request->ip();
        $path = $request->input('url', '/');
        $referrerUrl = $request->input('referrer', '');
        
        // Extract domain or default to Direct
        $referrer = 'Direct';
        if (!empty($referrerUrl) && filter_var($referrerUrl, FILTER_VALIDATE_URL)) {
            $host = parse_url($referrerUrl, PHP_URL_HOST);
            if ($host) {
                $referrer = preg_replace('/^www\./', '', $host);
            }
        } elseif (!empty($referrerUrl) && strlen($referrerUrl) < 100) {
            $referrer = $referrerUrl;
        }

        $country = self::getCountryFromIp($ip);
        $userName = Auth::check() ? Auth::user()->name : 'Guest';
        $now = time();

        try {
            // 1. Update Online Visitors Cache
            $online = Cache::get('online_visitors', []);
            $online[$ip] = [
                'last_seen' => $now,
                'url'       => $path,
                'referrer'  => $referrer,
                'country'   => $country,
                'user_name' => $userName
            ];
            // Filter active (last 5 minutes)
            $online = array_filter($online, function($v) use ($now) {
                return $v['last_seen'] >= ($now - 300);
            });
            Cache::put('online_visitors', $online, 600);

            // 2. Update Persistent Analytics
            $today = date('Y-m-d');
            $cacheKey = "visited_today_{$ip}_{$today}";
            $isUniqueToday = !Cache::has($cacheKey);

            if ($isUniqueToday) {
                Cache::put($cacheKey, true, 86400); // 24 hours
            }

            // Fetch settings row
            $setting = Setting::where('key', 'visitor_analytics')->first();
            $analytics = $setting ? json_decode($setting->value, true) : null;

            if (!$analytics) {
                $analytics = [
                    'total_pageviews' => 0,
                    'total_uniques'   => 0,
                    'referrers'       => [],
                    'countries'       => [],
                    'daily'           => []
                ];
            }

            // Increment pageviews
            $analytics['total_pageviews']++;
            if ($isUniqueToday) {
                $analytics['total_uniques']++;
            }

            // Referrers
            if (!isset($analytics['referrers'][$referrer])) {
                $analytics['referrers'][$referrer] = 0;
            }
            $analytics['referrers'][$referrer]++;

            // Countries
            if (!isset($analytics['countries'][$country])) {
                $analytics['countries'][$country] = 0;
            }
            $analytics['countries'][$country]++;

            // Daily stats
            if (!isset($analytics['daily'][$today])) {
                $analytics['daily'][$today] = [
                    'pageviews' => 0,
                    'uniques'   => 0
                ];
            }
            $analytics['daily'][$today]['pageviews']++;
            if ($isUniqueToday) {
                $analytics['daily'][$today]['uniques']++;
            }

            // Keep only last 30 days of daily stats to prevent payload bloating
            if (count($analytics['daily']) > 30) {
                ksort($analytics['daily']);
                $analytics['daily'] = array_slice($analytics['daily'], -30, null, true);
            }

            // Save back to key-value settings table
            Setting::updateOrCreate(
                ['key' => 'visitor_analytics'],
                ['value' => json_encode($analytics), 'group' => 'analytics']
            );

        } catch (\Exception $e) {
            // Silence exceptions to keep main application running if DB lock or cache fails
        }

        return response()->json(['success' => true]);
    }

    private static function getCountryFromIp($ip)
    {
        if ($ip === '127.0.0.1' || $ip === '::1' || filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_RES_RANGE) === false) {
            return 'Localhost';
        }

        // Cloudflare IP Country Header Check
        if (!empty($_SERVER['HTTP_CF_IPCOUNTRY'])) {
            return strtoupper($_SERVER['HTTP_CF_IPCOUNTRY']);
        }

        // Cache external IP lookup response to prevent performance bottlenecks
        return Cache::remember("geoip_country_{$ip}", 86400 * 30, function () use ($ip) {
            try {
                $response = Http::timeout(2)->get("http://ip-api.com/json/{$ip}?fields=countryCode");
                if ($response->successful()) {
                    $data = $response->json();
                    return $data['countryCode'] ?? 'Unknown';
                }
            } catch (\Exception $e) {
                // Return Unknown on timeout/error
            }
            return 'Unknown';
        });
    }

    public function getLeads()
    {
        $this->ensureAdmin();

        $leads = \App\Models\CourseLead::with('course:id,title,slug')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'leads'   => $leads,
        ]);
    }

    public function destroyLead($id)
    {
        $this->ensureAdmin();

        $lead = \App\Models\CourseLead::findOrFail($id);
        $lead->delete();

        return response()->json([
            'success' => true,
            'message' => 'লিডটি সফলভাবে মুছে ফেলা হয়েছে।',
        ]);
    }

    public function notifyLead($id)
    {
        $this->ensureAdmin();

        $lead = \App\Models\CourseLead::findOrFail($id);
        $course = $lead->course;

        if (!$course) {
            return response()->json(['success' => false, 'message' => 'কোর্সটি খুঁজে পাওয়া যায়নি।'], 404);
        }

        try {
            $toEmail = $lead->email;
            $toName = $lead->name;

            \Illuminate\Support\Facades\Mail::html(
                "<div style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);'>
                    <div style='background-color: #7c3aed; color: #ffffff; padding: 24px; text-align: center;'>
                        <h2 style='margin: 0; font-size: 24px;'>আমাদের নতুন কোর্স এখন লাইভ!</h2>
                    </div>
                    <div style='padding: 24px;'>
                        <p>প্রিয় <strong>{$toName}</strong>,</p>
                        <p>আপনি যে কোর্সটিতে আগ্রহ প্রকাশ করেছিলেন, তা এখন আমাদের প্ল্যাটফর্মে লাইভ ও সবার জন্য উন্মুক্ত করা হয়েছে।</p>
                        <div style='background-color: #f3f4f6; border-left: 4px solid #7c3aed; padding: 16px; margin: 20px 0; border-radius: 4px;'>
                            <h3 style='margin: 0 0 8px 0; color: #1f2937;'>{$course->title}</h3>
                            <p style='margin: 0; font-size: 14px; color: #4b5563;'>{$course->short_description}</p>
                        </div>
                        <p>কোর্সে ভর্তি হতে বা বিস্তারিত দেখতে নিচের লিঙ্কে ক্লিক করুন:</p>
                        <div style='text-align: center; margin: 30px 0;'>
                            <a href='" . url("/courses/{$course->slug}") . "' style='background-color: #7c3aed; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: bold; display: inline-block; box-shadow: 0 2px 4px rgba(124, 58, 237, 0.3);'>কোর্সে ভর্তি হোন</a>
                        </div>
                        <p>ধন্যবাদ,<br><strong>VibeThink LMS টিম</strong></p>
                    </div>
                    <div style='background-color: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #eee; font-size: 12px; color: #6b7280;'>
                        &copy; " . date('Y') . " VibeThink. All rights reserved.
                    </div>
                </div>",
                function ($message) use ($toEmail, $toName, $course) {
                    $message->to($toEmail, $toName)
                        ->subject("🎉 আমাদের নতুন কোর্স '{$course->title}' এখন লাইভ!");
                }
            );

            $lead->update([
                'notified' => true,
                'notified_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'ইউজারকে নোটিফিকেশন পাঠানো হয়েছে।',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'মেল পাঠাতে ব্যর্থ হয়েছে: ' . $e->getMessage(),
            ], 500);
        }
    }

    private function notifyCourseLeads($course)
    {
        $leads = \App\Models\CourseLead::where('course_id', $course->id)
            ->where('notified', false)
            ->get();

        foreach ($leads as $lead) {
            try {
                $toEmail = $lead->email;
                $toName = $lead->name;

                \Illuminate\Support\Facades\Mail::html(
                    "<div style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);'>
                        <div style='background-color: #7c3aed; color: #ffffff; padding: 24px; text-align: center;'>
                            <h2 style='margin: 0; font-size: 24px;'>আমাদের নতুন কোর্স এখন লাইভ!</h2>
                        </div>
                        <div style='padding: 24px;'>
                            <p>প্রিয় <strong>{$toName}</strong>,</p>
                            <p>আপনি যে কোর্সটিতে আগ্রহ প্রকাশ করেছিলেন, তা এখন আমাদের প্ল্যাটফর্মে লাইভ ও সবার জন্য উন্মুক্ত করা হয়েছে।</p>
                            <div style='background-color: #f3f4f6; border-left: 4px solid #7c3aed; padding: 16px; margin: 20px 0; border-radius: 4px;'>
                                <h3 style='margin: 0 0 8px 0; color: #1f2937;'>{$course->title}</h3>
                                <p style='margin: 0; font-size: 14px; color: #4b5563;'>{$course->short_description}</p>
                            </div>
                            <p>কোর্সে ভর্তি হতে বা বিস্তারিত দেখতে নিচের লিঙ্কে ক্লিক করুন:</p>
                            <div style='text-align: center; margin: 30px 0;'>
                                <a href='" . url("/courses/{$course->slug}") . "' style='background-color: #7c3aed; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: bold; display: inline-block; box-shadow: 0 2px 4px rgba(124, 58, 237, 0.3);'>কোর্সে ভর্তি হোন</a>
                            </div>
                            <p>ধন্যবাদ,<br><strong>VibeThink LMS টিম</strong></p>
                        </div>
                        <div style='background-color: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #eee; font-size: 12px; color: #6b7280;'>
                            &copy; " . date('Y') . " VibeThink. All rights reserved.
                        </div>
                    </div>",
                    function ($message) use ($toEmail, $toName, $course) {
                        $message->to($toEmail, $toName)
                            ->subject("🎉 আমাদের নতুন কোর্স '{$course->title}' এখন লাইভ!");
                    }
                );

                $lead->update([
                    'notified' => true,
                    'notified_at' => now(),
                ]);
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error("Failed to notify lead: " . $lead->email . " - " . $e->getMessage());
            }
        }
    }
}