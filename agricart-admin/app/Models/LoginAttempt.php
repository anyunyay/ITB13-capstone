<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class LoginAttempt extends Model
{
    use HasFactory;

    protected $fillable = [
        'identifier',
        'user_type',
        'ip_address',
        'failed_attempts',
        'lock_level',
        'lock_expires_at',
        'locked_until',
        'last_attempt_at',
    ];

    protected $casts = [
        'lock_expires_at' => 'datetime',
        'locked_until' => 'datetime',
        'last_attempt_at' => 'datetime',
    ];

    /**
     * Lockout durations in minutes for each level
     */
    const LOCKOUT_DURATIONS = [
        1 => 1,      // Level 1: 1 minute
        2 => 3,      // Level 2: 3 minutes  
        3 => 5,      // Level 3: 5 minutes
        4 => 1440,   // Level 4+: 24 hours (1440 minutes)
    ];

    /**
     * Maximum failed attempts before first lockout
     */
    const MAX_FAILED_ATTEMPTS = 3;

    /**
     * Record a failed login attempt
     */
    public static function recordFailedAttempt(string $identifier, string $userType, string $ipAddress): self
    {
        $attempt = self::where('identifier', $identifier)
            ->where('user_type', $userType)
            ->where('ip_address', $ipAddress)
            ->first();

        if (!$attempt) {
            $attempt = self::create([
                'identifier' => $identifier,
                'user_type' => $userType,
                'ip_address' => $ipAddress,
                'failed_attempts' => 0,
                'lock_level' => 0,
            ]);
        }

        $attempt->increment('failed_attempts');
        $attempt->update(['last_attempt_at' => now()]);

        // Check if we need to lock the account
        if ($attempt->failed_attempts >= self::MAX_FAILED_ATTEMPTS) {
            $lockLevel = self::getLockLevel($attempt->failed_attempts);
            $lockoutDuration = self::LOCKOUT_DURATIONS[$lockLevel];
            
            $attempt->update([
                'lock_level' => $lockLevel,
                'lock_expires_at' => now()->addMinutes($lockoutDuration),
                'locked_until' => now()->addMinutes($lockoutDuration) // Keep for backward compatibility
            ]);
        }

        return $attempt;
    }

    /**
     * Clear failed attempts for successful login
     */
    public static function clearFailedAttempts(string $identifier, string $userType, string $ipAddress): void
    {
        self::where('identifier', $identifier)
            ->where('user_type', $userType)
            ->where('ip_address', $ipAddress)
            ->delete();
    }

    /**
     * Check if account is currently locked
     */
    public static function isLocked(string $identifier, string $userType, string $ipAddress): bool
    {
        $attempt = self::where('identifier', $identifier)
            ->where('user_type', $userType)
            ->where('ip_address', $ipAddress)
            ->first();

        if (!$attempt || !$attempt->lock_expires_at) {
            return false;
        }

        return $attempt->lock_expires_at->isFuture();
    }

    /**
     * Get remaining lockout time in seconds
     */
    public static function getRemainingLockoutTime(string $identifier, string $userType, string $ipAddress): int
    {
        $attempt = self::where('identifier', $identifier)
            ->where('user_type', $userType)
            ->where('ip_address', $ipAddress)
            ->first();

        if (!$attempt || !$attempt->lock_expires_at) {
            return 0;
        }

        $remaining = $attempt->lock_expires_at->diffInSeconds(now());
        return max(0, $remaining);
    }

    /**
     * Get lockout status information
     */
    public static function getLockoutStatus(string $identifier, string $userType, string $ipAddress): array
    {
        $attempt = self::where('identifier', $identifier)
            ->where('user_type', $userType)
            ->where('ip_address', $ipAddress)
            ->first();

        if (!$attempt) {
            return [
                'is_locked' => false,
                'failed_attempts' => 0,
                'lock_level' => 0,
                'remaining_time' => 0,
                'lock_expires_at' => null,
                'server_time' => now()->toISOString(),
            ];
        }

        $isLocked = $attempt->lock_expires_at && $attempt->lock_expires_at->isFuture();
        $remainingTime = $isLocked ? $attempt->lock_expires_at->diffInSeconds(now()) : 0;

        return [
            'is_locked' => $isLocked,
            'failed_attempts' => $attempt->failed_attempts,
            'lock_level' => $attempt->lock_level,
            'remaining_time' => max(0, $remainingTime),
            'lock_expires_at' => $attempt->lock_expires_at?->toISOString(),
            'server_time' => now()->toISOString(),
        ];
    }

    /**
     * Get lock level based on failed attempts count
     */
    private static function getLockLevel(int $failedAttempts): int
    {
        if ($failedAttempts < self::MAX_FAILED_ATTEMPTS) {
            return 0;
        }
        
        $excessAttempts = $failedAttempts - self::MAX_FAILED_ATTEMPTS;
        return min(4, 1 + $excessAttempts);
    }

    /**
     * Get lockout duration based on failed attempts count
     */
    private static function getLockoutDuration(int $failedAttempts): int
    {
        $lockLevel = self::getLockLevel($failedAttempts);
        return self::LOCKOUT_DURATIONS[$lockLevel];
    }

    /**
     * Clean up old login attempts (older than 30 days)
     */
    public static function cleanup(): void
    {
        self::where('created_at', '<', now()->subDays(30))->delete();
    }
}