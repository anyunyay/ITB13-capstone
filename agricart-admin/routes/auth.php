<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\ConfirmablePasswordController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\EmailVerificationPromptController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\VerifyEmailController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {

    Route::get('register', [RegisteredUserController::class, 'create'])
        ->name('register');

    Route::post('register', [RegisteredUserController::class, 'store']);

    Route::post('register/check-duplicate-email', [RegisteredUserController::class, 'checkDuplicateEmail'])
        ->name('register.checkDuplicateEmail');

    // Customer login (default)
    Route::get('login', [AuthenticatedSessionController::class, 'create'])
        ->name('login');

    Route::post('login', [AuthenticatedSessionController::class, 'store']);

    // Admin/Staff login
    Route::get('admin/login', [AuthenticatedSessionController::class, 'createAdmin'])
        ->name('admin.login');

    Route::post('admin/login', [AuthenticatedSessionController::class, 'storeAdmin'])
        ->name('admin.login.store');

    // Member login
    Route::get('member/login', [AuthenticatedSessionController::class, 'createMember'])
        ->name('member.login');

    Route::post('member/login', [AuthenticatedSessionController::class, 'storeMember'])
        ->name('member.login.store');

    // Logistic login
    Route::get('logistic/login', [AuthenticatedSessionController::class, 'createLogistic'])
        ->name('logistic.login');

    Route::post('logistic/login', [AuthenticatedSessionController::class, 'storeLogistic'])
        ->name('logistic.login.store');

    Route::get('forgot-password', [PasswordResetLinkController::class, 'create'])
        ->name('password.request');

    Route::post('forgot-password', [PasswordResetLinkController::class, 'store'])
        ->name('password.email');

    Route::get('reset-password/{token}', [NewPasswordController::class, 'create'])
        ->name('password.reset');

    Route::post('reset-password', [NewPasswordController::class, 'store'])
        ->name('password.store');

    // Member password change routes
    Route::get('member/forgot-password', [\App\Http\Controllers\Member\PasswordChangeController::class, 'showForgotPassword'])
        ->name('member.password.request');

    Route::post('member/forgot-password', [\App\Http\Controllers\Member\PasswordChangeController::class, 'requestPasswordChange'])
        ->name('member.password.request.store');

    Route::get('member/password-request/{requestId}/pending', [\App\Http\Controllers\Member\PasswordChangeController::class, 'showRequestPending'])
        ->name('member.password.pending');

    Route::post('member/password-request/{requestId}/cancel', [\App\Http\Controllers\Member\PasswordChangeController::class, 'cancelRequest'])
        ->name('member.password.cancel');

    Route::get('member/password-request/{requestId}/status', [\App\Http\Controllers\Member\PasswordChangeController::class, 'checkRequestStatus'])
        ->name('member.password.status');

    Route::get('member/reset-password/{requestId}', [\App\Http\Controllers\Member\PasswordChangeController::class, 'showChangeForm'])
        ->name('member.password.change');

    Route::post('member/reset-password/{requestId}', [\App\Http\Controllers\Member\PasswordChangeController::class, 'changePassword'])
        ->name('member.password.change.store');
});

Route::middleware('auth')->group(function () {
    Route::get('verify-email', EmailVerificationPromptController::class)
        ->name('verification.notice');

    Route::get('verify-email/{id}/{hash}', VerifyEmailController::class)
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify');

    Route::post('email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
        ->middleware('throttle:6,1')
        ->name('verification.send');

    Route::get('confirm-password', [ConfirmablePasswordController::class, 'show'])
        ->name('password.confirm');

    Route::post('confirm-password', [ConfirmablePasswordController::class, 'store']);

    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('logout');
});
