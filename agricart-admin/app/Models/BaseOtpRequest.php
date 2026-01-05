<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

abstract class BaseOtpRequest extends Model
{
    protected $fillable = [
        'user_id',
        'otp',
        'expires_at',
        'is_used',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'is_used' => 'boolean',
    ];

    /**
     * Get the user that owns the OTP request.
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
     * Find a valid OTP for the given user and OTP code.
     */
    public static function findValidOtp(int $userId, string $otp): ?static
    {
        return static::where('user_id', $userId)
            ->where('otp', $otp)
            ->where('is_used', false)
            ->where('expires_at', '>', Carbon::now())
            ->first();
    }

    /**
     * Invalidate any existing requests for this user.
     */
    public static function invalidateExistingRequests(int $userId): void
    {
        static::where('user_id', $userId)
            ->where('is_used', false)
            ->update(['is_used' => true]);
    }

    /**
     * Create a new OTP request with common fields.
     * Subclasses should override this to add their specific fields.
     */
    public static function createOtpRequest(int $userId, int $expiryMinutes = 15): static
    {
        // Invalidate any existing requests for this user
        static::invalidateExistingRequests($userId);

        return static::create([
            'user_id' => $userId,
            'otp' => static::generateOtp(),
            'expires_at' => Carbon::now()->addMinutes($expiryMinutes),
        ]);
    }

    /**
     * Abstract method to get the verification target (email, phone, etc.)
     * Subclasses must implement this to return the target being verified.
     */
    abstract public function getVerificationTarget(): string;

    /**
     * Abstract method to get the verification type name for display purposes.
     * Subclasses must implement this to return a human-readable type name.
     */
    abstract public static function getVerificationType(): string;
}

