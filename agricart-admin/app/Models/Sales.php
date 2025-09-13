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
        'operational_expense',
        'member_earnings',
        'status',
        'delivery_status',
        'admin_id',
        'admin_notes',
        'logistic_id',
    ];

    protected $casts = [
        'total_amount' => 'float',
        'operational_expense' => 'float',
        'member_earnings' => 'float',
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

    public function memberEarnings()
    {
        return $this->hasMany(MemberEarning::class, 'sale_id');
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
}
