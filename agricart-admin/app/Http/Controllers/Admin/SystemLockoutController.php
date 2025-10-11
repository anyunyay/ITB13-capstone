<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemSchedule;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class SystemLockoutController extends Controller
{
    /**
     * Display the system lockout management page
     */
    public function index(): Response
    {
        $schedule = SystemSchedule::getOrCreateTodayRecord();
        
        return Inertia::render('admin/system-lockout/index', [
            'schedule' => [
                'id' => $schedule->id,
                'system_date' => $schedule->system_date->format('Y-m-d'),
                'is_locked' => $schedule->is_locked,
                'admin_action' => $schedule->admin_action,
                'price_change_status' => $schedule->price_change_status,
                'lockout_time' => $schedule->lockout_time?->format('Y-m-d H:i:s'),
                'admin_action_time' => $schedule->admin_action_time?->format('Y-m-d H:i:s'),
                'price_change_action_time' => $schedule->price_change_action_time?->format('Y-m-d H:i:s'),
                'admin_user' => $schedule->adminUser ? [
                    'id' => $schedule->adminUser->id,
                    'name' => $schedule->adminUser->name,
                    'email' => $schedule->adminUser->email,
                ] : null,
            ],
            'canTakeAction' => $this->canTakeAction($schedule),
            'nextAction' => $this->getNextAction($schedule),
        ]);
    }

    /**
     * Get current system lockout status for API
     */
    public function status(): JsonResponse
    {
        $schedule = SystemSchedule::getOrCreateTodayRecord();
        
        return response()->json([
            'schedule' => [
                'id' => $schedule->id,
                'system_date' => $schedule->system_date->format('Y-m-d'),
                'is_locked' => $schedule->is_locked,
                'admin_action' => $schedule->admin_action,
                'price_change_status' => $schedule->price_change_status,
                'lockout_time' => $schedule->lockout_time?->format('Y-m-d H:i:s'),
                'admin_action_time' => $schedule->admin_action_time?->format('Y-m-d H:i:s'),
                'price_change_action_time' => $schedule->price_change_action_time?->format('Y-m-d H:i:s'),
                'admin_user' => $schedule->adminUser ? [
                    'id' => $schedule->adminUser->id,
                    'name' => $schedule->adminUser->name,
                    'email' => $schedule->adminUser->email,
                ] : null,
            ],
            'canTakeAction' => $this->canTakeAction($schedule),
            'nextAction' => $this->getNextAction($schedule),
        ]);
    }

    /**
     * Admin decides to keep prices as is
     */
    public function keepPrices(Request $request): JsonResponse
    {
        $request->validate([
            'confirm' => 'required|boolean|accepted',
        ]);

        $schedule = SystemSchedule::getTodayRecord();
        
        if (!$schedule || !$this->canTakeAction($schedule)) {
            return response()->json([
                'success' => false,
                'message' => 'Action not available at this time.',
            ], 400);
        }

        try {
            $schedule->keepPricesAsIs(Auth::id());
            
            Log::info('Admin kept prices as is', [
                'admin_id' => Auth::id(),
                'admin_name' => Auth::user()->name,
                'date' => $schedule->system_date->format('Y-m-d'),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Prices kept as is. Customer access has been restored.',
                'schedule' => $this->formatScheduleResponse($schedule->fresh()),
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to keep prices as is', [
                'admin_id' => Auth::id(),
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to process request. Please try again.',
            ], 500);
        }
    }

    /**
     * Admin decides to apply price changes
     */
    public function applyPriceChanges(Request $request): JsonResponse
    {
        $request->validate([
            'confirm' => 'required|boolean|accepted',
        ]);

        $schedule = SystemSchedule::getTodayRecord();
        
        if (!$schedule || !$this->canTakeAction($schedule)) {
            return response()->json([
                'success' => false,
                'message' => 'Action not available at this time.',
            ], 400);
        }

        try {
            $schedule->applyPriceChanges(Auth::id());
            
            Log::info('Admin decided to apply price changes', [
                'admin_id' => Auth::id(),
                'admin_name' => Auth::user()->name,
                'date' => $schedule->system_date->format('Y-m-d'),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Price changes will be applied. Please click "Cancel" or "Good to go" to proceed.',
                'schedule' => $this->formatScheduleResponse($schedule->fresh()),
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to apply price changes', [
                'admin_id' => Auth::id(),
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to process request. Please try again.',
            ], 500);
        }
    }

    /**
     * Admin cancels price changes
     */
    public function cancelPriceChanges(Request $request): JsonResponse
    {
        $request->validate([
            'confirm' => 'required|boolean|accepted',
        ]);

        $schedule = SystemSchedule::getTodayRecord();
        
        if (!$schedule || !$schedule->isPriceChangeActionPending()) {
            return response()->json([
                'success' => false,
                'message' => 'Action not available at this time.',
            ], 400);
        }

        try {
            $schedule->cancelPriceChanges(Auth::id());
            
            Log::info('Admin cancelled price changes', [
                'admin_id' => Auth::id(),
                'admin_name' => Auth::user()->name,
                'date' => $schedule->system_date->format('Y-m-d'),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Price changes cancelled. Customer access has been restored.',
                'schedule' => $this->formatScheduleResponse($schedule->fresh()),
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to cancel price changes', [
                'admin_id' => Auth::id(),
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to process request. Please try again.',
            ], 500);
        }
    }

    /**
     * Admin approves price changes
     */
    public function approvePriceChanges(Request $request): JsonResponse
    {
        $request->validate([
            'confirm' => 'required|boolean|accepted',
        ]);

        $schedule = SystemSchedule::getTodayRecord();
        
        if (!$schedule || !$schedule->isPriceChangeActionPending()) {
            return response()->json([
                'success' => false,
                'message' => 'Action not available at this time.',
            ], 400);
        }

        try {
            $schedule->approvePriceChanges(Auth::id());
            
            Log::info('Admin approved price changes', [
                'admin_id' => Auth::id(),
                'admin_name' => Auth::user()->name,
                'date' => $schedule->system_date->format('Y-m-d'),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Price changes approved. Customer access has been restored.',
                'schedule' => $this->formatScheduleResponse($schedule->fresh()),
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to approve price changes', [
                'admin_id' => Auth::id(),
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to process request. Please try again.',
            ], 500);
        }
    }

    /**
     * Check if admin can take action
     */
    private function canTakeAction(SystemSchedule $schedule): bool
    {
        return $schedule->is_locked && $schedule->isAdminActionPending();
    }

    /**
     * Get the next action that can be taken
     */
    private function getNextAction(SystemSchedule $schedule): ?string
    {
        if ($schedule->isAdminActionPending()) {
            return 'admin_decision';
        }

        if ($schedule->isPriceChangeActionPending()) {
            return 'price_change_action';
        }

        return null;
    }

    /**
     * Format schedule response
     */
    private function formatScheduleResponse(SystemSchedule $schedule): array
    {
        return [
            'id' => $schedule->id,
            'system_date' => $schedule->system_date->format('Y-m-d'),
            'is_locked' => $schedule->is_locked,
            'admin_action' => $schedule->admin_action,
            'price_change_status' => $schedule->price_change_status,
            'lockout_time' => $schedule->lockout_time?->format('Y-m-d H:i:s'),
            'admin_action_time' => $schedule->admin_action_time?->format('Y-m-d H:i:s'),
            'price_change_action_time' => $schedule->price_change_action_time?->format('Y-m-d H:i:s'),
            'admin_user' => $schedule->adminUser ? [
                'id' => $schedule->adminUser->id,
                'name' => $schedule->adminUser->name,
                'email' => $schedule->adminUser->email,
            ] : null,
        ];
    }
}
