<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Stock extends Model
{
    use HasFactory;

    protected $fillable = [
        'quantity', 
        'member_id', 
        'product_id',
        'sell_category_id'
    ];

    protected $with = ['product', 'member', 'category'];
    
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function member()
    {
        return $this->belongsTo(User::class, 'member_id')->where('type', 'member');
    }

    public function category()
    {
        return $this->belongsTo(SellCategory::class, 'sell_category_id');
    }
}
