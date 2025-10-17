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
        'price_kilo',
        'price_pc',
        'price_tali',
        'unit_price',
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

    protected $casts = [
        'quantity' => 'float',
        'price_kilo' => 'float',
        'price_pc' => 'float',
        'price_tali' => 'float',
        'unit_price' => 'float',
    ];

    /**
     * Get the price that was used for this sale based on category
     */
    public function getSalePrice(): float
    {
        switch ($this->category) {
            case 'Kilo':
                return $this->price_kilo ?? 0;
            case 'Pc':
                return $this->price_pc ?? 0;
            case 'Tali':
                return $this->price_tali ?? 0;
            default:
                return $this->unit_price ?? 0;
        }
    }

    /**
     * Calculate the total amount for this audit trail item
     */
    public function getTotalAmount(): float
    {
        return $this->quantity * $this->getSalePrice();
    }

    /**
     * Store the product prices at the time of sale
     */
    public function storeProductPrices(Product $product): void
    {
        $this->update([
            'price_kilo' => $product->price_kilo,
            'price_pc' => $product->price_pc,
            'price_tali' => $product->price_tali,
            'unit_price' => $this->getSalePrice(),
        ]);
    }
}
