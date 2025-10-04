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
        'member_id', 
        'product_id',
        'category',
        'status',
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
     * Scope for stocks that have been partially sold (quantity reduced but not empty)
     * and have been approved by admin (last_customer_id is set)
     */
    public function scopePartial($query)
    {
        return $query->where('quantity', '>', 0)
                    ->whereNotNull('last_customer_id')
                    ->whereNull('removed_at');
    }

    /**
     * Scope for stocks that have been completely sold (quantity = 0)
     * and have been approved by admin (last_customer_id is set)
     */
    public function scopeSold($query)
    {
        return $query->where('quantity', 0)
                    ->whereNotNull('last_customer_id')
                    ->whereNull('removed_at');
    }

    /**
     * Scope for stocks that are available for purchase
     * (have quantity and not assigned to any customer)
     */
    public function scopeAvailable($query)
    {
        return $query->where('quantity', '>', 0)
                    ->whereNull('last_customer_id')
                    ->whereNull('removed_at');
    }

    /**
     * Scope for stocks that customers can see and interact with
     * (available + partial stocks, but not sold stocks)
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
     * Remove stock (soft delete)
     */
    public function remove($notes = null)
    {
        $this->update([
            'removed_at' => now(),
            'notes' => $notes,
            'status' => 'removed'
        ]);
    }

    /**
     * Restore removed stock
     */
    public function restore()
    {
        $this->update([
            'removed_at' => null,
            'notes' => null,
            'status' => null
        ]);
    }

    /**
     * Set status to partial when approved by admin and quantity is not 0
     * This method should be called when an order is approved
     */
    public function setPartialStatus()
    {
        if ($this->quantity > 0 && !is_null($this->last_customer_id)) {
            $this->status = 'partial';
            $this->save();
            
            // Log stock status change
            SystemLogger::logStockUpdate(
                $this->id,
                $this->product_id,
                $this->quantity,
                $this->quantity,
                null, // System change
                'system',
                'status_change',
                [
                    'new_status' => 'partial',
                    'last_customer_id' => $this->last_customer_id
                ]
            );
        }
    }

    /**
     * Set status to sold when quantity reaches 0
     * This method should be called when stock is completely sold
     */
    public function setSoldStatus()
    {
        if ($this->quantity == 0 && !is_null($this->last_customer_id)) {
            $this->status = 'sold';
            $this->save();
            
            // Log stock status change
            SystemLogger::logStockUpdate(
                $this->id,
                $this->product_id,
                $this->quantity,
                $this->quantity,
                null, // System change
                'system',
                'status_change',
                [
                    'new_status' => 'sold',
                    'last_customer_id' => $this->last_customer_id
                ]
            );
        }
    }
}
