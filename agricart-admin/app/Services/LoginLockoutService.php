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
            $status = LoginAttempt::getLockoutStatus($identifier, $userType, $ipAddress);
            $remainingTime = $status['remaining_time'];
            
            $lockoutMessage = self::getLockoutMessage($remainingTime, $status['failed_attempts'], $status['lock_level']);
            
            throw ValidationException::withMessages([
                'email' => $lockoutMessage,
                'member_id' => $lockoutMessage, // For member login
                'lockout' => [
                    'is_locked' => true,
                    'remaining_time' => $remainingTime,
                    'failed_attempts' => $status['failed_attempts'],
                    'lock_level' => $status['lock_level'],
                    'lock_expires_at' => $status['lock_expires_at'],
                    'server_time' => $status['server_time'],
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
        
        // Calculate attempts remaining before lockout
        $attemptsRemaining = null;
        if (!$isLocked && $attempt->failed_attempts < LoginAttempt::MAX_FAILED_ATTEMPTS) {
            $attemptsRemaining = LoginAttempt::MAX_FAILED_ATTEMPTS - $attempt->failed_attempts;
        }
        
        return [
            'failed_attempts' => $attempt->failed_attempts,
            'lock_level' => $attempt->lock_level,
            'is_locked' => $isLocked,
            'remaining_time' => $remainingTime,
            'attempts_remaining' => $attemptsRemaining,
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
    private static function getLockoutMessage(int $remainingSeconds, int $failedAttempts, int $lockLevel): string
    {
        $minutes = ceil($remainingSeconds / 60);
        
        if ($remainingSeconds < 60) {
            return "Too many failed login attempts. Account locked for {$remainingSeconds} seconds. Please try again later.";
        } elseif ($minutes < 60) {
            $minuteText = $minutes === 1 ? 'minute' : 'minutes';
            return "Too many failed login attempts. Account locked for {$minutes} {$minuteText}. Please try again later.";
        } else {
            $hours = ceil($minutes / 60);
            $hourText = $hours === 1 ? 'hour' : 'hours';
            return "Too many failed login attempts. Account locked for {$hours} {$hourText}. Please try again later.";
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
