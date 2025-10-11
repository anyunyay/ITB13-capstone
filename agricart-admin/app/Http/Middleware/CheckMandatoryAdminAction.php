<?php

namespace App\Http\Middleware;

use App\Models\SystemSchedule;
use App\Models\SystemTracking;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class CheckMandatoryAdminAction
{
    /**
     * Handle an incoming request.
     * Check if admin action is required and block other actions until completed.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Only apply to admin/staff users
        if (!Auth::check() || !in_array(Auth::user()->type, ['admin', 'staff'])) {
            return $next($request);
        }

        // Skip for logout routes
        if ($request->routeIs('logout')) {
            return $next($request);
        }

        // Skip for admin lockout management routes
        if ($request->routeIs('admin.system-lockout.*') || $request->routeIs('admin.mandatory-action.*')) {
            return $next($request);
        }

        // Check if mandatory admin action is required
        $mandatoryAction = $this->getMandatoryAdminAction();
        
        if ($mandatoryAction) {
            // If this is an API request, return JSON response
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'mandatory_action_required' => true,
                    'lockout_info' => $mandatoryAction,
                    'message' => 'Admin action is required before proceeding.',
                ], 423); // 423 Locked
            }

            // For web requests, redirect to mandatory action page
            return Inertia::render('Admin/mandatory-action', [
                'lockoutInfo' => $mandatoryAction,
                'redirectUrl' => $request->fullUrl(),
            ])->toResponse($request);
        }

        return $next($request);
    }

    /**
     * Get mandatory admin action information
     */
    private function getMandatoryAdminAction(): ?array
    {
        // Check for scheduled lockout that requires admin action
        $scheduledLockout = SystemTracking::where('action', 'system_down')
            ->whereIn('status', ['active', 'scheduled'])
            ->where('scheduled_at', '<=', now())
            ->orderBy('scheduled_at', 'desc')
            ->first();

        if ($scheduledLockout) {
            // Check if admin action is still required
            $schedule = SystemSchedule::getTodayRecord();
            if ($schedule && $schedule->is_locked && $schedule->isAdminActionPending()) {
                return [
                    'id' => $scheduledLockout->id,
                    'type' => 'scheduled',
                    'scheduled_at' => $scheduledLockout->scheduled_at->format('Y-m-d H:i:s'),
                    'executed_at' => $scheduledLockout->executed_at?->format('Y-m-d H:i:s'),
                    'description' => $scheduledLockout->description,
                    'status' => $scheduledLockout->status,
                    'admin_action_required' => true,
                ];
            }
        }

        // Check for daily schedule lockout that requires admin action
        $schedule = SystemSchedule::getTodayRecord();
        if ($schedule && $schedule->is_locked && $schedule->isAdminActionPending()) {
            return [
                'id' => $schedule->id,
                'type' => 'daily',
                'lockout_time' => $schedule->lockout_time?->format('Y-m-d H:i:s'),
                'admin_action' => $schedule->admin_action,
                'price_change_status' => $schedule->price_change_status,
                'status' => $schedule->admin_action,
                'admin_action_required' => true,
            ];
        }

        // Check for price change action pending
        if ($schedule && $schedule->isPriceChangeActionPending()) {
            return [
                'id' => $schedule->id,
                'type' => 'daily',
                'lockout_time' => $schedule->lockout_time?->format('Y-m-d H:i:s'),
                'admin_action' => $schedule->admin_action,
                'price_change_status' => $schedule->price_change_status,
                'status' => $schedule->price_change_status,
                'admin_action_required' => true,
                'price_change_confirmation_required' => true,
            ];
        }

        return null;
    }
}
