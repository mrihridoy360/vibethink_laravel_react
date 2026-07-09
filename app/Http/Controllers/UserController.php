<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\Certificate;
use App\Models\Payment;
use App\Models\UserWallet;
use App\Models\WalletTransaction;
use App\Models\ReferralUser;
use App\Models\ReferralCommission;
use App\Models\SupportGroup;
use App\Models\Enrollment;

class UserController extends Controller
{
    // ───────────────────────────────────────────
    // Profile
    // ───────────────────────────────────────────

    public function profile()
    {
        return response()->json([
            'success' => true,
            'user'    => Auth::user(),
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'name'  => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
        ]);

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'প্রোফাইল সফলভাবে আপডেট হয়েছে।',
            'user'    => $user->fresh(),
        ]);
    }

    public function updatePassword(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'current_password'      => 'required',
            'password'              => 'required|min:8|confirmed',
        ]);

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'বর্তমান পাসওয়ার্ড সঠিক নয়।',
            ], 422);
        }

        $user->update(['password' => Hash::make($request->password)]);

        return response()->json([
            'success' => true,
            'message' => 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে।',
        ]);
    }

    // ───────────────────────────────────────────
    // Certificates
    // ───────────────────────────────────────────

    public function certificates()
    {
        $user = Auth::user();

        // Certificates from the certificates table
        $certs = Certificate::where('user_id', $user->id)
            ->with('course:id,title,slug,thumbnail')
            ->latest('issued_at')
            ->get();

        // Also get completed enrollments (100%) that may not have a certificate yet
        $completedEnrollments = Enrollment::where('user_id', $user->id)
            ->where('progress', 100)
            ->with('course:id,title,slug,thumbnail,user_id')
            ->get();

        return response()->json([
            'success'              => true,
            'certificates'         => $certs,
            'completed_enrollments' => $completedEnrollments,
        ]);
    }

    // ───────────────────────────────────────────
    // Billing / Payments
    // ───────────────────────────────────────────

    public function billing()
    {
        $user = Auth::user();

        $payments = Payment::where('user_id', $user->id)
            ->with('course:id,title,slug,thumbnail')
            ->latest()
            ->get();

        return response()->json([
            'success'  => true,
            'payments' => $payments,
        ]);
    }

    // ───────────────────────────────────────────
    // Wallet
    // ───────────────────────────────────────────

    public function wallet()
    {
        $user = Auth::user();

        $wallet = UserWallet::firstOrCreate(
            ['user_id' => $user->id],
            ['balance' => 0, 'total_earned' => 0, 'total_withdrawn' => 0, 'total_spent' => 0]
        );

        $transactions = WalletTransaction::where('user_id', $user->id)
            ->latest()
            ->take(50)
            ->get();

        return response()->json([
            'success'      => true,
            'wallet'       => $wallet,
            'transactions' => $transactions,
        ]);
    }

    // ───────────────────────────────────────────
    // Referral
    // ───────────────────────────────────────────

    public function referral()
    {
        $user = Auth::user();

        $referralUser = ReferralUser::where('user_id', $user->id)->first();

        $settings = \App\Models\ReferralSetting::first();

        $commissions = [];
        $referredUsers = [];
        if ($referralUser) {
            $commissions = ReferralCommission::where('referrer_id', $user->id)
                ->with(['referred:id,name,email', 'course:id,title'])
                ->latest()
                ->get();

            // Users referred by this user's referral code
            $referredUsers = \App\Models\User::where('referred_by', $referralUser->referral_code)
                ->select('id', 'name', 'email', 'created_at')
                ->latest()
                ->get();
        }

        return response()->json([
            'success'       => true,
            'referral_user' => $referralUser,
            'settings'      => $settings,
            'commissions'   => $commissions,
            'referred_users' => $referredUsers,
            'referral_code' => $referralUser?->referral_code ?? null,
        ]);
    }

    // ───────────────────────────────────────────
    // Support Groups
    // ───────────────────────────────────────────

    public function supportGroups()
    {
        $user = Auth::user();

        // Get support groups for courses the user is enrolled in
        $enrolledCourseIds = Enrollment::where('user_id', $user->id)
            ->pluck('course_id');

        $groups = SupportGroup::whereIn('course_id', $enrolledCourseIds)
            ->where('is_active', true)
            ->with('course:id,title,slug,thumbnail')
            ->get();

        // Also get general groups (course_id might be 0 or null in some setups)
        $generalGroups = SupportGroup::whereNotIn('course_id', $enrolledCourseIds)
            ->where('is_active', true)
            ->with('course:id,title,slug,thumbnail')
            ->get();

        return response()->json([
            'success'        => true,
            'groups'         => $groups,
            'general_groups' => $generalGroups,
        ]);
    }

    public function announcements()
    {
        $announcements = \DB::table('announcements')
            ->where('is_active', true)
            ->orderBy('is_pinned', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'announcements' => $announcements,
        ]);
    }

    public function gifts()
    {
        $gifts = \DB::table('gifts')
            ->where('is_active', true)
            ->orderBy('priority', 'asc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'gifts' => $gifts,
        ]);
    }

    public function tools()
    {
        $categories = \DB::table('tool_categories')
            ->where('is_active', true)
            ->orderBy('order', 'asc')
            ->get();

        $tools = \DB::table('tools')
            ->where('is_active', true)
            ->orderBy('order', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'categories' => $categories,
            'tools' => $tools,
        ]);
    }
}
