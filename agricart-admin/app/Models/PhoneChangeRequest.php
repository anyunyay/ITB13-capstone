<?php

namespace App\Models;

use Carbon\Carbon;

class PhoneChangeRequest extends BaseOtpRequest
{
    protected $fillable = [
        'user_id',
        'new_phone',
        'otp',
        'expires_at',
        'is_used',
    ];

    /**
     * Create a new phone change request.
     */
    public static function createForUser(int $userId, string $newPhone): self
    {
        // Invalidate any existing requests for this user
        static::invalidateExistingRequests($userId);

        return static::create([
            'user_id' => $userId,
            'new_phone' => $newPhone,
            'otp' => static::generateOtp(),
            'expires_at' => Carbon::now()->addMinutes(15), // 15 minutes expiry
        ]);
    }

    /**
     * Get the verification target (phone number).
     */
    public function getVerificationTarget(): string
    {
        return $this->new_phone;
    }

    /**
     * Get the verification type name for display purposes.
     */
    public static function getVerificationType(): string
    {
        return 'phone number';
    }
}
