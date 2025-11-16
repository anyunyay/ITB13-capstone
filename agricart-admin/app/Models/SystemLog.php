<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SystemLog extends Model
{
    protected $fillable = [
        'user_id',
        'user_email',
        'user_type',
        'action',
        'event_type',
        'details',
        'ip_address',
        'context',
        'performed_at',
    ];

    protected $casts = [
        'context' => 'array',
        'performed_at' => 'datetime',
    ];

    /**
     * Get the user that performed the action
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope to filter by event type
     */
    public function scopeEventType($query, $eventType)
    {
        return $query->where('event_type', $eventType);
    }

    /**
     * Scope to filter by user type
     */
    public function scopeUserType($query, $userType)
    {
        return $query->where('user_type', $userType);
    }

    /**
     * Scope to filter by date range
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        if ($startDate) {
            $query->whereDate('performed_at', '>=', $startDate);
        }
        if ($endDate) {
            $query->whereDate('performed_at', '<=', $endDate);
        }
        return $query;
    }

    /**
     * Scope to search logs
     */
    public function scopeSearch($query, $search)
    {
        if ($search) {
            return $query->where(function ($q) use ($search) {
                $q->where('details', 'like', "%{$search}%")
                    ->orWhere('user_email', 'like', "%{$search}%")
                    ->orWhere('action', 'like', "%{$search}%")
                    ->orWhere('ip_address', 'like', "%{$search}%");
            });
        }
        return $query;
    }
}
