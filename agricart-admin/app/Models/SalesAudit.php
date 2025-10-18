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
        'delivery_proof_image',
        'delivery_confirmed',
        'delivery_ready_time',
        'delivery_packed_time',
        'delivered_time',
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
        'delivery_confirmed' => 'boolean',
        'delivery_ready_time' => 'datetime',
        'delivery_packed_time' => 'datetime',
        'delivered_time' => 'datetime',
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

    public function scopeReadyToPickup($query)
    {
        return $query->where('delivery_status', 'ready_to_pickup');
    }

    // Scopes for filtering by ready for pickup status
    public function scopeReadyForPickup($query)
    {
        return $query->where('ready_for_pickup', true);
    }

    public function scopeNotReadyForPickup($query)
    {
        return $query->where('ready_for_pickup', false);
    }

    // Scopes for filtering by picked up status
    public function scopePickedUp($query)
    {
        return $query->where('picked_up', true);
    }

    public function scopeNotPickedUp($query)
    {
        return $query->where('picked_up', false);
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

    /**
     * Update delivery status with automatic timestamp setting
     */
    public function updateDeliveryStatus(string $status): void
    {
        $oldStatus = $this->delivery_status;
        
        $this->delivery_status = $status;
        
        // Set timestamps based on status changes
        if ($status === 'ready_to_pickup' && $oldStatus === 'pending') {
            $this->delivery_ready_time = now();
        } elseif ($status === 'out_for_delivery' && $oldStatus === 'ready_to_pickup') {
            $this->delivery_packed_time = now();
        } elseif ($status === 'delivered' && $oldStatus !== 'delivered') {
            $this->delivered_time = now();
        }
        
        $this->save();
    }

    /**
     * Mark order as ready for pickup
     */
    public function markAsReady(): void
    {
        $this->updateDeliveryStatus('ready_to_pickup');
    }

    /**
     * Mark order as packed (out for delivery)
     */
    public function markAsPacked(): void
    {
        $this->updateDeliveryStatus('out_for_delivery');
    }

    /**
     * Mark order as delivered
     */
    public function markAsDelivered(): void
    {
        $this->updateDeliveryStatus('delivered');
    }

    /**
     * Get delivery timeline information
     */
    public function getDeliveryTimeline(): array
    {
        return [
            'ready_at' => $this->delivery_ready_time?->toISOString(),
            'packed_at' => $this->delivery_packed_time?->toISOString(),
            'delivered_at' => $this->delivered_time?->toISOString(),
            'ready_duration' => $this->delivery_ready_time ? 
                $this->created_at->diffInMinutes($this->delivery_ready_time) : null,
            'packing_duration' => $this->delivery_ready_time && $this->delivery_packed_time ? 
                $this->delivery_ready_time->diffInMinutes($this->delivery_packed_time) : null,
            'delivery_duration' => $this->delivery_packed_time && $this->delivered_time ? 
                $this->delivery_packed_time->diffInMinutes($this->delivered_time) : null,
            'total_duration' => $this->delivered_time ? 
                $this->created_at->diffInMinutes($this->delivered_time) : null,
        ];
    }

}
