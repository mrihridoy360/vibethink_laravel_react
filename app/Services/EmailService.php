<?php

namespace App\Services;

use App\Models\EmailTemplate;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class EmailService
{
    /**
     * Send an email using a template.
     */
    public function sendWithTemplate(string $templateName, string $toEmail, array $data = [], ?string $toName = null): bool
    {
        try {
            $template = EmailTemplate::getByName($templateName);

            if (!$template) {
                Log::warning("Email template not found: {$templateName}");
                return false;
            }

            $rendered = $template->render($data);

            Mail::html($rendered['body'], function ($message) use ($toEmail, $toName, $rendered) {
                $message->to($toEmail, $toName)
                    ->subject($rendered['subject']);
            });

            Log::info("Email sent successfully", [
                'template' => $templateName,
                'to' => $toEmail,
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error("Failed to send email", [
                'template' => $templateName,
                'to' => $toEmail,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Send welcome email to new user.
     */
    public function sendWelcomeEmail(string $email, string $name): bool
    {
        return $this->sendWithTemplate('welcome_email', $email, [
            'user_name' => $name,
            'user_email' => $email,
            'login_url' => url('/login'),
            'site_name' => config('app.name'),
            'site_url' => config('app.url'),
            'current_year' => date('Y'),
        ], $name);
    }

    /**
     * Send course enrollment confirmation.
     */
    public function sendEnrollmentConfirmation(string $email, string $userName, array $courseData): bool
    {
        return $this->sendWithTemplate('course_enrollment', $email, [
            'user_name' => $userName,
            'course_name' => $courseData['name'],
            'course_url' => $courseData['url'],
            'instructor_name' => $courseData['instructor'] ?? 'Instructor',
            'site_name' => config('app.name'),
            'site_url' => config('app.url'),
            'current_year' => date('Y'),
        ], $userName);
    }

    /**
     * Send payment confirmation.
     */
    public function sendPaymentConfirmation(string $email, string $userName, array $paymentData): bool
    {
        return $this->sendWithTemplate('payment_confirmation', $email, [
            'user_name' => $userName,
            'course_name' => $paymentData['course_name'],
            'amount' => $paymentData['amount'],
            'payment_method' => $paymentData['payment_method'],
            'transaction_id' => $paymentData['transaction_id'],
            'payment_date' => $paymentData['payment_date'],
            'site_name' => config('app.name'),
            'site_url' => config('app.url'),
            'current_year' => date('Y'),
        ], $userName);
    }

    /**
     * Send referral commission notification.
     */
    public function sendReferralCommissionNotification(string $email, string $userName, array $commissionData): bool
    {
        return $this->sendWithTemplate('referral_commission', $email, [
            'user_name' => $userName,
            'referred_user' => $commissionData['referred_user'],
            'commission_amount' => $commissionData['commission_amount'],
            'course_name' => $commissionData['course_name'],
            'total_earnings' => $commissionData['total_earnings'],
            'site_name' => config('app.name'),
            'site_url' => config('app.url'),
            'current_year' => date('Y'),
        ], $userName);
    }

    /**
     * Preview a template with sample data (for admin).
     */
    public function previewTemplate(EmailTemplate $template, array $data = []): array
    {
        // Merge with default sample data
        $defaultData = [
            'site_name' => config('app.name'),
            'site_url' => config('app.url'),
            'user_name' => 'Sample User',
            'user_email' => 'sample@example.com',
            'current_year' => date('Y'),
        ];

        return $template->render(array_merge($defaultData, $data));
    }
}
