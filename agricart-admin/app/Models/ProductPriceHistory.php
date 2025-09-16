<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductPriceHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'price_kilo',
        'price_pc',
        'price_tali',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}


