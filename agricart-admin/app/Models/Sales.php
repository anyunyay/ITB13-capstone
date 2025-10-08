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
