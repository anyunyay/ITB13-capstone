<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryStockTrail extends Model
{
    /** @use HasFactory<\Database\Factories\InventoryStockTrailFactory> */
    use HasFactory;

    protected $fillable = [
        'stock_id',
        'product_id',
        'quantity', 
        'member_id', 
        'category'
    ];

    protected $with = ['product', 'member'];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function member()
    {
        return $this->belongsTo(User::class, 'member_id')->where('type', 'member');
    }
}
