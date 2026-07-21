<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Course;
use App\Models\Payment;
use App\Models\Enrollment;
use App\Models\PaymentGateway;
use App\Services\ZiniPayService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ZiniPayController extends Controller
{
    protected $ziniPayService;

    public function __construct(ZiniPayService $ziniPayService)
    {
        $this->ziniPayService = $ziniPayService;
    }

    /**
     * Initialize ZiniPay Payment for a specific course.
     *
     * @param Request $request
     * @param int $courseId
     * @return \Illuminate\Http\JsonResponse
     */
    public function initPayment(Request $request, $courseId)
    {
        $user = Auth::user();
        $course = Course::findOrFail($courseId);

        // Verify if user is already enrolled
        $existing = Enrollment::where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'You are already enrolled in this course.'
            ], 400);
        }

        // Get ZiniPay configuration settings
        $gateway = PaymentGateway::where('key', 'zinipay')->first();
        if (!$gateway || !$gateway->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'ZiniPay payment method is currently disabled.'
            ], 400);
        }

        $apiKey = $gateway->config['api_key'] ?? '';
        if (empty($apiKey) || $apiKey === 'YOUR_ZINIPAY_API_KEY') {
            return response()->json([
                'success' => false,
                'message' => 'ZiniPay is not properly configured. Please contact LMS support.'
            ], 400);
        }

        $amount = $course->discount_price > 0 ? $course->discount_price : $course->price;
        
        // If course is free (amount <= 0), directly enroll
        if ($amount <= 0) {
            $enrollment = Enrollment::create([
                'user_id' => $user->id,
                'course_id' => $course->id,
                'status' => 'active',
                'progress' => 0,
                'completed_lessons_count' => 0
            ]);

            return response()->json([
                'success' => true,
                'free' => true,
                'message' => 'Successfully enrolled in this course (Free).',
                'enrollment' => $enrollment
            ]);
        }

        // Generate unique reference code for val_id
        $valId = 'INV-ZINI-' . strtoupper(Str::random(12));

        // Create pending payment transaction record in DB
        Payment::create([
            'user_id' => $user->id,
            'course_id' => $course->id,
            'amount' => $amount,
            'transaction_id' => $valId,
            'payment_method' => 'zinipay',
            'status' => 'pending',
            'payment_data' => []
        ]);

        $metadata = [
            'user_id' => $user->id,
            'course_id' => $course->id
        ];

        // Format initialization payload
        $paymentPayload = [
            'cus_name' => $user->name,
            'cus_email' => $user->email,
            'amount' => (float)$amount,
            'metadata' => $metadata,
            'redirect_url' => route('payment.zinipay.callback'),
            'cancel_url' => route('payment.zinipay.callback') . '?cancel=1&val_id=' . $valId,
            'val_id' => $valId,
            'webhook_url' => route('payment.zinipay.webhook')
        ];

        $response = $this->ziniPayService->initPayment($paymentPayload);

        if (isset($response['status']) && $response['status'] && isset($response['payment_url'])) {
            return response()->json([
                'success' => true,
                'payment_url' => $response['payment_url']
            ]);
        }

        // Mark local pending payment as failed since ZiniPay checkout failed to initialize
        Log::error('ZiniPay checkout initialization failed', ['response' => $response]);
        Payment::where('transaction_id', $valId)->update(['status' => 'failed']);

        return response()->json([
            'success' => false,
            'message' => 'Failed to initialize ZiniPay checkout: ' . ($response['message'] ?? 'Unknown Error')
        ], 500);
    }

    /**
     * Initialize ZiniPay Payment for a product purchase.
     */
    public function initProductPayment(Request $request, $productId)
    {
        $user = Auth::user();
        $product = \App\Models\Product::where('is_active', true)->findOrFail($productId);
        $quantity = max(1, (int)$request->input('quantity', 1));

        if ($product->stock !== null && $product->stock < $quantity) {
            return response()->json([
                'success' => false,
                'message' => 'দুঃখিত, পণ্যটি পর্যাপ্ত স্টকে নেই।'
            ], 400);
        }

        $gateway = PaymentGateway::where('key', 'zinipay')->first();
        if (!$gateway || !$gateway->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'ZiniPay পেমেন্ট মেথডটি বর্তমানে নিষ্ক্রিয় রয়েছে।'
            ], 400);
        }

        $apiKey = $gateway->config['api_key'] ?? '';
        if (empty($apiKey) || $apiKey === 'YOUR_ZINIPAY_API_KEY') {
            return response()->json([
                'success' => false,
                'message' => 'ZiniPay সঠিকভাবে কনফিগার করা হয়নি।'
            ], 400);
        }

        $unitPrice = (float)($product->sale_price ?? $product->price);
        $totalAmount = $unitPrice * $quantity;

        $valId = 'PRD-ZINI-' . strtoupper(Str::random(12));

        $order = \App\Models\ProductOrder::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'order_number' => $valId,
            'quantity' => $quantity,
            'price' => $unitPrice,
            'total' => $totalAmount,
            'status' => 'pending',
            'payment_method' => 'zinipay',
            'notes' => $request->input('notes'),
        ]);

        $metadata = [
            'type' => 'product',
            'user_id' => $user->id,
            'product_id' => $product->id,
            'order_id' => $order->id,
        ];

        $paymentPayload = [
            'cus_name' => $user->name,
            'cus_email' => $user->email,
            'amount' => (float)$totalAmount,
            'metadata' => $metadata,
            'redirect_url' => route('payment.zinipay.callback'),
            'cancel_url' => route('payment.zinipay.callback') . '?cancel=1&val_id=' . $valId,
            'val_id' => $valId,
            'webhook_url' => route('payment.zinipay.webhook')
        ];

        $response = $this->ziniPayService->initPayment($paymentPayload);

        if (isset($response['status']) && $response['status'] && isset($response['payment_url'])) {
            return response()->json([
                'success' => true,
                'payment_url' => $response['payment_url']
            ]);
        }

        Log::error('ZiniPay product checkout initialization failed', ['response' => $response]);
        $order->update(['status' => 'cancelled']);

        return response()->json([
            'success' => false,
            'message' => 'ZiniPay চেকআউট শুরু করতে ব্যর্থ হয়েছে: ' . ($response['message'] ?? 'অজানা সমস্যা')
        ], 500);
    }

    /**
     * Handle browser redirect callback from ZiniPay.
     *
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function callback(Request $request)
    {
        // Check for payment cancellation
        if ($request->input('cancel') == 1) {
            $valId = $request->input('val_id');
            if ($valId) {
                Payment::where('transaction_id', $valId)->where('status', 'pending')->update(['status' => 'failed']);
                \App\Models\ProductOrder::where('order_number', $valId)->where('status', 'pending')->update(['status' => 'cancelled']);
            }
            return redirect('/payment/failed?error=Payment canceled by user');
        }

        $invoiceId = $request->input('invoice_id');
        $valId = $request->input('val_id');
        $status = $request->input('status');

        Log::info('ZiniPay redirect callback received', [
            'invoice_id' => $invoiceId,
            'val_id' => $valId,
            'status' => $status
        ]);

        if (!$invoiceId && !$valId) {
            return redirect('/payment/failed?error=Invalid callback parameters');
        }

        // Call verification API to double check transaction status
        $verifyId = $invoiceId ?: $valId;
        $response = $this->ziniPayService->verifyPayment($verifyId);

        if (isset($response['status']) && $response['status'] === 'COMPLETED') {
            $processed = $this->processCompletedPayment($response);

            if ($processed['success']) {
                if (!empty($processed['is_product'])) {
                    return redirect('/dashboard/products?tab=orders&success=1&trx=' . $processed['trx_id']);
                }
                return redirect('/payment/success?slug=' . $processed['course_slug'] . '&trx=' . $processed['trx_id'] . '&amount=' . ($processed['amount'] ?? ''));
            } else {
                return redirect('/payment/failed?error=' . urlencode($processed['message']));
            }
        }

        // Mark payment as failed in case it is FAILED
        $targetValId = $response['val_id'] ?? $valId;
        if ($targetValId) {
            Payment::where('transaction_id', $targetValId)->where('status', 'pending')->update(['status' => 'failed']);
            \App\Models\ProductOrder::where('order_number', $targetValId)->where('status', 'pending')->update(['status' => 'cancelled']);
        }

        return redirect('/payment/failed?error=Payment was not successful. Status: ' . ($response['status'] ?? 'Unknown'));
    }

    /**
     * Handle server-to-server webhook updates from ZiniPay.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function webhook(Request $request)
    {
        $invoiceId = $request->input('invoice_id');
        $valId = $request->input('val_id');

        Log::info('ZiniPay webhook request received', [
            'invoice_id' => $invoiceId,
            'val_id' => $valId,
            'payload' => $request->all()
        ]);

        if (!$invoiceId && !$valId) {
            return response()->json(['success' => false, 'message' => 'No IDs supplied'], 400);
        }

        $verifyId = $invoiceId ?: $valId;
        $response = $this->ziniPayService->verifyPayment($verifyId);

        if (isset($response['status']) && $response['status'] === 'COMPLETED') {
            $processed = $this->processCompletedPayment($response);
            return response()->json($processed);
        }

        // Handle failed webhook notification status
        $targetValId = $response['val_id'] ?? $valId;
        if ($targetValId && isset($response['status']) && $response['status'] === 'FAILED') {
            Payment::where('transaction_id', $targetValId)->where('status', 'pending')->update(['status' => 'failed']);
            \App\Models\ProductOrder::where('order_number', $targetValId)->where('status', 'pending')->update(['status' => 'cancelled']);
        }

        return response()->json(['success' => false, 'message' => 'Status verification is not COMPLETED: ' . ($response['status'] ?? 'unknown')]);
    }

    /**
     * Process logic to mark transaction as completed and enroll user or fulfill product order.
     *
     * @param array $response
     * @return array
     */
    protected function processCompletedPayment(array $response)
    {
        $valId = $response['val_id'] ?? null;
        if (!$valId) {
            return ['success' => false, 'message' => 'Missing merchant validation val_id'];
        }

        // Check if this is a Product Order
        $productOrder = \App\Models\ProductOrder::where('order_number', $valId)->first();
        if ($productOrder) {
            if ($productOrder->status === 'completed') {
                return [
                    'success' => true,
                    'is_product' => true,
                    'trx_id' => $productOrder->order_number,
                    'amount' => $productOrder->total
                ];
            }

            $productOrder->status = 'completed';
            $productOrder->completed_at = now();
            $productOrder->payment_data = $response;
            $productOrder->save();

            // Decrement stock if needed
            $product = \App\Models\Product::find($productOrder->product_id);
            if ($product && $product->stock !== null && $product->stock >= $productOrder->quantity) {
                $product->decrement('stock', $productOrder->quantity);
            }

            return [
                'success' => true,
                'is_product' => true,
                'trx_id' => $productOrder->order_number,
                'amount' => $productOrder->total
            ];
        }


        $payment = Payment::where('transaction_id', $valId)->first();
        if (!$payment) {
            return ['success' => false, 'message' => 'Payment record not found for: ' . $valId];
        }

        $course = Course::find($payment->course_id);
        if (!$course) {
            return ['success' => false, 'message' => 'Course associated with payment not found'];
        }

        // If transaction already processed, skip duplicate operations
        if ($payment->status === 'completed') {
            return [
                'success' => true,
                'course_slug' => $course->slug,
                'trx_id' => $payment->transaction_id,
                'amount' => $payment->amount
            ];
        }

        // Mark payment as completed
        $payment->status = 'completed';
        $payment->payment_method = 'zinipay';
        $payment->payment_data = $response;
        $payment->save();

        // Send Meta CAPI Purchase event
        try {
            $user = \App\Models\User::find($payment->user_id);
            if ($user) {
                $names = explode(' ', $user->name, 2);
                $firstName = $names[0] ?? '';
                $lastName = $names[1] ?? '';

                app(\App\Services\MetaCapiService::class)->sendEvent(
                    'Purchase',
                    [
                        'id' => $user->id,
                        'email' => $user->email,
                        'phone' => $user->phone,
                        'first_name' => $firstName,
                        'last_name' => $lastName,
                    ],
                    [
                        'value' => (float)$payment->amount,
                        'currency' => 'BDT',
                        'content_ids' => [(string)$course->id],
                        'content_name' => $course->title,
                        'content_type' => 'product'
                    ],
                    $payment->transaction_id,
                    url("/payment/success?slug={$course->slug}&trx={$payment->transaction_id}&amount={$payment->amount}")
                );
            }
        } catch (\Exception $e) {
            Log::error('Meta CAPI Purchase tracking failed: ' . $e->getMessage());
        }

        // Create or activate enrollment
        $enrollment = Enrollment::where('user_id', $payment->user_id)
            ->where('course_id', $payment->course_id)
            ->first();

        if (!$enrollment) {
            Enrollment::create([
                'user_id' => $payment->user_id,
                'course_id' => $payment->course_id,
                'status' => 'active',
                'progress' => 0,
                'completed_lessons_count' => 0
            ]);
        } else {
            $enrollment->status = 'active';
            $enrollment->save();
        }

        // Send notifications/emails if available
        try {
            $user = \App\Models\User::find($payment->user_id);
            if ($user) {
                if (class_exists('\App\Notifications\CourseEnrollmentNotification')) {
                    $user->notify(new \App\Notifications\CourseEnrollmentNotification($course));
                }
            }
        } catch (\Exception $e) {
            Log::error('ZiniPay notifications dispatch failed: ' . $e->getMessage());
        }

        return [
            'success' => true,
            'course_slug' => $course->slug,
            'trx_id' => $payment->transaction_id,
            'amount' => $payment->amount
        ];
    }
}
