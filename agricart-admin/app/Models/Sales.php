<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sales extends Model
{
    protected $fillable = [
        'customer_id',
        'total_amount',
    ];

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id')->where('type', 'customer');
    }

    public function auditTrail()
    {
        return $this->hasMany(AuditTrail::class); 
    }
}
