<?php

namespace App\Http\Controllers;

use App\Models\EmailTemplate;
use App\Services\EmailService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EmailTemplateController extends Controller
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

    /**
     * Display a listing of the email templates.
     */
    public function index()
    {
        $this->ensureAdmin();
        $templates = EmailTemplate::orderBy('display_name')->get();

        return response()->json([
            'success' => true,
            'templates' => $templates,
        ]);
    }

    /**
     * Display the specified template details.
     */
    public function show($id)
    {
        $this->ensureAdmin();
        $template = EmailTemplate::findOrFail($id);

        return response()->json([
            'success' => true,
            'template' => $template,
        ]);
    }

    /**
     * Update the specified template in storage.
     */
    public function update(Request $request, $id)
    {
        $this->ensureAdmin();
        $emailTemplate = EmailTemplate::findOrFail($id);

        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'body' => 'required|string',
            'is_active' => 'boolean',
        ]);

        $emailTemplate->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'ইমেইল টেমপ্লেট সফলভাবে আপডেট করা হয়েছে।',
            'template' => $emailTemplate->fresh(),
        ]);
    }

    /**
     * Toggle the active status of a template.
     */
    public function toggleStatus($id)
    {
        $this->ensureAdmin();
        $emailTemplate = EmailTemplate::findOrFail($id);

        $emailTemplate->update([
            'is_active' => !$emailTemplate->is_active,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'টেমপ্লেট স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে।',
            'template' => $emailTemplate->fresh(),
        ]);
    }

    /**
     * Send a test email using the template.
     */
    public function sendTest(Request $request, $id)
    {
        $this->ensureAdmin();
        $emailTemplate = EmailTemplate::findOrFail($id);

        $request->validate([
            'email' => 'required|email',
        ]);

        try {
            $emailService = new EmailService();
            $sampleData = $this->getSampleData($emailTemplate->name);
            
            $emailService->sendWithTemplate(
                $emailTemplate->name,
                $request->email,
                $sampleData
            );

            return response()->json([
                'success' => true,
                'message' => 'টেস্ট ইমেইল সফলভাবে পাঠানো হয়েছে: ' . $request->email,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'টেস্ট ইমেইল পাঠাতে ব্যর্থ হয়েছে: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Reset template to default content.
     */
    public function resetToDefault($id)
    {
        $this->ensureAdmin();
        $emailTemplate = EmailTemplate::findOrFail($id);
        $defaults = $this->getDefaultTemplates();
        
        if (isset($defaults[$emailTemplate->name])) {
            $default = $defaults[$emailTemplate->name];
            $emailTemplate->update([
                'subject' => $default['subject'],
                'body' => $default['body'],
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'ইমেইল টেমপ্লেট রিসেট করা হয়েছে।',
                'template' => $emailTemplate->fresh(),
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'ডিফল্ট টেমপ্লেট পাওয়া যায়নি।',
        ], 404);
    }

    /**
     * Get sample data for testing templates.
     */
    private function getSampleData(string $templateName): array
    {
        $commonData = [
            'site_name' => config('app.name', 'VibeThink'),
            'site_url' => config('app.url', url('/')),
            'user_name' => 'John Doe',
            'user_email' => 'john@example.com',
            'current_year' => date('Y'),
        ];

        $templateSpecificData = [
            'welcome_email' => [
                'login_url' => url('/login'),
            ],
            'email_verification' => [
                'verification_url' => url('/verify-email/sample-token'),
                'expiry_minutes' => 60,
            ],
            'password_reset' => [
                'reset_url' => url('/reset-password/sample-token'),
                'expiry_minutes' => 60,
            ],
            'course_enrollment' => [
                'course_name' => 'Complete Web Development Course',
                'course_url' => url('/courses/1'),
                'instructor_name' => 'Jane Smith',
            ],
            'payment_confirmation' => [
                'course_name' => 'Complete Web Development Course',
                'amount' => '৳5,000',
                'payment_method' => 'bKash',
                'transaction_id' => 'TXN123456789',
                'payment_date' => date('F j, Y'),
            ],
            'referral_commission' => [
                'referred_user' => 'Alice Johnson',
                'commission_amount' => '৳500',
                'course_name' => 'Complete Web Development Course',
                'total_earnings' => '৳2,500',
            ],
        ];

        return array_merge($commonData, $templateSpecificData[$templateName] ?? []);
    }

    /**
     * Get default template contents.
     */
    private function getDefaultTemplates(): array
    {
        return (new \Database\Seeders\EmailTemplateSeeder())->getDefaultTemplates();
    }
}
