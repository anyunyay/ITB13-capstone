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
    ];

    /** @use HasFactory<\Database\Factories\LogisticFactory> */
    use HasFactory;
}
