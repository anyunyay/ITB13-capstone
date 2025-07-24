<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventoryStockTrail extends Model
{
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
