<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Permission\Traits\HasRoles;

class Logistic extends Model
{
    /** @use HasFactory<\Database\Factories\LogisticFactory> */
    use HasFactory, HasRoles;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'address',
        'registration_date',
    ];
}
