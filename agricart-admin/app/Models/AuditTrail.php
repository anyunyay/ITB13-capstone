<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditTrail extends Model
{
    protected $fillable = [
        'sale_id',
        'stock_id',
        'product_id',
        'category',
        'quantity',
    ];

    public function sale()
    {
        return $this->belongsTo(Sales::class, 'sale_id');
    }

    public function stock()
    {
        return $this->belongsTo(Stock::class, 'stock_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }
}
