<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AuditTrail extends Model
{
    use HasFactory;

    protected $fillable = [
        'sale_id',
        'stock_id',
        'product_id',
        'category',
        'quantity',
    ];

    public function sale()
    {
        return $this->belongsTo(SalesAudit::class, 'sale_id');
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
