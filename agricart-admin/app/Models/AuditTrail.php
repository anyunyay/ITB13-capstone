<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AuditTrail extends Model
{
    use HasFactory;

    protected $fillable = [
        'sale_id',
        'order_id',
        'stock_id',
        'member_id',
        'product_id',
        'product_name',
        'category',
        'quantity',
        'available_stock_after_sale',
        'price_kilo',
        'price_pc',
        'price_tali',
        'unit_price',
    ];

    public function sale()
    {
        return $this->belongsTo(SalesAudit::class, 'sale_id');
    }

    public function order()
    {
        return $this->belongsTo(SalesAudit::class, 'order_id');
    }

    public function stock()
    {
        return $this->belongsTo(Stock::class, 'stock_id');
    }

    public function member()
    {
        return $this->belongsTo(User::class, 'member_id')->where('type', 'member');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    protected $casts = [
        'quantity' => 'float',
        'available_stock_after_sale' => 'float',
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

    /**
     * Create a comprehensive audit trail entry for order completion
     */
    public static function createOrderCompletionEntry(
        SalesAudit $order,
        Stock $stock,
        Product $product,
        float $quantitySold,
        float $availableStockAfterSale
    ): self {
        return self::create([
            'sale_id' => $order->id,
            'order_id' => $order->id,
            'stock_id' => $stock->id,
            'member_id' => $stock->member_id,
            'product_id' => $product->id,
            'product_name' => $product->name,
            'category' => $stock->category,
            'quantity' => $quantitySold,
            'available_stock_after_sale' => $availableStockAfterSale,
            'price_kilo' => $product->price_kilo,
            'price_pc' => $product->price_pc,
            'price_tali' => $product->price_tali,
            'unit_price' => self::getUnitPrice($product, $stock->category),
        ]);
    }

    /**
     * Get the unit price for a product based on category
     */
    private static function getUnitPrice(Product $product, string $category): float
    {
        switch ($category) {
            case 'Kilo':
                return $product->price_kilo ?? 0;
            case 'Pc':
                return $product->price_pc ?? 0;
            case 'Tali':
                return $product->price_tali ?? 0;
            default:
                return 0;
        }
    }
}
