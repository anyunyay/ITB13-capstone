<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SalesAudit extends Model
{
    use HasFactory;

    protected $table = 'sales_audit';

    protected $fillable = [
        'customer_id',
        'total_amount',
        'subtotal',
        'coop_share',
        'member_share',
        'status',
        'delivery_status',
        'address_id',
        'admin_id',
        'admin_notes',
        'logistic_id',
        'is_urgent',
    ];

    protected $casts = [
        'total_amount' => 'float',
        'subtotal' => 'float',
        'coop_share' => 'float',
        'member_share' => 'float',
        'is_urgent' => 'boolean',
    ];

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id')->where('type', 'customer');
    }

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id')->where('type', 'admin');
    }

    public function logistic()
    {
        return $this->belongsTo(User::class, 'logistic_id')->where('type', 'logistic');
    }

    public function auditTrail()
    {
        return $this->hasMany(AuditTrail::class, 'sale_id'); 
    }

    public function address()
    {
        return $this->belongsTo(UserAddress::class, 'address_id');
    }

    public function sales()
    {
        return $this->hasMany(Sales::class, 'sales_audit_id');
    }

    // Scopes for filtering by status
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    // Scopes for filtering by delivery status
    public function scopePendingDelivery($query)
    {
        return $query->where('delivery_status', 'pending');
    }

    public function scopeOutForDelivery($query)
    {
        return $query->where('delivery_status', 'out_for_delivery');
    }

    public function scopeDelivered($query)
    {
        return $query->where('delivery_status', 'delivered');
    }

    /**
     * Get aggregated audit trail data grouped by product and category
     * This combines quantities from different stock sources (members) for the same items
     * Uses stored prices from audit trails instead of current product prices
     */
    public function getAggregatedAuditTrail()
    {
        $auditTrail = $this->auditTrail()->with('product')->get();
        
        // Group by product_id and category, then sum quantities
        $aggregated = $auditTrail->groupBy(function ($item) {
            return $item->product_id . '-' . $item->category;
        })->map(function ($items) {
            $firstItem = $items->first();
            return [
                'id' => $firstItem->id, // Use the first item's ID as representative
                'product' => [
                    'id' => $firstItem->product->id,
                    'name' => $firstItem->product->name,
                    'price_kilo' => $firstItem->price_kilo ?? $firstItem->product->price_kilo,
                    'price_pc' => $firstItem->price_pc ?? $firstItem->product->price_pc,
                    'price_tali' => $firstItem->price_tali ?? $firstItem->product->price_tali,
                ],
                'category' => $firstItem->category,
                'quantity' => $items->sum('quantity'),
                'unit_price' => $firstItem->getSalePrice(),
                'total_amount' => $items->sum(function($item) {
                    return $item->getTotalAmount();
                }),
            ];
        })->values();

        return $aggregated;
    }

    /**
     * Calculate the co-op share (10% of subtotal, added on top)
     */
    public function calculateCoopShare(): float
    {
        $subtotal = $this->subtotal ?? 0;
        return $subtotal * 0.10;
    }

    /**
     * Get the member share (100% of subtotal - full product revenue)
     */
    public function getMemberShare(): float
    {
        return $this->member_share ?? ($this->subtotal ?? 0);
    }

    /**
     * Get the subtotal (product prices before co-op share)
     */
    public function getSubtotal(): float
    {
        return $this->subtotal ?? 0;
    }

    /**
     * Update all financial fields based on subtotal
     */
    public function updateShares(): void
    {
        $subtotal = $this->subtotal ?? 0;
        $this->coop_share = $subtotal * 0.10;
        $this->member_share = $subtotal; // Members get 100% of product revenue
        $this->total_amount = $subtotal + $this->coop_share; // Customer pays subtotal + co-op share
        $this->save();
    }

}
