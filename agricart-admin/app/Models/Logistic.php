<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Logistic extends Model
{
    protected $fillable = [
        'name',
        'email',
        'phone',
        'address',
        'registration_date',
    ];

    /** @use HasFactory<\Database\Factories\LogisticFactory> */
    use HasFactory;
}
