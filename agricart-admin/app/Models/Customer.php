<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Permission\Traits\HasRoles;

class Customer extends Model
{
    /** @use HasFactory<\Database\Factories\CustomerFactory> */
    use HasFactory, HasRoles;

    protected $fillable = [
        'firstname',
        'lastname',
        'username',
        'email',
        'address',
        'contact_number',
        'password',
    ];

    
}
