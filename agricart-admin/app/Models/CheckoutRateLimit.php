<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CheckoutRateLimit extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'checkout_at',
    ];

    protected $casts = [
        'checkout_at' => 'datetime',
    ];

    /**
     * Get the user that owns the checkout rate limit record
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
