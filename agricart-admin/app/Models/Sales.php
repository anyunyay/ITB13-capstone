<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Sales extends Model
{
    use HasFactory;

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
    ];

    protected $casts = [
        'total_amount' => 'float',
        'subtotal' => 'float',
        'coop_share' => 'float',
        'member_share' => 'float',
        'delivered_at' => 'datetime',
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
}
