<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\Sortable;

class Sales extends Model
{
    use HasFactory, Sortable;

    protected $fillable = [
        'customer_id',
        'total_amount',
        'subtotal',
        'coop_share',
        'member_share',
        'delivery_address',
        'admin_id',
        'admin_notes',
        'logistic_id',
        'sales_audit_id',
        'delivered_at',
        'customer_received',
        'customer_rate',
        'customer_feedback',
        'customer_confirmed_at',
    ];

    protected $casts = [
        'total_amount' => 'float',
        'subtotal' => 'float',
        'coop_share' => 'float',
        'member_share' => 'float',
        'delivered_at' => 'datetime',
        'customer_received' => 'boolean',
        'customer_confirmed_at' => 'datetime',
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

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class, 'order_id');
    }

    public function salesAudit()
    {
        return $this->belongsTo(SalesAudit::class, 'sales_audit_id');
    }

    // Scopes for filtering by delivery date
    public function scopeDeliveredToday($query)
    {
        return $query->whereDate('delivered_at', today());
    }

    public function scopeDeliveredThisWeek($query)
    {
        return $query->whereBetween('delivered_at', [now()->startOfWeek(), now()->endOfWeek()]);
    }

    public function scopeDeliveredThisMonth($query)
    {
        return $query->whereMonth('delivered_at', now()->month)
                    ->whereYear('delivered_at', now()->year);
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
     * Mark order as received by customer
     */
    public function markAsReceived(int $rating = null, string $feedback = null): void
    {
        $this->customer_received = true;
        $this->customer_confirmed_at = now();
        if ($rating !== null) {
            $this->customer_rate = $rating;
        }
        if ($feedback !== null) {
            $this->customer_feedback = $feedback;
        }
        $this->save();
    }

    /**
     * Check if order is eligible for auto-confirmation (3 days after delivery)
     */
    public function isEligibleForAutoConfirmation(): bool
    {
        if ($this->customer_received) {
            return false; // Already confirmed
        }
        
        if (!$this->delivered_at) {
            return false; // Not delivered yet
        }
        
        return $this->delivered_at->addDays(3)->isPast();
    }

    /**
     * Auto-confirm order if eligible
     */
    public function autoConfirmIfEligible(): bool
    {
        if ($this->isEligibleForAutoConfirmation()) {
            $this->markAsReceived();
            return true;
        }
        return false;
    }

    /**
     * Define sortable columns for Sales model.
     *
     * @return array
     */
    public function getSortableColumns(): array
    {
        return [
            'total_amount',
            'subtotal',
            'coop_share',
            'member_share',
            'delivered_at',
            'customer_received',
            'customer_rate',
            'customer_confirmed_at',
            'created_at',
            'updated_at'
        ];
    }

    /**
     * Define column data types for proper sorting.
     *
     * @return array
     */
    public function getColumnDataTypes(): array
    {
        return [
            'total_amount' => 'decimal',
            'subtotal' => 'decimal',
            'coop_share' => 'decimal',
            'member_share' => 'decimal',
            'delivered_at' => 'datetime',
            'customer_received' => 'string',
            'customer_rate' => 'integer',
            'customer_confirmed_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime'
        ];
    }

    /**
     * Get default sort configuration for Sales model.
     *
     * @return array
     */
    public function getDefaultSort(): array
    {
        return [
            'column' => 'created_at',
            'direction' => 'desc'
        ];
    }
}
