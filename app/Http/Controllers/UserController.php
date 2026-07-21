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
use App\Services\CloudinaryService;

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

    public function updateAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|max:1024', // Max 1 MB
        ], [
            'avatar.max' => 'ছবির সাইজ ১ মেগাবাইটের বেশি হওয়া যাবে না।',
            'avatar.image' => 'আপলোড করা ফাইলটি অবশ্যই একটি ছবি হতে হবে।',
        ]);

        $user = Auth::user();
        $cloudinary = new CloudinaryService();

        // Delete old avatar from Cloudinary if it exists and is a Cloudinary URL
        if ($user->avatar && $cloudinary->isCloudinaryUrl($user->avatar)) {
            $publicId = $cloudinary->extractPublicId($user->avatar);
            if ($publicId) {
                $cloudinary->deleteImage($publicId);
            }
        }

        $result = $cloudinary->uploadImage($request->file('avatar'), 'avatars', [
            'transformation' => 'w_150,h_150,c_fill,q_50',
            'format' => 'webp'
        ]);

        if (!$result || !isset($result['url'])) {
            return response()->json([
                'success' => false,
                'message' => 'Cloudinary-তে ছবি আপলোড করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
            ], 500);
        }

        $user->update([
            'avatar' => $result['url'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'প্রোফাইল ছবি সফলভাবে আপডেট হয়েছে।',
            'user' => $user->fresh(),
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

        $giftsUnlocked = \App\Models\SocialReview::where('user_id', Auth::id())
            ->where('status', 'approved')
            ->exists();

        return response()->json([
            'success' => true,
            'gifts' => $gifts,
            'gifts_unlocked' => $giftsUnlocked,
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

    public function socialReview()
    {
        $review = \App\Models\SocialReview::where('user_id', Auth::id())->first();

        return response()->json([
            'success' => true,
            'review'  => $review,
        ]);
    }

    public function storeSocialReview(Request $request)
    {
        $request->validate([
            'review_url' => 'required|url'
        ]);

        $review = \App\Models\SocialReview::updateOrCreate(
            ['user_id' => Auth::id()],
            [
                'review_url' => $request->review_url,
                'status' => 'pending'
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'রিভিউ সফলভাবে সাবমিট করা হয়েছে। অ্যাডমিন ভেরিফিকেশনের জন্য অপেক্ষা করুন।',
            'review' => $review,
        ]);
    }

    // ───────────────────────────────────────────
    // Products & Product Orders
    // ───────────────────────────────────────────

    public function productOrders()
    {
        $user = Auth::user();

        $orders = \App\Models\ProductOrder::with('product')
            ->where('user_id', $user->id)
            ->latest()
            ->get();

        $wallet = \App\Models\UserWallet::where('user_id', $user->id)->first();

        return response()->json([
            'success'        => true,
            'orders'         => $orders,
            'wallet_balance' => $wallet ? (float)$wallet->balance : 0,
        ]);
    }

    public function orderProduct(Request $request, $id)
    {
        $user = Auth::user();

        $request->validate([
            'quantity'       => 'nullable|integer|min:1',
            'payment_method' => 'required|string',
            'transaction_id' => 'nullable|string|max:255',
            'sender_number'  => 'nullable|string|max:255',
            'notes'          => 'nullable|string|max:1000',
        ]);

        $product = \App\Models\Product::where('is_active', true)->findOrFail($id);

        $quantity = max(1, (int) $request->input('quantity', 1));

        if ($product->stock !== null && $product->stock < $quantity) {
            return response()->json([
                'success' => false,
                'message' => 'দুঃখিত, পণ্যটি পর্যাপ্ত স্টকে নেই।'
            ], 400);
        }

        $unitPrice   = (float) ($product->sale_price ?? $product->price);
        $totalAmount = $unitPrice * $quantity;
        $paymentMethod = $request->input('payment_method', 'wallet');

        if ($paymentMethod === 'zinipay') {
            return app(\App\Http\Controllers\ZiniPayController::class)->initProductPayment($request, $id);
        }

        \Illuminate\Support\Facades\DB::beginTransaction();
        try {
            $status      = 'pending';
            $completedAt = null;

            if ($paymentMethod === 'wallet') {
                $wallet = \App\Models\UserWallet::firstOrCreate(
                    ['user_id' => $user->id],
                    ['balance' => 0, 'total_earned' => 0, 'total_withdrawn' => 0, 'total_spent' => 0]
                );

                if ($wallet->balance < $totalAmount) {
                    \Illuminate\Support\Facades\DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => 'আপনার ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই। বর্তমান ব্যালেন্স: ৳' . number_format($wallet->balance, 2)
                    ], 400);
                }

                // Deduct balance
                $wallet->balance -= $totalAmount;
                $wallet->total_spent += $totalAmount;
                $wallet->save();

                // Create Wallet Transaction log
                \App\Models\WalletTransaction::create([
                    'user_id'   => $user->id,
                    'type'      => 'debit',
                    'amount'    => $totalAmount,
                    'title'     => 'পণ্য ক্রয়: ' . $product->name,
                    'status'    => 'completed',
                    'reference' => 'Product Order #' . $product->id,
                ]);

                $status      = 'completed';
                $completedAt = now();
            }

            // Decrement stock if limited
            if ($product->stock !== null && $product->stock >= $quantity) {
                $product->decrement('stock', $quantity);
            }

            $paymentData = [
                'transaction_id' => $request->input('transaction_id'),
                'sender_number'  => $request->input('sender_number'),
                'notes'          => $request->input('notes'),
            ];

            $order = \App\Models\ProductOrder::create([
                'user_id'        => $user->id,
                'product_id'     => $product->id,
                'quantity'       => $quantity,
                'price'          => $unitPrice,
                'total'          => $totalAmount,
                'status'         => $status,
                'payment_method' => $paymentMethod,
                'payment_data'   => $paymentData,
                'notes'          => $request->input('notes'),
                'completed_at'   => $completedAt,
            ]);

            \Illuminate\Support\Facades\DB::commit();

            return response()->json([
                'success' => true,
                'message' => $status === 'completed' 
                    ? 'পণ্যটি সফলভাবে ক্রয় করা হয়েছে!' 
                    : 'আপনার পণ্যের অর্ডারটি জমা নেওয়া হয়েছে। অ্যাডমিন ভেরিফাই করলে স্ট্যাটাস আপডেট হবে।',
                'order'   => $order->load('product'),
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'অর্ডার করতে সমস্যা হয়েছে: ' . $e->getMessage()
            ], 500);
        }
    }
}

