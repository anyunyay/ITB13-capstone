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
        'delivery_address',
        'admin_id',
        'admin_notes',
        'logistic_id',
        'sales_audit_id',
        'delivered_at',
    ];

    protected $casts = [
        'total_amount' => 'float',
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
}
