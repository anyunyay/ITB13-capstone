<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class MemberEarning extends Model
{
    use HasFactory;

    protected $fillable = [
        'member_id',
        'sale_id',
        'stock_id',
        'amount',
        'quantity',
        'category',
    ];

    protected $casts = [
        'amount' => 'float',
    ];

    public function member()
    {
        return $this->belongsTo(User::class, 'member_id')->where('type', 'member');
    }

    public function sale()
    {
        return $this->belongsTo(Sales::class, 'sale_id');
    }

    public function stock()
    {
        return $this->belongsTo(Stock::class, 'stock_id');
    }
}
