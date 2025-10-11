<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class SystemSchedule extends Model
{
    protected $table = 'system_schedule';
    
    protected $fillable = [
        'system_date',
        'is_locked',
        'admin_action',
        'price_change_status',
        'lockout_time',
        'admin_action_time',
        'price_change_action_time',
        'admin_user_id',
    ];

    protected $casts = [
        'system_date' => 'date',
        'is_locked' => 'boolean',
        'lockout_time' => 'datetime',
        'admin_action_time' => 'datetime',
        'price_change_action_time' => 'datetime',
    ];

    /**
     * Get the admin user who made the decision
     */
    public function adminUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_user_id');
    }

    /**
     * Get today's system schedule record
     */
    public static function getTodayRecord(): ?self
    {
        return self::where('system_date', Carbon::today())->first();
    }

    /**
     * Create or get today's system schedule record
     */
    public static function getOrCreateTodayRecord(): self
    {
        $record = self::getTodayRecord();
        
        if (!$record) {
            $record = self::create([
                'system_date' => Carbon::today(),
                'is_locked' => false,
                'admin_action' => 'pending',
                'price_change_status' => null,
            ]);
        }
        
        return $record;
    }

    /**
     * Check if customers are currently locked out
     */
    public static function isCustomerLockoutActive(): bool
    {
        $record = self::getTodayRecord();
        return $record ? $record->is_locked : false;
    }

    /**
     * Initiate daily lockout
     */
    public function initiateLockout(): void
    {
        $this->update([
            'is_locked' => true,
            'lockout_time' => now(),
            'admin_action' => 'pending',
            'price_change_status' => null,
        ]);
    }

    /**
     * Admin decides to keep prices as is
     */
    public function keepPricesAsIs(int $adminUserId): void
    {
        $this->update([
            'is_locked' => false,
            'admin_action' => 'keep_prices',
            'admin_action_time' => now(),
            'admin_user_id' => $adminUserId,
        ]);
    }

    /**
     * Admin decides to apply price changes
     */
    public function applyPriceChanges(int $adminUserId): void
    {
        $this->update([
            'admin_action' => 'price_change',
            'admin_action_time' => now(),
            'admin_user_id' => $adminUserId,
            'price_change_status' => 'pending',
        ]);
    }

    /**
     * Admin cancels price changes
     */
    public function cancelPriceChanges(int $adminUserId): void
    {
        $this->update([
            'is_locked' => false,
            'price_change_status' => 'cancelled',
            'price_change_action_time' => now(),
            'admin_user_id' => $adminUserId,
        ]);
    }

    /**
     * Admin approves price changes
     */
    public function approvePriceChanges(int $adminUserId): void
    {
        $this->update([
            'is_locked' => false,
            'price_change_status' => 'approved',
            'price_change_action_time' => now(),
            'admin_user_id' => $adminUserId,
        ]);
    }

    /**
     * Check if admin action is pending
     */
    public function isAdminActionPending(): bool
    {
        return $this->admin_action === 'pending';
    }

    /**
     * Check if price change action is pending
     */
    public function isPriceChangeActionPending(): bool
    {
        return $this->admin_action === 'price_change' && $this->price_change_status === 'pending';
    }

    /**
     * Check if system is ready for customer access
     */
    public function isSystemReadyForCustomers(): bool
    {
        if (!$this->is_locked) {
            return true;
        }

        if ($this->admin_action === 'keep_prices') {
            return true;
        }

        if ($this->admin_action === 'price_change' && in_array($this->price_change_status, ['cancelled', 'approved'])) {
            return true;
        }

        return false;
    }
}
