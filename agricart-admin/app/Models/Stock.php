<?php

namespace App\Models;

use App\Helpers\SystemLogger;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Stock extends Model
{
    use HasFactory;

    protected $fillable = [
        'quantity', 
        'sold_quantity',
        'removed_quantity',
        'pending_order_qty',
        'initial_quantity',
        'member_id', 
        'product_id',
        'category',
        'removed_at',
        'notes'
    ];

    protected $with = ['product', 'member'];
    
    protected $casts = [
        'removed_at' => 'datetime',
        'quantity' => 'decimal:2',
        'sold_quantity' => 'decimal:2',
        'removed_quantity' => 'decimal:2',
        'pending_order_qty' => 'decimal:2',
        'initial_quantity' => 'decimal:2',
    ];

    protected $appends = ['is_locked', 'can_be_edited', 'can_be_removed'];
    
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function member()
    {
        return $this->belongsTo(User::class, 'member_id')->where('type', 'member');
    }

    public function stockTrails()
    {
        return $this->hasMany(StockTrail::class);
    }



    /**
     * Scope for stocks that have been completely sold (quantity = 0)
     */
    public function scopeSold($query)
    {
        return $query->where('quantity', 0)
                    ->where('sold_quantity', '>', 0)
                    ->whereNull('removed_at');
    }

    /**
     * Scope for stocks that are available for purchase
     * (have quantity > 0)
     */
    public function scopeAvailable($query)
    {
        return $query->where('quantity', '>', 0)
                    ->whereNull('removed_at');
    }

    /**
     * Scope for stocks that have available quantity (quantity > 0)
     * regardless of customer assignment - this is the true available stock
     */
    public function scopeHasAvailableQuantity($query)
    {
        return $query->where('quantity', '>', 0)
                    ->whereNull('removed_at');
    }

    /**
     * Scope for stocks that have sold quantities (regardless of current availability)
     */
    public function scopeHasSold($query)
    {
        return $query->where('sold_quantity', '>', 0)
                    ->whereNull('removed_at');
    }

    /**
     * Scope for stocks that are completely available (never sold anything)
     */
    public function scopeCompletelyAvailable($query)
    {
        return $query->where('quantity', '>', 0)
                    ->where('sold_quantity', 0)
                    ->whereNull('removed_at');
    }

    /**
     * Scope for stocks that customers can see and interact with
     * (available stocks only)
     */
    public function scopeCustomerVisible($query)
    {
        return $query->where('quantity', '>', 0)
                    ->whereNull('removed_at');
    }

    /**
     * Scope for removed stocks
     */
    public function scopeRemoved($query)
    {
        return $query->whereNotNull('removed_at');
    }

    /**
     * Scope for active (non-removed) stocks
     */
    public function scopeActive($query)
    {
        return $query->whereNull('removed_at');
    }

    /**
     * Check if stock is removed
     */
    public function isRemoved()
    {
        return !is_null($this->removed_at);
    }

    /**
     * Remove stock quantity (partial or full removal)
     * 
     * @param float $quantityToRemove The quantity to remove from stock
     * @param string|null $notes Removal reason/notes
     * @return void
     */
    public function remove($quantityToRemove = null, $notes = null)
    {
        // If no quantity specified, remove all remaining quantity (legacy behavior)
        if ($quantityToRemove === null) {
            $quantityToRemove = $this->quantity;
        }

        // Ensure we don't remove more than available
        $quantityToRemove = min($quantityToRemove, $this->quantity);

        // Update the stock quantities
        $this->increment('removed_quantity', $quantityToRemove);
        $this->decrement('quantity', $quantityToRemove);

        // Only mark as removed if all quantity is gone
        if ($this->quantity <= 0) {
            $this->update([
                'removed_at' => now(),
                'notes' => $notes,
            ]);
        } else {
            // Just update notes if partially removed
            if ($notes) {
                $currentNotes = $this->notes ? $this->notes . '; ' : '';
                $this->update([
                    'notes' => $currentNotes . $notes,
                ]);
            }
        }
    }

    /**
     * Get the total available quantity for this stock
     * This is the current quantity that can be sold
     */
    public function getAvailableQuantityAttribute()
    {
        return $this->quantity;
    }

    /**
     * Get the total sold quantity for this stock
     * This tracks how much has been sold from this stock
     */
    public function getTotalSoldQuantityAttribute()
    {
        return $this->sold_quantity;
    }

    /**
     * Get the original quantity when this stock was created
     */
    public function getOriginalQuantityAttribute()
    {
        return $this->initial_quantity ?? $this->quantity + $this->sold_quantity;
    }

    /**
     * Check if this stock has any sales
     */
    public function hasSales()
    {
        return $this->sold_quantity > 0;
    }

    /**
     * Check if this stock is completely sold
     */
    public function isCompletelySold()
    {
        return $this->quantity == 0 && $this->sold_quantity > 0;
    }

    /**
     * Check if this stock is completely available (never sold)
     */
    public function isCompletelyAvailable()
    {
        return $this->quantity > 0 && $this->sold_quantity == 0;
    }

    /**
     * Get the percentage of stock that has been sold
     */
    public function getSoldPercentageAttribute()
    {
        $original = $this->getOriginalQuantityAttribute();
        if ($original == 0) return 0;
        
        return ($this->sold_quantity / $original) * 100;
    }

    /**
     * Get the available quantity for customers (current stock - pending orders)
     */
    public function getCustomerAvailableQuantityAttribute()
    {
        return max(0, $this->quantity - $this->pending_order_qty);
    }

    /**
     * Increment pending order quantity
     */
    public function incrementPendingOrders($quantity)
    {
        $this->increment('pending_order_qty', $quantity);
    }

    /**
     * Decrement pending order quantity
     */
    public function decrementPendingOrders($quantity)
    {
        $this->decrement('pending_order_qty', max(0, $quantity));
    }

    /**
     * Process order approval - convert pending to sold
     */
    public function processPendingOrderApproval($quantity)
    {
        DB::transaction(function () use ($quantity) {
            // Decrease actual stock
            $this->decrement('quantity', $quantity);
            // Increase sold quantity
            $this->increment('sold_quantity', $quantity);
            // Decrease pending orders
            $this->decrement('pending_order_qty', $quantity);
        });
    }

    /**
     * Process order rejection - release pending stock
     */
    public function processPendingOrderRejection($quantity)
    {
        $this->decrement('pending_order_qty', $quantity);
    }

    /**
     * Restore removed stock
     */
    public function restore()
    {
        $this->update([
            'removed_at' => null,
            'notes' => null,
        ]);
    }

    /**
     * Check if stock is locked from modifications (quantity is zero and fully sold)
     */
    public function isLocked()
    {
        return $this->quantity == 0 && $this->sold_quantity > 0;
    }

    /**
     * Check if stock can be edited
     */
    public function canBeEdited()
    {
        return !$this->isLocked() && !$this->isRemoved();
    }

    /**
     * Check if stock can be removed
     */
    public function canBeRemoved()
    {
        return !$this->isLocked() && !$this->isRemoved();
    }

    /**
     * Accessor for is_locked attribute
     */
    public function getIsLockedAttribute()
    {
        return $this->isLocked();
    }

    /**
     * Accessor for can_be_edited attribute
     */
    public function getCanBeEditedAttribute()
    {
        return $this->canBeEdited();
    }

    /**
     * Accessor for can_be_removed attribute
     */
    public function getCanBeRemovedAttribute()
    {
        return $this->canBeRemoved();
    }
}
