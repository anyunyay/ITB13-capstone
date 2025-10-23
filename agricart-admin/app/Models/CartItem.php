<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CartItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'cart_id',
        'product_id',
        'quantity',
        'category',
    ];

    public function cart()
    {
        return $this->belongsTo(Cart::class);
    }

    public function user()
    {
        return $this->hasOneThrough(User::class, Cart::class, 'id', 'id', 'cart_id', 'user_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    protected $casts = [
        'quantity' => 'decimal:2',
    ];
}
