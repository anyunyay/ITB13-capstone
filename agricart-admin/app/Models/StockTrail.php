<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockTrail extends Model
{
    use HasFactory;

    protected $fillable = [
        'stock_id',
        'product_id',
        'member_id',
        'performed_by',
        'action_type',
        'old_quantity',
        'new_quantity',
        'category',
        'notes',
        'performed_by_type',
    ];

    protected $casts = [
        'old_quantity' => 'decimal:2',
        'new_quantity' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the stock associated with this trail
     */
    public function stock(): BelongsTo
    {
        return $this->belongsTo(Stock::class);
    }

    /**
     * Get the product associated with this trail
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the member (supplier) associated with this trail
     */
    public function member(): BelongsTo
    {
        return $this->belongsTo(User::class, 'member_id');
    }

    /**
     * Get the user who performed this action
     */
    public function performedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'performed_by');
    }

    /**
     * Static method to record a stock trail entry
     */
    public static function record(
        int $stockId,
        int $productId,
        string $actionType,
        ?float $oldQuantity = null,
        ?float $newQuantity = null,
        ?int $memberId = null,
        ?string $category = null,
        ?string $notes = null,
        ?int $performedBy = null,
        ?string $performedByType = null
    ): self {
        return self::create([
            'stock_id' => $stockId,
            'product_id' => $productId,
            'member_id' => $memberId,
            'performed_by' => $performedBy,
            'action_type' => $actionType,
            'old_quantity' => $oldQuantity,
            'new_quantity' => $newQuantity,
            'category' => $category,
            'notes' => $notes,
            'performed_by_type' => $performedByType,
        ]);
    }
}
