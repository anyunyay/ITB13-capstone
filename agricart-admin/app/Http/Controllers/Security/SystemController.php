<?php

namespace App\Http\Controllers\Security;

use App\Models\SystemStatus;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class SystemController extends \App\Http\Controllers\Controller
{
    /**
     * Schedule a system lock with 1-minute countdown.
     */
    public function scheduleLock(Request $request): JsonResponse
    {
        $systemStatus = SystemStatus::getCustomerAccessStatus();
        
        if (!$systemStatus) {
            return response()->json(['error' => 'System status not found'], 404);
        }

        // Check if already locked or pending lock
        if ($systemStatus->isLocked() || $systemStatus->isPendingLock()) {
            return response()->json(['error' => 'System is already locked or pending lock'], 400);
        }

        $lockTime = now()->addMinutes(1);
        
        $systemStatus->update([
            'status_value' => 'pending_lock',
            'lock_time' => $lockTime,
            'updated_by' => Auth::id(),
        ]);

        return response()->json([
            'message' => 'System lock scheduled successfully. System will lock in 1 minute.',
            'lock_time' => $lockTime->toISOString(),
        ]);
    }

    /**
     * Get current system status.
     */
    public function getSystemStatus(): JsonResponse
    {
        $systemStatus = SystemStatus::getCustomerAccessStatus();
        
        if (!$systemStatus) {
            return response()->json(['error' => 'System status not found'], 404);
        }

        // Auto-lock if pending lock time has passed
        if ($systemStatus->isPendingLock() && $systemStatus->lock_time && $systemStatus->lock_time <= now()) {
            $systemStatus->update([
                'status_value' => 'locked',
                'lock_time' => null,
            ]);
        }

        $remainingSeconds = $systemStatus->getRemainingSeconds();

        return response()->json([
            'status_key' => $systemStatus->status_key,
            'status_value' => $systemStatus->status_value,
            'lock_time' => $systemStatus->lock_time?->toISOString(),
            'remaining_seconds' => $remainingSeconds,
            'updated_by' => $systemStatus->updated_by,
            'updated_at' => $systemStatus->updated_at->toISOString(),
        ]);
    }

    /**
     * Unlock the system.
     */
    public function unlockSystem(Request $request): JsonResponse
    {
        $systemStatus = SystemStatus::getCustomerAccessStatus();
        
        if (!$systemStatus) {
            return response()->json(['error' => 'System status not found'], 404);
        }

        $systemStatus->update([
            'status_value' => 'open',
            'lock_time' => null,
            'updated_by' => Auth::id(),
        ]);

        return response()->json([
            'message' => 'System unlocked successfully.',
        ]);
    }
}
