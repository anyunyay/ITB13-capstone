<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'price_kilo',
        'price_pc',
        'price_tali',
        'description',
        'image',
        'produce_type',
    ];

    public function stocks()
    {
        return $this->hasMany(Stock::class);
    }

    public function stockTrail()
    {
        return $this->hasMany(InventoryStockTrail::class);
    }

    public function scopeArchived($query)
    {
        return $query->whereNotNull('archived_at');
    }

    public function scopeActive($query)
    {
        return $query->whereNull('archived_at');
    }
}
