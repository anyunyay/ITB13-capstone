<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SellCategory extends Model
{
    /** @use HasFactory<\Database\Factories\SellCategoryFactory> */
    use HasFactory;

    protected $fillable = [
        'sell_category',
    ];

    public function stocks()
    {
        return $this->hasMany(Stock::class);
    }

    public function inventoryStockTrails()
    {
        return $this->hasMany(InventoryStockTrail::class);
    }
}
