<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RemovedStock extends Model
{
    protected $fillable = [
        'stock_id',
        'product_id',
        'quantity', 
        'member_id', 
        'category',
        'status',
        'customer_id',
        'notes'
    ];

    protected $with = ['product', 'member', 'customer'];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function member()
    {
        return $this->belongsTo(User::class, 'member_id')->where('type', 'member');
    }

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id')->where('type', 'customer');
    }
}
