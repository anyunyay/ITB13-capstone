<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\LoginLockoutService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class LockoutStatusController extends Controller
{
    /**
     * Check lockout status for customer login
     */
    public function checkCustomerLockout(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $status = LoginLockoutService::getLockoutStatus(
            $request->email,
            'customer',
            $request->ip()
        );

        return response()->json([
            'locked' => $status['is_locked'],
            'failed_attempts' => $status['failed_attempts'],
            'lock_level' => $status['lock_level'],
            'remaining_time' => $status['remaining_time'],
            'lock_expires_at' => $status['lock_expires_at'],
            'server_time' => $status['server_time'],
            'formatted_time' => $status['remaining_time'] > 0 
                ? LoginLockoutService::formatRemainingTime($status['remaining_time'])
                : null,
        ]);
    }

    /**
     * Check lockout status for admin login
     */
    public function checkAdminLockout(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $status = LoginLockoutService::getLockoutStatus(
            $request->email,
            'admin',
            $request->ip()
        );

        return response()->json([
            'locked' => $status['is_locked'],
            'failed_attempts' => $status['failed_attempts'],
            'lock_level' => $status['lock_level'],
            'remaining_time' => $status['remaining_time'],
            'lock_expires_at' => $status['lock_expires_at'],
            'server_time' => $status['server_time'],
            'formatted_time' => $status['remaining_time'] > 0 
                ? LoginLockoutService::formatRemainingTime($status['remaining_time'])
                : null,
        ]);
    }

    /**
     * Check lockout status for member login
     */
    public function checkMemberLockout(Request $request): JsonResponse
    {
        $request->validate([
            'member_id' => 'required|string',
        ]);

        $status = LoginLockoutService::getLockoutStatus(
            $request->member_id,
            'member',
            $request->ip()
        );

        return response()->json([
            'locked' => $status['is_locked'],
            'failed_attempts' => $status['failed_attempts'],
            'lock_level' => $status['lock_level'],
            'remaining_time' => $status['remaining_time'],
            'lock_expires_at' => $status['lock_expires_at'],
            'server_time' => $status['server_time'],
            'formatted_time' => $status['remaining_time'] > 0 
                ? LoginLockoutService::formatRemainingTime($status['remaining_time'])
                : null,
        ]);
    }

    /**
     * Check lockout status for logistic login
     */
    public function checkLogisticLockout(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $status = LoginLockoutService::getLockoutStatus(
            $request->email,
            'logistic',
            $request->ip()
        );

        return response()->json([
            'locked' => $status['is_locked'],
            'failed_attempts' => $status['failed_attempts'],
            'lock_level' => $status['lock_level'],
            'remaining_time' => $status['remaining_time'],
            'lock_expires_at' => $status['lock_expires_at'],
            'server_time' => $status['server_time'],
            'formatted_time' => $status['remaining_time'] > 0 
                ? LoginLockoutService::formatRemainingTime($status['remaining_time'])
                : null,
        ]);
    }
}