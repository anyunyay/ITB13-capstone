<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SystemStatus extends Model
{
    protected $fillable = [
        'status_key',
        'status_value',
        'lock_time',
        'updated_by',
    ];

    protected $casts = [
        'lock_time' => 'datetime',
    ];

    /**
     * Get the user who last updated this status.
     */
    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Get the customer access status.
     */
    public static function getCustomerAccessStatus(): ?self
    {
        return self::where('status_key', 'customer_access')->first();
    }

    /**
     * Check if the system is locked.
     */
    public function isLocked(): bool
    {
        return $this->status_value === 'locked';
    }

    /**
     * Check if the system is pending lock.
     */
    public function isPendingLock(): bool
    {
        return $this->status_value === 'pending_lock';
    }

    /**
     * Check if the system is open.
     */
    public function isOpen(): bool
    {
        return $this->status_value === 'open';
    }

    /**
     * Get remaining seconds until lock.
     */
    public function getRemainingSeconds(): int
    {
        if (!$this->lock_time || $this->status_value !== 'pending_lock') {
            return 0;
        }

        return max(0, now()->diffInSeconds($this->lock_time, false));
    }
}
