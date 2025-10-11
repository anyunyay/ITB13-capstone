<?php

namespace App\Http\Middleware;

use App\Models\SystemSchedule;
use App\Models\SystemTracking;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class CheckSystemLockout
{
    /**
     * Handle an incoming request.
     * Check if customers are locked out due to daily system lockout.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Skip lockout check for admin/staff routes
        if ($request->is('admin/*') || $request->is('admin')) {
            return $next($request);
        }

        // Skip lockout check for logout routes
        if ($request->routeIs('logout')) {
            return $next($request);
        }

        // Skip lockout check for system lockout management routes
        if ($request->routeIs('admin.system-lockout.*')) {
            return $next($request);
        }

        // Check for scheduled lockouts that should be executed now
        $this->executeScheduledLockouts();

        // Check if system is locked out (either from daily schedule or scheduled tracking)
        $isLockedOut = SystemSchedule::isCustomerLockoutActive() || $this->isSystemLockedFromTracking();
        
        if ($isLockedOut) {
            // If user is authenticated and is a customer, log them out
            if (Auth::check() && Auth::user()->type === 'customer') {
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();
            }

            // Get lockout information
            $lockoutInfo = $this->getLockoutInfo();

            // Return lockout page for customers
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'message' => 'System is currently locked out. Please try again later.',
                    'lockout_status' => 'active',
                    'lockout_type' => $lockoutInfo['type'],
                    'lockout_details' => $lockoutInfo,
                ], 423); // 423 Locked
            }

            return Inertia::render('system-lockout', [
                'lockoutInfo' => $lockoutInfo
            ])->toResponse($request);
        }

        return $next($request);
    }

    /**
     * Execute scheduled lockouts that are due
     */
    private function executeScheduledLockouts(): void
    {
        $scheduledLockouts = SystemTracking::getActiveScheduledLockouts();
        
        foreach ($scheduledLockouts as $lockout) {
            if ($lockout->shouldExecuteNow()) {
                $this->executeLockout($lockout);
            }
        }
    }

    /**
     * Execute a scheduled lockout
     */
    private function executeLockout(SystemTracking $lockout): void
    {
        DB::transaction(function () use ($lockout) {
            // Mark the tracking record as executed
            $lockout->execute();
            
            // Create or update today's system schedule record
            $schedule = SystemSchedule::getOrCreateTodayRecord();
            $schedule->initiateLockout();
            
            // Log out all customer sessions
            $this->logoutAllCustomers();
            
            // Log the action
            \Log::info('Scheduled system lockout executed', [
                'tracking_id' => $lockout->id,
                'scheduled_at' => $lockout->scheduled_at,
                'executed_at' => $lockout->executed_at,
                'description' => $lockout->description,
            ]);
        });
    }

    /**
     * Log out all customer sessions
     */
    private function logoutAllCustomers(): void
    {
        $customers = \App\Models\User::where('type', 'customer')->get();
        
        foreach ($customers as $customer) {
            $customer->clearCurrentSession();
            
            DB::table('sessions')
                ->where('user_id', $customer->id)
                ->delete();
        }
    }

    /**
     * Check if system is locked from tracking
     */
    private function isSystemLockedFromTracking(): bool
    {
        return SystemTracking::where('action', 'system_down')
            ->whereIn('status', ['active', 'scheduled'])
            ->where('scheduled_at', '<=', now())
            ->exists();
    }

    /**
     * Get lockout information
     */
    private function getLockoutInfo(): array
    {
        // Check if it's a scheduled lockout
        $scheduledLockout = SystemTracking::where('action', 'system_down')
            ->whereIn('status', ['active', 'scheduled'])
            ->where('scheduled_at', '<=', now())
            ->orderBy('scheduled_at', 'desc')
            ->first();

        if ($scheduledLockout) {
            return [
                'type' => 'scheduled',
                'date' => $scheduledLockout->scheduled_at->format('Y-m-d'),
                'lockout_time' => $scheduledLockout->executed_at?->format('Y-m-d H:i:s') ?? $scheduledLockout->scheduled_at->format('Y-m-d H:i:s'),
                'description' => $scheduledLockout->description,
                'message' => $scheduledLockout->description ?? 'System is temporarily unavailable due to scheduled maintenance. Please check back later.',
                'status' => $scheduledLockout->status,
            ];
        }

        // Fall back to daily schedule lockout
        $schedule = SystemSchedule::getTodayRecord();
        if ($schedule && !$schedule->isSystemReadyForCustomers()) {
            return [
                'type' => 'daily',
                'date' => $schedule->system_date->format('Y-m-d'),
                'lockout_time' => $schedule->lockout_time?->format('Y-m-d H:i:s'),
                'admin_action' => $schedule->admin_action,
                'price_change_status' => $schedule->price_change_status,
                'message' => $this->getLockoutMessage($schedule),
            ];
        }

        // Default message
        return [
            'type' => 'unknown',
            'message' => 'System is temporarily unavailable. Please check back later.',
        ];
    }

    /**
     * Get appropriate lockout message based on current status
     */
    private function getLockoutMessage(SystemSchedule $schedule): string
    {
        if ($schedule->isAdminActionPending()) {
            return 'System is temporarily unavailable while administrators review daily pricing updates. Please check back later.';
        }

        if ($schedule->isPriceChangeActionPending()) {
            return 'System is temporarily unavailable while administrators finalize pricing changes. Please check back later.';
        }

        return 'System is temporarily unavailable. Please check back later.';
    }
}
