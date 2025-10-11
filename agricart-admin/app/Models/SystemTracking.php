<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class SystemTracking extends Model
{
    protected $table = 'system_tracking';
    
    protected $fillable = [
        'status',
        'action',
        'scheduled_at',
        'executed_at',
        'description',
        'metadata',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'executed_at' => 'datetime',
        'metadata' => 'array',
    ];

    /**
     * Schedule a system lockout for a specific time
     */
    public static function scheduleLockout(Carbon $scheduledAt, string $description = null, array $metadata = []): self
    {
        return self::create([
            'status' => 'scheduled',
            'action' => 'system_down',
            'scheduled_at' => $scheduledAt,
            'description' => $description ?? 'Scheduled system lockout',
            'metadata' => $metadata,
        ]);
    }

    /**
     * Schedule a system lockout for 1 minute from now
     */
    public static function scheduleLockoutInOneMinute(string $description = null, array $metadata = []): self
    {
        return self::scheduleLockout(
            Carbon::now()->addMinute(),
            $description ?? 'System lockout scheduled for 1 minute from now',
            $metadata
        );
    }

    /**
     * Get all active scheduled lockouts
     */
    public static function getActiveScheduledLockouts(): \Illuminate\Database\Eloquent\Collection
    {
        return self::where('status', 'scheduled')
            ->where('action', 'system_down')
            ->where('scheduled_at', '<=', Carbon::now())
            ->get();
    }

    /**
     * Check if there's an active scheduled lockout that should be executed
     */
    public static function hasActiveScheduledLockout(): bool
    {
        return self::where('status', 'scheduled')
            ->where('action', 'system_down')
            ->where('scheduled_at', '<=', Carbon::now())
            ->exists();
    }

    /**
     * Get the next scheduled lockout
     */
    public static function getNextScheduledLockout(): ?self
    {
        return self::where('status', 'scheduled')
            ->where('action', 'system_down')
            ->where('scheduled_at', '>', Carbon::now())
            ->orderBy('scheduled_at')
            ->first();
    }

    /**
     * Execute a scheduled lockout
     */
    public function execute(): bool
    {
        if ($this->status !== 'scheduled') {
            return false;
        }

        $this->update([
            'status' => 'active',
            'executed_at' => Carbon::now(),
        ]);

        return true;
    }

    /**
     * Complete a lockout
     */
    public function complete(): bool
    {
        if (!in_array($this->status, ['active', 'scheduled'])) {
            return false;
        }

        $this->update([
            'status' => 'completed',
        ]);

        return true;
    }

    /**
     * Cancel a scheduled lockout
     */
    public function cancel(): bool
    {
        if ($this->status !== 'scheduled') {
            return false;
        }

        $this->update([
            'status' => 'cancelled',
        ]);

        return true;
    }

    /**
     * Check if this lockout should be executed now
     */
    public function shouldExecuteNow(): bool
    {
        return $this->status === 'scheduled' 
            && $this->action === 'system_down'
            && $this->scheduled_at <= Carbon::now();
    }

    /**
     * Get all scheduled lockouts (including future ones)
     */
    public static function getAllScheduledLockouts(): \Illuminate\Database\Eloquent\Collection
    {
        return self::where('action', 'system_down')
            ->whereIn('status', ['scheduled', 'active'])
            ->orderBy('scheduled_at')
            ->get();
    }

    /**
     * Get lockout history
     */
    public static function getLockoutHistory(int $limit = 10): \Illuminate\Database\Eloquent\Collection
    {
        return self::where('action', 'system_down')
            ->whereIn('status', ['completed', 'cancelled'])
            ->orderBy('scheduled_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Check if admin action is required for this lockout
     */
    public function requiresAdminAction(): bool
    {
        if ($this->action !== 'system_down') {
            return false;
        }

        // Check if this lockout is active and system schedule requires admin action
        if (in_array($this->status, ['active', 'scheduled']) && $this->scheduled_at <= Carbon::now()) {
            $schedule = SystemSchedule::getTodayRecord();
            return $schedule && $schedule->is_locked && $schedule->isAdminActionPending();
        }

        return false;
    }

    /**
     * Get lockout information for admin modal
     */
    public function getAdminModalInfo(): array
    {
        return [
            'id' => $this->id,
            'type' => 'scheduled',
            'scheduled_at' => $this->scheduled_at->format('Y-m-d H:i:s'),
            'executed_at' => $this->executed_at?->format('Y-m-d H:i:s'),
            'description' => $this->description,
            'status' => $this->status,
            'admin_action_required' => $this->requiresAdminAction(),
        ];
    }

    /**
     * Mark admin action as completed
     */
    public function markAdminActionCompleted(string $action, int $adminUserId): bool
    {
        if (!$this->requiresAdminAction()) {
            return false;
        }

        $metadata = $this->metadata ?? [];
        $metadata['admin_action'] = $action;
        $metadata['admin_action_completed_at'] = Carbon::now()->toISOString();
        $metadata['admin_user_id'] = $adminUserId;

        $this->update([
            'metadata' => $metadata,
        ]);

        return true;
    }

    /**
     * Get all lockouts requiring admin action
     */
    public static function getLockoutsRequiringAdminAction(): \Illuminate\Database\Eloquent\Collection
    {
        return self::where('action', 'system_down')
            ->whereIn('status', ['active', 'scheduled'])
            ->where('scheduled_at', '<=', Carbon::now())
            ->get()
            ->filter(function ($lockout) {
                return $lockout->requiresAdminAction();
            });
    }

    /**
     * Check if any lockout requires admin action
     */
    public static function hasLockoutRequiringAdminAction(): bool
    {
        return self::getLockoutsRequiringAdminAction()->isNotEmpty();
    }
}
