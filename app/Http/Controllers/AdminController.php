<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\Course;
use App\Models\User;
use App\Models\Enrollment;
use App\Models\Payment;
use App\Models\SupportTicket;
use App\Models\TicketCategory;
use App\Models\TicketReply;

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
}
