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
        'is_suspicious',
        'suspicious_reason',
        'linked_merged_order_id',
    ];

    protected $casts = [
        'total_amount' => 'float',
        'subtotal' => 'float',
        'coop_share' => 'float',
        'member_share' => 'float',
        'is_urgent' => 'boolean',
        'is_suspicious' => 'boolean',
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

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class, 'order_id');
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
        $auditTrail = $this->auditTrail()->with(['product', 'stock', 'product.stocks' => function($query) {
            $query->whereNull('removed_at');
        }])->get();
        
        // Group by product_id and category, then sum quantities
        $aggregated = $auditTrail->groupBy(function ($item) {
            return $item->product_id . '-' . $item->category;
        })->map(function ($items) {
            $firstItem = $items->first();
            $product = $firstItem->product;
            
            // Calculate available stock for this product and category
            // For pending/delayed orders: check the specific stock assigned to this order
            $orderStatus = $this->status;
            $currentOrderQuantity = $items->sum('quantity');
            
            if ($orderStatus === 'pending' || $orderStatus === 'delayed') {
                // For pending orders, check the specific stock that was assigned
                $assignedStocks = $items->pluck('stock')->filter();
                
                if ($assignedStocks->isNotEmpty()) {
                    // Get unique stocks (in case same stock appears multiple times)
                    $uniqueStocks = $assignedStocks->unique('id');
                    
                    // Calculate available stock from assigned stocks
                    // For each stock, the available quantity is: quantity (since pending_order_qty already includes this order)
                    $availableStock = $uniqueStocks->sum(function($stock) {
                        if (!$stock) return 0;
                        // Stock quantity is what's available
                        // pending_order_qty includes THIS order's quantity
                        // So the stock can fulfill this order if quantity >= order_quantity
                        return $stock->quantity;
                    });
                } else {
                    // Fallback: sum all stocks for this product/category
                    // This handles orders created before stock_id was tracked
                    $availableStock = $product->stocks
                        ->where('category', $firstItem->category)
                        ->whereNull('removed_at')
                        ->sum('quantity');
                }
            } else {
                // For approved/other orders, sum all available stocks
                $availableStock = $product->stocks
                    ->where('category', $firstItem->category)
                    ->whereNull('removed_at')
                    ->sum('quantity');
            }
            
            // Get unit price - try stored prices first, then fallback to product prices
            $unitPrice = $firstItem->getSalePrice();
            if ($unitPrice == 0) {
                // Fallback to product prices based on category
                switch ($firstItem->category) {
                    case 'Kilo':
                        $unitPrice = $product->price_kilo ?? 0;
                        break;
                    case 'Pc':
                        $unitPrice = $product->price_pc ?? 0;
                        break;
                    case 'Tali':
                        $unitPrice = $product->price_tali ?? 0;
                        break;
                    default:
                        $unitPrice = $product->price_kilo ?? $product->price_pc ?? $product->price_tali ?? 0;
                        break;
                }
            }
            
            $quantity = $items->sum('quantity');
            
            // For pending orders, calculate stock preview
            $stockPreview = null;
            if ($this->status === 'pending') {
                $remainingStock = max(0, $availableStock - $quantity);
                $stockPreview = [
                    'current_stock' => $availableStock,
                    'quantity_to_deduct' => $quantity,
                    'remaining_stock' => $remainingStock,
                    'sufficient_stock' => $availableStock >= $quantity
                ];
            }
            $subtotal = $quantity * $unitPrice;
            $coopShare = $subtotal * 0.10; // 10% co-op share
            
            return [
                'id' => $firstItem->id, // Use the first item's ID as representative
                'product' => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'price_kilo' => $firstItem->price_kilo ?? $product->price_kilo,
                    'price_pc' => $firstItem->price_pc ?? $product->price_pc,
                    'price_tali' => $firstItem->price_tali ?? $product->price_tali,
                ],
                'category' => $firstItem->category,
                'quantity' => $quantity,
                'unit_price' => $unitPrice,
                'subtotal' => $subtotal,
                'coop_share' => $coopShare,
                'available_stock' => $availableStock,
                'total_amount' => $subtotal + $coopShare, // Subtotal + co-op share
                'stock_preview' => $stockPreview, // Only present for pending orders
            ];
        })->values();

        return $aggregated;
    }

    /**
     * Check if the order has sufficient stock for approval
     */
    public function hasSufficientStock(): bool
    {
        $aggregatedItems = $this->getAggregatedAuditTrail();
        
        foreach ($aggregatedItems as $item) {
            if ($item['stock_preview'] && !$item['stock_preview']['sufficient_stock']) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * Get items with insufficient stock
     */
    public function getInsufficientStockItems(): array
    {
        $aggregatedItems = $this->getAggregatedAuditTrail();
        $insufficientItems = [];
        
        foreach ($aggregatedItems as $item) {
            if ($item['stock_preview'] && !$item['stock_preview']['sufficient_stock']) {
                $insufficientItems[] = [
                    'product_name' => $item['product']['name'],
                    'category' => $item['category'],
                    'requested_quantity' => $item['quantity'],
                    'available_stock' => $item['stock_preview']['current_stock'],
                    'shortage' => $item['quantity'] - $item['stock_preview']['current_stock']
                ];
            }
        }
        
        return $insufficientItems;
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
        ];
    }

}
