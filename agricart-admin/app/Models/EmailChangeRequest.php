<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class EmailChangeRequest extends Model
{
    protected $fillable = [
        'user_id',
        'new_email',
        'otp',
        'expires_at',
        'is_used',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'is_used' => 'boolean',
    ];

    /**
     * Get the user that owns the email change request.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if the OTP is expired.
     */
    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    /**
     * Check if the OTP is valid (not used and not expired).
     */
    public function isValid(): bool
    {
        return !$this->is_used && !$this->isExpired();
    }

    /**
     * Mark the request as used.
     */
    public function markAsUsed(): void
    {
        $this->update(['is_used' => true]);
    }

    /**
     * Generate a new 6-digit OTP.
     */
    public static function generateOtp(): string
    {
        return str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    /**
     * Create a new email change request.
     */
    public static function createForUser(int $userId, string $newEmail): self
    {
        // Invalidate any existing requests for this user
        static::where('user_id', $userId)
            ->where('is_used', false)
            ->update(['is_used' => true]);

        return static::create([
            'user_id' => $userId,
            'new_email' => $newEmail,
            'otp' => static::generateOtp(),
            'expires_at' => Carbon::now()->addMinutes(15), // 15 minutes expiry
        ]);
    }

    /**
     * Find a valid OTP for the given user and OTP code.
     */
    public static function findValidOtp(int $userId, string $otp): ?self
    {
        return static::where('user_id', $userId)
            ->where('otp', $otp)
            ->where('is_used', false)
            ->where('expires_at', '>', Carbon::now())
            ->first();
    }
}
