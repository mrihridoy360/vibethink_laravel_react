<?php

namespace Database\Seeders;

use App\Models\EmailTemplate;
use Illuminate\Database\Seeder;

class EmailTemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $templates = $this->getDefaultTemplates();

        foreach ($templates as $name => $template) {
            EmailTemplate::updateOrCreate(
                ['name' => $name],
                $template
            );
        }
    }

    /**
     * Get default email templates.
     */
    public function getDefaultTemplates(): array
    {
        $siteName = config('app.name', 'VibeThink');
        
        return [
            'welcome_email' => [
                'display_name' => 'Welcome Email',
                'subject' => 'Welcome to {{site_name}}! 🎉',
                'description' => 'Sent to new users after registration',
                'variables' => [
                    'user_name' => 'User\'s full name',
                    'user_email' => 'User\'s email address',
                    'login_url' => 'Login page URL',
                    'site_name' => 'Website name',
                    'site_url' => 'Website URL',
                    'current_year' => 'Current year',
                ],
                'body' => $this->getWelcomeEmailBody(),
                'is_active' => true,
            ],
            'email_verification' => [
                'display_name' => 'Email Verification',
                'subject' => 'Verify Your Email Address - {{site_name}}',
                'description' => 'Sent when user needs to verify their email',
                'variables' => [
                    'user_name' => 'User\'s full name',
                    'verification_url' => 'Email verification link',
                    'expiry_minutes' => 'Link expiry time in minutes',
                    'site_name' => 'Website name',
                    'site_url' => 'Website URL',
                    'current_year' => 'Current year',
                ],
                'body' => $this->getEmailVerificationBody(),
                'is_active' => true,
            ],
            'password_reset' => [
                'display_name' => 'Password Reset',
                'subject' => 'Reset Your Password - {{site_name}}',
                'description' => 'Sent when user requests password reset',
                'variables' => [
                    'user_name' => 'User\'s full name',
                    'reset_url' => 'Password reset link',
                    'expiry_minutes' => 'Link expiry time in minutes',
                    'site_name' => 'Website name',
                    'site_url' => 'Website URL',
                    'current_year' => 'Current year',
                ],
                'body' => $this->getPasswordResetBody(),
                'is_active' => true,
            ],
            'course_enrollment' => [
                'display_name' => 'Course Enrollment Confirmation',
                'subject' => 'You\'re Enrolled! 📚 {{course_name}}',
                'description' => 'Sent when user enrolls in a course',
                'variables' => [
                    'user_name' => 'User\'s full name',
                    'course_name' => 'Course title',
                    'course_url' => 'Course page URL',
                    'instructor_name' => 'Instructor name',
                    'site_name' => 'Website name',
                    'site_url' => 'Website URL',
                    'current_year' => 'Current year',
                ],
                'body' => $this->getCourseEnrollmentBody(),
                'is_active' => true,
            ],
            'payment_confirmation' => [
                'display_name' => 'Payment Confirmation',
                'subject' => 'Payment Successful! ✅ {{course_name}}',
                'description' => 'Sent when payment is confirmed',
                'variables' => [
                    'user_name' => 'User\'s full name',
                    'course_name' => 'Course title',
                    'amount' => 'Payment amount',
                    'payment_method' => 'Payment method used',
                    'transaction_id' => 'Transaction ID',
                    'payment_date' => 'Payment date',
                    'site_name' => 'Website name',
                    'site_url' => 'Website URL',
                    'current_year' => 'Current year',
                ],
                'body' => $this->getPaymentConfirmationBody(),
                'is_active' => true,
            ],
            'referral_commission' => [
                'display_name' => 'Referral Commission Notification',
                'subject' => 'You Earned a Commission! 💰 {{commission_amount}}',
                'description' => 'Sent when user earns referral commission',
                'variables' => [
                    'user_name' => 'User\'s full name',
                    'referred_user' => 'Referred user name',
                    'commission_amount' => 'Commission amount earned',
                    'course_name' => 'Course purchased',
                    'total_earnings' => 'Total referral earnings',
                    'site_name' => 'Website name',
                    'site_url' => 'Website URL',
                    'current_year' => 'Current year',
                ],
                'body' => $this->getReferralCommissionBody(),
                'is_active' => true,
            ],
        ];
    }

    private function getWelcomeEmailBody(): string
    {
        return <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px 16px 0 0; padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Welcome to {{site_name}}! 🎉</h1>
        </div>
        <div style="background-color: #ffffff; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Hi <strong>{{user_name}}</strong>,
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Welcome aboard! We're thrilled to have you join our learning community. Your journey to acquiring new skills starts here.
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                With {{site_name}}, you'll have access to high-quality courses, expert instructors, and a supportive community of learners.
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{login_url}}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                    Start Learning Now
                </a>
            </div>
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 30px 0 0; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                If you have any questions, feel free to reply to this email. We're here to help!
            </p>
        </div>
        <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p style="margin: 0;">© {{current_year}} {{site_name}}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
HTML;
    }

    private function getEmailVerificationBody(): string
    {
        return <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 16px 16px 0 0; padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Verify Your Email ✉️</h1>
        </div>
        <div style="background-color: #ffffff; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Hi <strong>{{user_name}}</strong>,
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                Please click the button below to verify your email address. This link will expire in {{expiry_minutes}} minutes.
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{verification_url}}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                    Verify Email Address
                </a>
            </div>
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 30px 0 0; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                If you didn't create an account, no further action is required.
            </p>
        </div>
        <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p style="margin: 0;">© {{current_year}} {{site_name}}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
HTML;
    }

    private function getPasswordResetBody(): string
    {
        return <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 16px 16px 0 0; padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Reset Your Password 🔐</h1>
        </div>
        <div style="background-color: #ffffff; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Hi <strong>{{user_name}}</strong>,
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                You requested to reset your password. Click the button below to set a new password. This link will expire in {{expiry_minutes}} minutes.
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{reset_url}}" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                    Reset Password
                </a>
            </div>
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 30px 0 0; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                If you didn't request a password reset, please ignore this email or contact support if you have concerns.
            </p>
        </div>
        <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p style="margin: 0;">© {{current_year}} {{site_name}}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
HTML;
    }

    private function getCourseEnrollmentBody(): string
    {
        return <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); border-radius: 16px 16px 0 0; padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">You're Enrolled! 📚</h1>
        </div>
        <div style="background-color: #ffffff; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Hi <strong>{{user_name}}</strong>,
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Congratulations! You've successfully enrolled in:
            </p>
            <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #3b82f6;">
                <h2 style="color: #1e40af; margin: 0 0 10px; font-size: 20px;">{{course_name}}</h2>
                <p style="color: #6b7280; margin: 0; font-size: 14px;">Instructor: {{instructor_name}}</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{course_url}}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                    Start Learning
                </a>
            </div>
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 30px 0 0; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                Happy learning! If you have any questions, feel free to reach out to us.
            </p>
        </div>
        <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p style="margin: 0;">© {{current_year}} {{site_name}}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
HTML;
    }

    private function getPaymentConfirmationBody(): string
    {
        return <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 16px 16px 0 0; padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Payment Successful! ✅</h1>
        </div>
        <div style="background-color: #ffffff; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Hi <strong>{{user_name}}</strong>,
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Your payment has been successfully processed. Here are the details:
            </p>
            <div style="background-color: #f9fafb; border-radius: 12px; padding: 20px; margin: 20px 0;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Course</td>
                        <td style="padding: 10px 0; color: #111827; font-size: 14px; text-align: right; font-weight: 600;">{{course_name}}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb;">Amount</td>
                        <td style="padding: 10px 0; color: #059669; font-size: 14px; text-align: right; font-weight: 600; border-top: 1px solid #e5e7eb;">{{amount}}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb;">Payment Method</td>
                        <td style="padding: 10px 0; color: #111827; font-size: 14px; text-align: right; border-top: 1px solid #e5e7eb;">{{payment_method}}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb;">Transaction ID</td>
                        <td style="padding: 10px 0; color: #111827; font-size: 14px; text-align: right; border-top: 1px solid #e5e7eb;">{{transaction_id}}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb;">Date</td>
                        <td style="padding: 10px 0; color: #111827; font-size: 14px; text-align: right; border-top: 1px solid #e5e7eb;">{{payment_date}}</td>
                    </tr>
                </table>
            </div>
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 30px 0 0; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                Thank you for your purchase! You can now access the course from your dashboard.
            </p>
        </div>
        <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p style="margin: 0;">© {{current_year}} {{site_name}}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
HTML;
    }

    private function getReferralCommissionBody(): string
    {
        return <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); border-radius: 16px 16px 0 0; padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">You Earned a Commission! 💰</h1>
        </div>
        <div style="background-color: #ffffff; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Hi <strong>{{user_name}}</strong>,
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Great news! You've earned a referral commission!
            </p>
            <div style="background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%); border-radius: 12px; padding: 25px; margin: 20px 0; text-align: center; border: 1px solid #e9d5ff;">
                <p style="color: #7c3aed; font-size: 36px; font-weight: 700; margin: 0;">{{commission_amount}}</p>
                <p style="color: #6b7280; font-size: 14px; margin: 10px 0 0;">Commission Earned</p>
            </div>
            <div style="background-color: #f9fafb; border-radius: 12px; padding: 15px 20px; margin: 20px 0;">
                <p style="color: #6b7280; font-size: 14px; margin: 0 0 5px;">Referred User: <strong style="color: #111827;">{{referred_user}}</strong></p>
                <p style="color: #6b7280; font-size: 14px; margin: 0;">Course: <strong style="color: #111827;">{{course_name}}</strong></p>
            </div>
            <div style="background-color: #f0fdf4; border-radius: 12px; padding: 15px 20px; margin: 20px 0; border: 1px solid #bbf7d0;">
                <p style="color: #166534; font-size: 14px; margin: 0;">
                    🎯 Your total referral earnings: <strong>{{total_earnings}}</strong>
                </p>
            </div>
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 30px 0 0; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                Keep sharing and keep earning! Thank you for being a valuable member of our community.
            </p>
        </div>
        <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p style="margin: 0;">© {{current_year}} {{site_name}}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
HTML;
    }
}
