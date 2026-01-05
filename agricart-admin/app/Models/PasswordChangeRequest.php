<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;
use Carbon\Carbon;

class PasswordChangeRequest extends Model
{
    protected $fillable = [
        'member_id',
        'member_identifier',
        'status',
        'requested_at',
        'approved_at',
        'approved_by',
        'token',
        'expires_at',
    ];

    protected $casts = [
        'requested_at' => 'datetime',
        'approved_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    /**
     * Get the member who requested the password change
     */
    public function member(): BelongsTo
    {
        return $this->belongsTo(User::class, 'member_id');
    }

    /**
     * Get the admin who processed the request
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Check if the request is still valid (approved)
     */
    public function isValid(): bool
    {
        return $this->status === 'approved';
    }

    /**
     * Create a new password change request
     */
    public static function createForMember(User $member): self
    {
        return self::create([
            'member_id' => $member->id,
            'member_identifier' => $member->member_id,
            'status' => 'pending',
            'requested_at' => now(),
            'token' => Str::random(64),
            'expires_at' => Carbon::now()->addMinutes(30),
        ]);
    }
}
