<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SupportTicketController;
use App\Http\Controllers\AdminController;

// API Routes
Route::prefix('api')->group(function () {
    // Auth Routes
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/logout', [AuthController::class, 'logout'])->middleware('auth');
    Route::get('/auth/me', [AuthController::class, 'me']);

    // Course Routes
    Route::get('/courses', [CourseController::class, 'index']);
    Route::get('/courses/{slug}', [CourseController::class, 'show']);

    // Authenticated API Routes
    Route::middleware('auth')->group(function () {
        Route::post('/courses/{id}/enroll', [CourseController::class, 'enroll']);
        Route::post('/lessons/{lessonId}/toggle-progress', [CourseController::class, 'toggleLessonProgress']);
        Route::get('/dashboard-data', [CourseController::class, 'dashboard']);

        // User Profile & Settings
        Route::get('/profile', [UserController::class, 'profile']);
        Route::put('/profile', [UserController::class, 'updateProfile']);
        Route::put('/profile/password', [UserController::class, 'updatePassword']);

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

        // Support Tickets
        Route::get('/support-tickets', [SupportTicketController::class, 'index']);
        Route::post('/support-tickets', [SupportTicketController::class, 'store']);
        Route::get('/support-tickets/{id}', [SupportTicketController::class, 'show']);
        Route::post('/support-tickets/{id}/reply', [SupportTicketController::class, 'reply']);

        // ── Admin Routes ──────────────────────────────────────
        Route::prefix('admin')->group(function () {
            Route::get('/stats',                           [AdminController::class, 'stats']);
            Route::get('/courses',                         [AdminController::class, 'courses']);
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
            Route::get('/enrollments',                     [AdminController::class, 'enrollments']);
            Route::get('/enrollments/resources',           [AdminController::class, 'enrollmentResources']);
            Route::post('/enrollments',                    [AdminController::class, 'storeEnrollment']);
            Route::get('/payments',                        [AdminController::class, 'payments']);
            Route::get('/tickets',                         [AdminController::class, 'tickets']);
            Route::put('/tickets/{id}/status',             [AdminController::class, 'updateTicketStatus']);
            Route::post('/tickets/{id}/reply',             [AdminController::class, 'replyTicket']);

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

// Fallback Route for React SPA
Route::get('/{any}', function () {
    return view('app');
})->where('any', '^(?!api).*$');
