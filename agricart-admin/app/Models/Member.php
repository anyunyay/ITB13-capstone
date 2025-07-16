<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Spatie\Permission\Traits\HasRoles;

class Member extends Model
{
    use HasFactory, HasRoles;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'address',
        'registration_date',
        'document',
    ];

    public function stocks()
    {
        return $this->hasMany(Stock::class);
    }

    public function stockTrail()
    {
        return $this->hasMany(InventoryStockTrail::class);
    }
}
