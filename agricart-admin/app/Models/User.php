<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Support\Facades\Log;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        // Admin fields
        'name',
        'email',
        'password',
        // Customer fields
        'address line',
        'barangay',
        'city',
        'province',
        'contact_number',
        // Logistic fields
        'address',
        'registration_date',
        // Member fields
        'document',
        // Type/role discriminator (optional, for user type distinction)
        'type',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'registration_date' => 'datetime',
        ];
    }

    // Boot method to assign roles based on user type
    public static function booted()
    {
        static::created(function ($user) {
            if ($user->type && !$user->hasRole($user->type)) {
                // Only assign if a role with this name exists
                try {
                    $user->assignRole($user->type);
                } catch (\Exception $e) {
                    // Log the error if the role does not exist
                    Log::error("Role {$user->type} does not exist for user ID {$user->id}");
                }
            }
        });
    }

    // Customer relationships
    public function sales()
    {
        return $this->hasMany(Sales::class, 'customer_id')->where('type', 'customer');
    }

    // Member relationships
    public function stocks()
    {
        return $this->hasMany(Stock::class);
    }

    public function stockTrail()
    {
        return $this->hasMany(InventoryStockTrail::class);
    }
} 