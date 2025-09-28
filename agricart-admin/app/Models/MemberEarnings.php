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

    /**
     * Get the member that owns the earnings.
     */
    public function member()
    {
        return $this->belongsTo(User::class, 'member_id');
    }
}
