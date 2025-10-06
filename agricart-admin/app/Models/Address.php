<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Address extends Model
{
<<<<<<< HEAD
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'street',
        'barangay',
        'city',
        'province',
        'is_default',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
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
     * Scope to get default address for a user.
     */
    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }


    /**
     * Get the full address as a formatted string.
     */
    public function getFullAddressAttribute(): string
    {
        return "{$this->street}, {$this->barangay}, {$this->city}, {$this->province}";
    }
=======
    //
>>>>>>> 280b2d6e2953a45be89050d7aeefdafc4dd69e90
}
