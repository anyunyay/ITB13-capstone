<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Address extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'label',
        'street',
        'barangay',
        'city',
        'province',
        'postal_code',
        'contact_number',
        'is_default',
    ];

    protected $casts = [
        'is_default' => 'boolean',
    ];

    /**
     * Get the user that owns the address.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the full address as a formatted string.
     */
    public function getFullAddressAttribute(): string
    {
        return "{$this->street}, {$this->barangay}, {$this->city}, {$this->province} {$this->postal_code}";
    }

    /**
     * Scope to get default address.
     */
    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }

    /**
     * Scope to get addresses by type.
     */
    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }
}
