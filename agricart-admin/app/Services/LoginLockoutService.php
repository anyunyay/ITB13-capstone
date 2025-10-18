<?php

namespace App\Services;

use App\Models\LoginAttempt;
use Illuminate\Validation\ValidationException;

class LoginLockoutService
{
    /**
     * Check if login is allowed and throw exception if locked
     */
    public static function checkLoginAllowed(string $identifier, string $userType, string $ipAddress): void
    {
        if (LoginAttempt::isLocked($identifier, $userType, $ipAddress)) {
            $remainingTime = LoginAttempt::getRemainingLockoutTime($identifier, $userType, $ipAddress);
            $status = LoginAttempt::getLockoutStatus($identifier, $userType, $ipAddress);
            
            throw ValidationException::withMessages([
                'email' => self::getLockoutMessage($remainingTime, $status['failed_attempts']),
                'lockout' => [
                    'is_locked' => true,
                    'remaining_time' => $remainingTime,
                    'failed_attempts' => $status['failed_attempts'],
                    'locked_until' => $status['locked_until']?->toISOString(),
                ]
            ]);
        }
    }

    /**
     * Record a failed login attempt
     */
    public static function recordFailedAttempt(string $identifier, string $userType, string $ipAddress): array
    {
        $attempt = LoginAttempt::recordFailedAttempt($identifier, $userType, $ipAddress);
        
        $isLocked = $attempt->lock_expires_at && $attempt->lock_expires_at->isFuture();
        $remainingTime = $isLocked ? max(0, $attempt->lock_expires_at->diffInSeconds(now())) : 0;
        
        return [
            'failed_attempts' => $attempt->failed_attempts,
            'lock_level' => $attempt->lock_level,
            'is_locked' => $isLocked,
            'remaining_time' => $remainingTime,
            'lock_expires_at' => $attempt->lock_expires_at?->toISOString(),
            'server_time' => now()->toISOString(),
        ];
    }

    /**
     * Clear failed attempts on successful login
     */
    public static function clearFailedAttempts(string $identifier, string $userType, string $ipAddress): void
    {
        LoginAttempt::clearFailedAttempts($identifier, $userType, $ipAddress);
    }

    /**
     * Get lockout status for frontend
     */
    public static function getLockoutStatus(string $identifier, string $userType, string $ipAddress): array
    {
        return LoginAttempt::getLockoutStatus($identifier, $userType, $ipAddress);
    }

    /**
     * Get appropriate lockout message
     */
    private static function getLockoutMessage(int $remainingSeconds, int $failedAttempts): string
    {
        $minutes = ceil($remainingSeconds / 60);
        
        if ($remainingSeconds < 60) {
            return "Account locked. Try again in {$remainingSeconds} seconds.";
        } elseif ($minutes < 60) {
            return "Account locked. Try again in {$minutes} minutes.";
        } else {
            $hours = ceil($minutes / 60);
            return "Account locked. Try again in {$hours} hours.";
        }
    }

    /**
     * Format remaining time for display
     */
    public static function formatRemainingTime(int $seconds): string
    {
        if ($seconds < 60) {
            return sprintf('%02d:%02d', 0, $seconds);
        } elseif ($seconds < 3600) {
            $minutes = floor($seconds / 60);
            $remainingSeconds = $seconds % 60;
            return sprintf('%02d:%02d', $minutes, $remainingSeconds);
        } else {
            $hours = floor($seconds / 3600);
            $minutes = floor(($seconds % 3600) / 60);
            return sprintf('%02d:%02d:%02d', $hours, $minutes, $seconds % 60);
        }
    }
}
