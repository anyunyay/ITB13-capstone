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
        'status',
        'requested_at',
        'processed_at',
        'processed_by',
        'admin_notes',
    ];

    protected $casts = [
        'requested_at' => 'datetime',
        'processed_at' => 'datetime',
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
    public function processedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
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
            'status' => 'pending',
            'requested_at' => now(),
        ]);
    }
}
