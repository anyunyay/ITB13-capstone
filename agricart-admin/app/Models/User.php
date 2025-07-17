<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasRoles, HasApiTokens;

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
        'firstname',
        'lastname',
        'username',
        'address line',
        'barangay',
        'city',
        'province',
        'contact_number',
        // Logistic fields
        'phone',
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