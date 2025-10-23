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

    protected $casts = [
        'price_kilo' => 'decimal:2',
        'price_pc' => 'decimal:2',
        'price_tali' => 'decimal:2',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}


