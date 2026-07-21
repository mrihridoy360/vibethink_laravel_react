<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SupportTicketController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\EmailTemplateController;
use App\Http\Controllers\AdminPageController;

// API Routes
Route::prefix('api')->group(function () {
    // Auth Routes
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/logout', [AuthController::class, 'logout'])->middleware('auth');
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);

    // Course Routes
    Route::get('/courses', [CourseController::class, 'index']);
    Route::get('/courses/{slug}', [CourseController::class, 'show']);
    Route::post('/courses/{id}/interest', [CourseController::class, 'expressInterest']);
    Route::get('/courses/{slug}/reviews', [CourseController::class, 'reviews']);
    Route::get('/blogs', [CourseController::class, 'publicBlogs']);
    Route::get('/blogs/{slug}', [CourseController::class, 'publicBlogShow']);
    Route::get('/blog-categories', [CourseController::class, 'publicBlogCategories']);
    Route::get('/products', [CourseController::class, 'publicProducts']);

    // Public Settings (no auth required)
    Route::get('/settings', [AdminController::class, 'publicSettings']);

    // Visitor Tracking (Public, no auth)
    Route::post('/track-visit', [AdminController::class, 'trackVisit']);

    // ZiniPay Webhook (Public, no auth)
    Route::post('/payment/zinipay/webhook', [App\Http\Controllers\ZiniPayController::class, 'webhook'])->name('payment.zinipay.webhook');


    // Authenticated API Routes
    Route::middleware('auth')->group(function () {
        Route::post('/courses/{id}/enroll', [CourseController::class, 'enroll']);

        // ZiniPay Payment Initialization
        Route::post('/payment/zinipay/init/{courseId}', [App\Http\Controllers\ZiniPayController::class, 'initPayment']);
        Route::post('/lessons/{lessonId}/toggle-progress', [CourseController::class, 'toggleLessonProgress']);
        Route::get('/dashboard-data', [CourseController::class, 'dashboard']);

        // User Profile & Settings
        Route::get('/profile', [UserController::class, 'profile']);
        Route::put('/profile', [UserController::class, 'updateProfile']);
        Route::put('/profile/password', [UserController::class, 'updatePassword']);
        Route::post('/profile/avatar', [UserController::class, 'updateAvatar']);

        // Certificates
        Route::get('/certificates', [UserController::class, 'certificates']);

        // Billing / Payments
        Route::get('/billing', [UserController::class, 'billing']);

        // Wallet
        Route::get('/wallet', [UserController::class, 'wallet']);

        // Referral
        Route::get('/referral', [UserController::class, 'referral']);

        // Support Groups
        Route::get('/support-groups', [UserController::class, 'supportGroups']);

        // Announcements, Gifts, Tools
        Route::get('/announcements', [UserController::class, 'announcements']);
        Route::get('/gifts', [UserController::class, 'gifts']);
        Route::get('/tools', [UserController::class, 'tools']);

        // Social Review
        Route::get('/social-review', [UserController::class, 'socialReview']);
        Route::post('/social-review', [UserController::class, 'storeSocialReview']);

        // Support Tickets
        Route::get('/support-tickets', [SupportTicketController::class, 'index']);
        Route::post('/support-tickets', [SupportTicketController::class, 'store']);
        Route::get('/support-tickets/{id}', [SupportTicketController::class, 'show']);
        Route::post('/support-tickets/{id}/reply', [SupportTicketController::class, 'reply']);

        // ── Admin Routes ──────────────────────────────────────
        Route::prefix('admin')->group(function () {
            Route::get('/stats',                           [AdminController::class, 'stats']);
            Route::get('/system-info',                     [AdminController::class, 'systemInfo']);
            Route::get('/courses',                         [AdminController::class, 'courses']);
            
            // ── Course Leads ──────────────────────────────────────
            Route::get('/leads',                           [AdminController::class, 'getLeads']);
            Route::delete('/leads/{id}',                   [AdminController::class, 'destroyLead']);
            Route::post('/leads/notify/{id}',              [AdminController::class, 'notifyLead']);
            Route::get('/courses/{id}',                    [AdminController::class, 'showCourse']);
            Route::post('/courses',                        [AdminController::class, 'storeCourse']);
            Route::match(['post', 'put'], '/courses/{id}/update', [AdminController::class, 'updateCourse']);
            Route::delete('/courses/{id}',                 [AdminController::class, 'destroyCourse']);
            Route::post('/courses/{id}/toggle-publish',    [AdminController::class, 'toggleCoursePublish']);
            Route::get('/categories',                      [AdminController::class, 'categories']);
            Route::get('/categories/list',                 [AdminController::class, 'adminCategoriesList']);
            Route::post('/categories',                     [AdminController::class, 'storeCategory']);
            Route::put('/categories/{id}',                 [AdminController::class, 'updateCategory']);
            Route::delete('/categories/{id}',              [AdminController::class, 'destroyCategory']);
            Route::get('/users',                           [AdminController::class, 'users']);
            Route::put('/users/{id}',                      [AdminController::class, 'updateUser']);
            Route::delete('/users/{id}',                   [AdminController::class, 'deleteUser']);

            // ── Assignments ───────────────────────────────────────
            Route::get('/assignments',                     [AdminController::class, 'assignments']);
            Route::get('/courses/{courseId}/lessons-no-assignment', [AdminController::class, 'getLessonsForAssignment']);
            Route::post('/assignments',                    [AdminController::class, 'storeAssignment']);
            Route::put('/assignments/{id}',                [AdminController::class, 'updateAssignment']);
            Route::delete('/assignments/{id}',             [AdminController::class, 'destroyAssignment']);
            Route::get('/submissions',                     [AdminController::class, 'getSubmissions']);
            Route::post('/submissions/{id}/grade',         [AdminController::class, 'gradeSubmission']);

            Route::get('/enrollments',                     [AdminController::class, 'enrollments']);
            Route::get('/enrollments/resources',           [AdminController::class, 'enrollmentResources']);
            Route::post('/enrollments',                    [AdminController::class, 'storeEnrollment']);
            Route::delete('/enrollments/{id}',             [AdminController::class, 'cancelEnrollment']);
            Route::get('/payments',                        [AdminController::class, 'payments']);

            // ── Payment Gateways ──────────────────────────────────
            Route::get('/payment-gateways',                [AdminController::class, 'paymentGateways']);
            Route::post('/payment-gateways',               [AdminController::class, 'storePaymentGateway']);
            Route::put('/payment-gateways/{id}',           [AdminController::class, 'updatePaymentGateway']);
            Route::delete('/payment-gateways/{id}',        [AdminController::class, 'destroyPaymentGateway']);

            // ── Coupons ──────────────────────────────────────────
            Route::get('/coupons',                         [AdminController::class, 'coupons']);
            Route::post('/coupons',                        [AdminController::class, 'storeCoupon']);
            Route::put('/coupons/{id}',                    [AdminController::class, 'updateCoupon']);
            Route::delete('/coupons/{id}',                 [AdminController::class, 'destroyCoupon']);

            // ── Error Logs ────────────────────────────────────────
            Route::get('/error-logs',                      [AdminController::class, 'errorLogs']);
            Route::put('/error-logs/{id}',                 [AdminController::class, 'updateErrorLog']);
            Route::delete('/error-logs/{id}',              [AdminController::class, 'destroyErrorLog']);
            Route::post('/error-logs/clear',               [AdminController::class, 'clearErrorLogs']);
            Route::post('/error-logs/bulk-delete',         [AdminController::class, 'bulkDestroyErrorLogs']);

            // ── Announcements ────────────────────────────────────
            Route::get('/announcements',                   [AdminController::class, 'announcements']);
            Route::get('/announcements/resources',         [AdminController::class, 'announcementResources']);
            Route::post('/announcements',                  [AdminController::class, 'storeAnnouncement']);
            Route::put('/announcements/{id}',              [AdminController::class, 'updateAnnouncement']);
            Route::delete('/announcements/{id}',           [AdminController::class, 'destroyAnnouncement']);

            // ── Gifts ────────────────────────────────────────────
            Route::get('/gifts',                           [AdminController::class, 'gifts']);
            Route::post('/gifts',                          [AdminController::class, 'storeGift']);
            Route::match(['post', 'put'], '/gifts/{id}/update', [AdminController::class, 'updateGift']);
            Route::delete('/gifts/{id}',                   [AdminController::class, 'destroyGift']);

            // ── Social Reviews ───────────────────────────────────
            Route::get('/social-reviews',                  [AdminController::class, 'socialReviews']);
            Route::put('/social-reviews/{id}',             [AdminController::class, 'updateSocialReview']);
            Route::delete('/social-reviews/{id}',          [AdminController::class, 'destroySocialReview']);

            Route::get('/tickets',                         [AdminController::class, 'tickets']);
            Route::put('/tickets/{id}/status',             [AdminController::class, 'updateTicketStatus']);
            Route::post('/tickets/{id}/reply',             [AdminController::class, 'replyTicket']);

            // ── Tools & Tool Categories ──────────────────────────
            Route::get('/tool-categories',                      [AdminController::class, 'toolCategories']);
            Route::post('/tool-categories',                     [AdminController::class, 'storeToolCategory']);
            Route::match(['post', 'put'], '/tool-categories/{id}/update', [AdminController::class, 'updateToolCategory']);
            Route::delete('/tool-categories/{id}',              [AdminController::class, 'destroyToolCategory']);

            Route::get('/tools',                                [AdminController::class, 'adminTools']);
            Route::post('/tools',                               [AdminController::class, 'storeTool']);
            Route::match(['post', 'put'], '/tools/{id}/update', [AdminController::class, 'updateTool']);
            Route::delete('/tools/{id}',                        [AdminController::class, 'destroyTool']);

            // ── Products & Product Orders ────────────────────────
            Route::get('/products',                                [AdminController::class, 'adminProducts']);
            Route::post('/products',                               [AdminController::class, 'storeProduct']);
            Route::match(['post', 'put'], '/products/{id}/update', [AdminController::class, 'updateProduct']);
            Route::delete('/products/{id}',                        [AdminController::class, 'destroyProduct']);

            Route::get('/product-orders',                          [AdminController::class, 'adminProductOrders']);
            Route::patch('/product-orders/{id}/status',            [AdminController::class, 'updateProductOrderStatus']);

            // ── Referral Management ──────────────────────────────
            Route::get('/referrals',                                [AdminController::class, 'referralIndex']);
            Route::get('/referrals/settings',                       [AdminController::class, 'referralSettings']);
            Route::post('/referrals/settings',                      [AdminController::class, 'updateReferralSettings']);
            Route::get('/referrals/users/{id}',                     [AdminController::class, 'showReferralUser']);
            Route::post('/referrals/users/{id}/approve',            [AdminController::class, 'approveReferralUser']);
            Route::post('/referrals/users/{id}/reject',             [AdminController::class, 'rejectReferralUser']);
            Route::post('/referrals/users/{id}/suspend',            [AdminController::class, 'suspendReferralUser']);
            Route::delete('/referrals/users/{id}/reset',            [AdminController::class, 'resetReferralUser']);
            Route::get('/referrals/commissions',                    [AdminController::class, 'referralCommissions']);
            Route::post('/referrals/commissions/{id}/credit',       [AdminController::class, 'creditReferralCommission']);

            // ── Blog Management ──────────────────────────────────
            Route::get('/blog/posts',                               [AdminController::class, 'adminBlogPosts']);
            Route::post('/blog/posts',                              [AdminController::class, 'storeBlogPost']);
            Route::match(['post', 'put'], '/blog/posts/{id}/update', [AdminController::class, 'updateBlogPost']);
            Route::delete('/blog/posts/{id}',                       [AdminController::class, 'destroyBlogPost']);

            Route::get('/blog/categories',                          [AdminController::class, 'adminBlogCategories']);
            Route::post('/blog/categories',                         [AdminController::class, 'storeBlogCategory']);
            Route::match(['post', 'put'], '/blog/categories/{id}/update', [AdminController::class, 'updateBlogCategory']);
            Route::delete('/blog/categories/{id}',                  [AdminController::class, 'destroyBlogCategory']);

            Route::get('/blog/tags',                                [AdminController::class, 'adminBlogTags']);
            Route::post('/blog/tags',                               [AdminController::class, 'storeBlogTag']);
            Route::match(['post', 'put'], '/blog/tags/{id}/update', [AdminController::class, 'updateBlogTag']);
            Route::delete('/blog/tags/{id}',                        [AdminController::class, 'destroyBlogTag']);

            // ── Reviews Management ────────────────────────────────────
            Route::get('/reviews',                                  [AdminController::class, 'adminReviews']);
            Route::post('/reviews/{id}/toggle',                     [AdminController::class, 'toggleReviewStatus']);
            Route::delete('/reviews/{id}',                          [AdminController::class, 'destroyReview']);

            // ── Site Settings ──────────────────────────────────────────
            Route::get('/settings',                                 [AdminController::class, 'getSettings']);
            Route::post('/settings',                                [AdminController::class, 'updateSettings']);
            Route::post('/settings/upload-image',                   [AdminController::class, 'uploadSettingsImage']);

            // ── Email Templates ────────────────────────────────────────
            Route::get('/email-templates',                          [EmailTemplateController::class, 'index']);
            Route::get('/email-templates/{id}',                     [EmailTemplateController::class, 'show']);
            Route::put('/email-templates/{id}',                     [EmailTemplateController::class, 'update']);
            Route::post('/email-templates/{id}/toggle',             [EmailTemplateController::class, 'toggleStatus']);
            Route::post('/email-templates/{id}/test',               [EmailTemplateController::class, 'sendTest']);
            Route::post('/email-templates/{id}/reset',              [EmailTemplateController::class, 'resetToDefault']);

            // ── Page Management ────────────────────────────────────────
            Route::get('/pages',                                    [AdminPageController::class, 'index']);
            Route::get('/pages/{id}',                               [AdminPageController::class, 'show']);
            Route::post('/pages',                                   [AdminPageController::class, 'store']);
            Route::put('/pages/{id}',                               [AdminPageController::class, 'update']);
            Route::delete('/pages/{id}',                            [AdminPageController::class, 'destroy']);
            Route::post('/pages/{id}/toggle',                       [AdminPageController::class, 'toggleStatus']);


            // ── Visitor Analytics ─────────────────────────────────────
            Route::get('/visitor-analytics',               [AdminController::class, 'visitorAnalytics']);

            // ── Curriculum: Chapters ──────────────────────────────
            Route::get('/courses/{courseId}/chapters',     [AdminController::class, 'getChapters']);
            Route::post('/courses/{courseId}/chapters',    [AdminController::class, 'storeChapter']);
            Route::put('/chapters/{id}',                   [AdminController::class, 'updateChapter']);
            Route::delete('/chapters/{id}',                [AdminController::class, 'deleteChapter']);
            Route::post('/courses/{courseId}/chapters/reorder', [AdminController::class, 'reorderChapters']);

            // ── Curriculum: Lessons ───────────────────────────────
            Route::post('/chapters/{chapterId}/lessons',   [AdminController::class, 'storeLessonInChapter']);
            Route::put('/lessons/{id}',                    [AdminController::class, 'updateLesson']);
            Route::delete('/lessons/{id}',                 [AdminController::class, 'deleteLesson']);
            Route::post('/chapters/{chapterId}/lessons/reorder', [AdminController::class, 'reorderLessons']);
        });
    });
});

// ZiniPay redirect callback web route (browser redirect)
Route::get('/payment/zinipay/callback', [App\Http\Controllers\ZiniPayController::class, 'callback'])->name('payment.zinipay.callback');

// Dynamic XML Sitemap Route
Route::get('/sitemap.xml', [\App\Http\Controllers\SitemapController::class, 'index']);

// Dynamic Robots.txt Route
Route::get('/robots.txt', [\App\Http\Controllers\SitemapController::class, 'robots']);

// Fallback Route for React SPA
Route::get('/{any}', function ($any = '') {
    $meta = [
        'site_name'                    => 'VibeThink LMS',
        'site_description'             => '',
        'site_favicon'                 => null,
        'site_logo'                    => null,
        'facebook_domain_verification' => null,
        'google_site_verification'     => null,
        'custom_meta_tags'             => null,
        'robots'                       => 'index, follow',
        'canonical'                    => url($any),
        'json_ld'                      => null,
    ];

    $initialSettings = [];
    $defaultSiteName = 'VibeThink LMS';

    try {
        $rows = \App\Models\Setting::whereIn('group', ['general', 'appearance', 'footer', 'marketing', 'features', 'verification'])->get();
        foreach ($rows as $row) {
            if ($row->group === 'marketing' && $row->key === 'meta_capi_access_token') {
                continue;
            }
            if ($row->group === 'general' && $row->key === 'site_name') {
                $meta['site_name'] = $row->value;
                $defaultSiteName = $row->value;
            }
            if ($row->group === 'general' && $row->key === 'site_description') {
                $meta['site_description'] = $row->value;
            }
            if ($row->group === 'appearance' && $row->key === 'site_favicon') {
                $meta['site_favicon'] = $row->value;
            }
            if ($row->group === 'appearance' && $row->key === 'site_logo') {
                $meta['site_logo'] = $row->value;
            }
            if ($row->group === 'verification') {
                if ($row->key === 'facebook_domain_verification') {
                    $meta['facebook_domain_verification'] = $row->value;
                }
                if ($row->key === 'google_site_verification') {
                    $meta['google_site_verification'] = $row->value;
                }
                if ($row->key === 'custom_meta_tags') {
                    $meta['custom_meta_tags'] = $row->value;
                }
            }
            $initialSettings[$row->group][$row->key] = $row->value;
        }
    } catch (\Exception $e) {
        // Use defaults
    }

    // Dynamic Course/Blog Meta Pre-rendering
    try {
        if (preg_match('/^courses\/([^\/]+)$/', $any, $matches)) {
            $slug = $matches[1];
            $course = \App\Models\Course::where('slug', $slug)->where('is_published', true)->first();
            if ($course) {
                $title = $course->seo_title ?: $course->title;
                $meta['site_name'] = $title . ' | ' . $defaultSiteName;
                $meta['site_description'] = $course->seo_description ?: $course->short_description ?: \Illuminate\Support\Str::limit(strip_tags($course->description), 160);
                
                $image = $course->seo_image ?: $course->thumbnail;
                if ($image) {
                    $meta['site_logo'] = filter_var($image, FILTER_VALIDATE_URL) ? $image : asset($image);
                }

                // Add Course Schema JSON-LD
                $coursePrice = floatval($course->discount_price > 0 ? $course->discount_price : $course->price);
                $schema = [
                    '@context' => 'https://schema.org',
                    '@type' => 'Course',
                    'name' => $course->title,
                    'description' => $course->short_description ?: \Illuminate\Support\Str::limit(strip_tags($course->description), 160),
                    'provider' => [
                        '@type' => 'Organization',
                        'name' => $defaultSiteName,
                        'url' => url('/')
                    ]
                ];
                if ($coursePrice > 0) {
                    $schema['offers'] = [
                        '@type' => 'Offer',
                        'category' => 'Paid',
                        'price' => number_format($coursePrice, 2, '.', ''),
                        'priceCurrency' => 'BDT',
                        'url' => url('/courses/' . $course->slug)
                    ];
                } else {
                    $schema['offers'] = [
                        '@type' => 'Offer',
                        'category' => 'Free',
                        'price' => '0.00',
                        'priceCurrency' => 'BDT',
                        'url' => url('/courses/' . $course->slug)
                    ];
                }
                $meta['json_ld'] = json_encode($schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
            }
        } elseif (preg_match('/^blog\/([^\/]+)$/', $any, $matches)) {
            $slug = $matches[1];
            $blog = \App\Models\BlogPost::where('slug', $slug)->published()->first();
            if ($blog) {
                $title = $blog->meta_title ?: $blog->title;
                $meta['site_name'] = $title . ' | ' . $defaultSiteName;
                $meta['site_description'] = $blog->meta_description ?: $blog->excerpt ?: \Illuminate\Support\Str::limit(strip_tags($blog->content), 160);
                
                $image = $blog->og_image ?: $blog->featured_image;
                if ($image) {
                    $meta['site_logo'] = filter_var($image, FILTER_VALIDATE_URL) ? $image : asset($image);
                }
                $meta['robots'] = ($blog->is_indexable ? 'index' : 'noindex') . ', ' . ($blog->is_followable ? 'follow' : 'nofollow');

                // Add BlogPosting Schema JSON-LD
                $schema = [
                    '@context' => 'https://schema.org',
                    '@type' => 'BlogPosting',
                    'headline' => $blog->title,
                    'description' => $blog->excerpt ?: \Illuminate\Support\Str::limit(strip_tags($blog->content), 160),
                    'datePublished' => $blog->published_at ? $blog->published_at->toIso8601String() : ($blog->created_at ? $blog->created_at->toIso8601String() : null),
                    'dateModified' => $blog->updated_at ? $blog->updated_at->toIso8601String() : null,
                    'author' => [
                        '@type' => 'Person',
                        'name' => $blog->author ? $blog->author->name : 'Admin'
                    ],
                    'publisher' => [
                        '@type' => 'Organization',
                        'name' => $defaultSiteName,
                        'logo' => [
                            '@type' => 'ImageObject',
                            'url' => $meta['site_logo'] ?: url('/favicon.ico')
                        ]
                    ]
                ];
                if ($image) {
                    $schema['image'] = filter_var($image, FILTER_VALIDATE_URL) ? $image : asset($image);
                }
                $meta['json_ld'] = json_encode($schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
            }
        }
    } catch (\Exception $e) {
        // Log or fallback
    }

    return view('app', ['meta' => $meta, 'initialSettings' => $initialSettings]);
})->where('any', '^(?!api).*$');
