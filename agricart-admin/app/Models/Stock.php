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
        'category',
        'status',
        'customer_id'
    ];

    protected $with = ['product', 'member', 'customer'];
    
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function member()
    {
        return $this->belongsTo(User::class, 'member_id')->where('type', 'member');
    }

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id')->where('type', 'customer');
    }

    /**
     * Scope for stocks that have been partially sold (quantity reduced but not empty)
     * and have been approved by admin (customer_id is set)
     */
    public function scopePartial($query)
    {
        return $query->where('quantity', '>', 0)
                    ->whereNotNull('customer_id');
    }

    /**
     * Scope for stocks that have been completely sold (quantity = 0)
     * and have been approved by admin (customer_id is set)
     */
    public function scopeSold($query)
    {
        return $query->where('quantity', 0)
                    ->whereNotNull('customer_id');
    }

    /**
     * Scope for stocks that are available for purchase
     * (have quantity and not assigned to any customer)
     */
    public function scopeAvailable($query)
    {
        return $query->where('quantity', '>', 0)
                    ->whereNull('customer_id');
    }

    /**
     * Set status to partial when approved by admin and quantity is not 0
     * This method should be called when an order is approved
     */
    public function setPartialStatus()
    {
        if ($this->quantity > 0 && !is_null($this->customer_id)) {
            $this->status = 'partial';
            $this->save();
        }
    }

    /**
     * Set status to sold when quantity reaches 0
     * This method should be called when stock is completely sold
     */
    public function setSoldStatus()
    {
        if ($this->quantity == 0 && !is_null($this->customer_id)) {
            $this->status = 'sold';
            $this->save();
        }
    }
}
