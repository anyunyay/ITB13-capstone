<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemSchedule;
use App\Models\SystemTracking;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class MandatoryActionController extends Controller
{
    /**
     * Display the mandatory action page
     */
    public function index(Request $request): Response
    {
        $lockoutInfo = $this->getMandatoryActionInfo();
        
        if (!$lockoutInfo) {
            // No mandatory action required, redirect to dashboard
            return redirect()->route('admin.dashboard');
        }

        return Inertia::render('Admin/mandatory-action', [
            'lockoutInfo' => $lockoutInfo,
            'redirectUrl' => $request->get('redirect_url', route('admin.dashboard')),
        ]);
    }

    /**
     * Get current mandatory action status
     */
    public function status(): JsonResponse
    {
        $lockoutInfo = $this->getMandatoryActionInfo();
        
        return response()->json([
            'mandatory_action_required' => $lockoutInfo !== null,
            'lockout_info' => $lockoutInfo,
        ]);
    }

    /**
     * Admin chooses to stay as is (keep current prices)
     */
    public function stayAsIs(Request $request): JsonResponse
    {
        $request->validate([
            'confirm' => 'required|boolean|accepted',
        ]);

        try {
            $schedule = SystemSchedule::getTodayRecord();
            
            if (!$schedule || !$schedule->is_locked || !$schedule->isAdminActionPending()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No pending admin action found.',
                ], 400);
            }

            // Keep prices as is
            $schedule->keepPricesAsIs(Auth::id());
            
            // Mark tracking record if it exists
            $trackingRecord = SystemTracking::where('action', 'system_down')
                ->whereIn('status', ['active', 'scheduled'])
                ->where('scheduled_at', '<=', now())
                ->first();
            
            if ($trackingRecord) {
                $trackingRecord->markAdminActionCompleted('stay_as_is', Auth::id());
            }
            
            Log::info('Admin chose to stay as is (mandatory action)', [
                'admin_id' => Auth::id(),
                'admin_name' => Auth::user()->name,
                'schedule_id' => $schedule->id,
                'tracking_id' => $trackingRecord?->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Prices kept as is. Customer access has been restored.',
                'redirect_url' => $request->get('redirect_url', route('admin.dashboard')),
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to process stay as is action', [
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
     * Admin chooses to apply price changes
     */
    public function priceChange(Request $request): JsonResponse
    {
        $request->validate([
            'confirm' => 'required|boolean|accepted',
        ]);

        try {
            $schedule = SystemSchedule::getTodayRecord();
            
            if (!$schedule || !$schedule->is_locked || !$schedule->isAdminActionPending()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No pending admin action found.',
                ], 400);
            }

            // Apply price changes
            $schedule->applyPriceChanges(Auth::id());
            
            // Mark tracking record if it exists
            $trackingRecord = SystemTracking::where('action', 'system_down')
                ->whereIn('status', ['active', 'scheduled'])
                ->where('scheduled_at', '<=', now())
                ->first();
            
            if ($trackingRecord) {
                $trackingRecord->markAdminActionCompleted('price_change', Auth::id());
            }
            
            Log::info('Admin chose to apply price changes (mandatory action)', [
                'admin_id' => Auth::id(),
                'admin_name' => Auth::user()->name,
                'schedule_id' => $schedule->id,
                'tracking_id' => $trackingRecord?->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Price changes approved. Please confirm to proceed.',
                'requires_confirmation' => true,
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to process price change action', [
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
    public function cancelPriceChange(Request $request): JsonResponse
    {
        $request->validate([
            'confirm' => 'required|boolean|accepted',
        ]);

        try {
            $schedule = SystemSchedule::getTodayRecord();
            
            if (!$schedule || !$schedule->isPriceChangeActionPending()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No pending price change action found.',
                ], 400);
            }

            // Cancel price changes
            $schedule->cancelPriceChanges(Auth::id());
            
            Log::info('Admin cancelled price changes (mandatory action)', [
                'admin_id' => Auth::id(),
                'admin_name' => Auth::user()->name,
                'schedule_id' => $schedule->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Price changes cancelled. Customer access has been restored.',
                'redirect_url' => $request->get('redirect_url', route('admin.dashboard')),
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
    public function approvePriceChange(Request $request): JsonResponse
    {
        $request->validate([
            'confirm' => 'required|boolean|accepted',
        ]);

        try {
            $schedule = SystemSchedule::getTodayRecord();
            
            if (!$schedule || !$schedule->isPriceChangeActionPending()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No pending price change action found.',
                ], 400);
            }

            // Approve price changes
            $schedule->approvePriceChanges(Auth::id());
            
            Log::info('Admin approved price changes (mandatory action)', [
                'admin_id' => Auth::id(),
                'admin_name' => Auth::user()->name,
                'schedule_id' => $schedule->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Price changes approved and applied. Customer access has been restored.',
                'redirect_url' => $request->get('redirect_url', route('admin.dashboard')),
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
     * Get mandatory action information
     */
    private function getMandatoryActionInfo(): ?array
    {
        // Check for scheduled lockout that requires admin action
        $scheduledLockout = SystemTracking::where('action', 'system_down')
            ->whereIn('status', ['active', 'scheduled'])
            ->where('scheduled_at', '<=', now())
            ->orderBy('scheduled_at', 'desc')
            ->first();

        if ($scheduledLockout && $scheduledLockout->requiresAdminAction()) {
            return $scheduledLockout->getAdminModalInfo();
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
