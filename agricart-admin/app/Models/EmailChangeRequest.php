<?php

namespace App\Models;

use Carbon\Carbon;

class EmailChangeRequest extends BaseOtpRequest
{
    protected $fillable = [
        'user_id',
        'new_email',
        'otp',
        'expires_at',
        'is_used',
    ];

    /**
     * Create a new email change request.
     */
    public static function createForUser(int $userId, string $newEmail): self
    {
        // Invalidate any existing requests for this user
        static::invalidateExistingRequests($userId);

        return static::create([
            'user_id' => $userId,
            'new_email' => $newEmail,
            'otp' => static::generateOtp(),
            'expires_at' => Carbon::now()->addMinutes(15), // 15 minutes expiry
        ]);
    }

    /**
     * Get the verification target (email address).
     */
    public function getVerificationTarget(): string
    {
        return $this->new_email;
    }

    /**
     * Get the verification type name for display purposes.
     */
    public static function getVerificationType(): string
    {
        return 'email address';
    }
}
