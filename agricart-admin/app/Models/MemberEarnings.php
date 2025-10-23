<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MemberEarnings extends Model
{
    protected $fillable = [
        'member_id',
        'total_earnings',
        'pending_earnings',
        'available_earnings',
    ];

    protected $casts = [
        'total_earnings' => 'decimal:2',
        'pending_earnings' => 'decimal:2',
        'available_earnings' => 'decimal:2',
    ];

    /**
     * Get the member that owns the earnings.
     */
    public function member()
    {
        return $this->belongsTo(User::class, 'member_id');
    }
}
