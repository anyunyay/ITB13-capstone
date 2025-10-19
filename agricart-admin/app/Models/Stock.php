<?php

namespace App\Models;

use App\Helpers\SystemLogger;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Stock extends Model
{
    use HasFactory;

    protected $fillable = [
        'quantity', 
        'sold_quantity',
        'initial_quantity',
        'member_id', 
        'product_id',
        'category',
        'last_customer_id',
        'removed_at',
        'notes'
    ];

    protected $with = ['product', 'member', 'lastCustomer'];
    
    protected $casts = [
        'removed_at' => 'datetime',
    ];
    
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function member()
    {
        return $this->belongsTo(User::class, 'member_id')->where('type', 'member');
    }

    public function lastCustomer()
    {
        return $this->belongsTo(User::class, 'last_customer_id')->where('type', 'customer');
    }


    /**
     * Scope for stocks that have been completely sold (quantity = 0)
     * and have been approved by admin (last_customer_id is set)
     */
    public function scopeSold($query)
    {
        return $query->where('quantity', 0)
                    ->where('sold_quantity', '>', 0)
                    ->whereNotNull('last_customer_id')
                    ->whereNull('removed_at');
    }

    /**
     * Scope for stocks that are available for purchase
     * (have quantity > 0 and not assigned to any customer)
     */
    public function scopeAvailable($query)
    {
        return $query->where('quantity', '>', 0)
                    ->whereNull('last_customer_id')
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
                    ->whereNull('last_customer_id')
                    ->whereNull('removed_at');
    }

    /**
     * Scope for stocks that customers can see and interact with
     * (available stocks only)
     */
    public function scopeCustomerVisible($query)
    {
        return $query->where('quantity', '>', 0)
                    ->whereNull('last_customer_id')
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
     * Remove stock (soft delete)
     */
    public function remove($notes = null)
    {
        $this->update([
            'removed_at' => now(),
            'notes' => $notes,
        ]);
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
        return $this->quantity > 0 && $this->sold_quantity == 0 && is_null($this->last_customer_id);
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
     * Restore removed stock
     */
    public function restore()
    {
        $this->update([
            'removed_at' => null,
            'notes' => null,
        ]);
    }
}
