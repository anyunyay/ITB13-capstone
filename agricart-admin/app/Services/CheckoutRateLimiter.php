<?php

namespace App\Services;

use App\Models\CheckoutRateLimit;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class CheckoutRateLimiter
{
    /**
     * Maximum number of checkouts allowed within the time window
     */
    const MAX_CHECKOUTS = 3;

    /**
     * Time window in minutes for rate limiting
     */
    const TIME_WINDOW_MINUTES = 10;

    /**
     * Check if a user can perform a checkout
     * 
     * @param int $userId
     * @return array ['allowed' => bool, 'remaining' => int, 'reset_at' => Carbon|null]
     */
    public static function canCheckout(int $userId): array
    {
        // Get checkout attempts within the rolling window
        $windowStart = Carbon::now()->subMinutes(self::TIME_WINDOW_MINUTES);
        
        $recentCheckouts = CheckoutRateLimit::where('user_id', $userId)
            ->where('checkout_at', '>=', $windowStart)
            ->orderBy('checkout_at', 'asc')
            ->get();

        $checkoutCount = $recentCheckouts->count();
        $remaining = max(0, self::MAX_CHECKOUTS - $checkoutCount);
        
        // If limit reached, calculate when the oldest checkout will expire
        $resetAt = null;
        if ($checkoutCount >= self::MAX_CHECKOUTS) {
            $oldestCheckout = $recentCheckouts->first();
            $resetAt = Carbon::parse($oldestCheckout->checkout_at)
                ->addMinutes(self::TIME_WINDOW_MINUTES);
        }

        return [
            'allowed' => $checkoutCount < self::MAX_CHECKOUTS,
            'remaining' => $remaining,
            'reset_at' => $resetAt,
            'current_count' => $checkoutCount,
        ];
    }

    /**
     * Record a successful checkout
     * 
     * @param int $userId
     * @return void
     */
    public static function recordCheckout(int $userId): void
    {
        CheckoutRateLimit::create([
            'user_id' => $userId,
            'checkout_at' => Carbon::now(),
        ]);

        // Clean up old records (older than the time window)
        self::cleanupOldRecords($userId);
    }

    /**
     * Clean up old checkout records for a user
     * 
     * @param int $userId
     * @return void
     */
    public static function cleanupOldRecords(int $userId): void
    {
        $cutoffTime = Carbon::now()->subMinutes(self::TIME_WINDOW_MINUTES * 2);
        
        CheckoutRateLimit::where('user_id', $userId)
            ->where('checkout_at', '<', $cutoffTime)
            ->delete();
    }

    /**
     * Get a human-readable error message for rate limit
     * 
     * @param Carbon $resetAt
     * @return string
     */
    public static function getRateLimitMessage(Carbon $resetAt): string
    {
        $now = Carbon::now();
        $diffInMinutes = $now->diffInMinutes($resetAt, false);
        $diffInSeconds = $now->diffInSeconds($resetAt, false);

        if ($diffInMinutes >= 1) {
            $minutes = ceil($diffInMinutes);
            return "You have reached the maximum checkout limit (3 checkouts per 10 minutes). Please try again in {$minutes} minute(s).";
        } else {
            $seconds = ceil($diffInSeconds);
            return "You have reached the maximum checkout limit (3 checkouts per 10 minutes). Please try again in {$seconds} second(s).";
        }
    }

    /**
     * Reset rate limit for a user (admin function)
     * 
     * @param int $userId
     * @return void
     */
    public static function resetUserLimit(int $userId): void
    {
        CheckoutRateLimit::where('user_id', $userId)->delete();
    }
}
