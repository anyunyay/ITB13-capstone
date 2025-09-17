<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PriceTrend extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_name',
        'date',
        'price_per_kg',
        'price_per_tali',
        'unit_type',
    ];

    protected $casts = [
        'date' => 'date',
        'price_per_kg' => 'decimal:2',
        'price_per_tali' => 'decimal:2',
    ];

    /**
     * Scope to filter by product name
     */
    public function scopeByProduct($query, $productName)
    {
        return $query->where('product_name', $productName);
    }

    /**
     * Scope to filter by date range
     */
    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }

    /**
     * Scope to filter by unit type
     */
    public function scopeByUnitType($query, $unitType)
    {
        return $query->where('unit_type', $unitType);
    }

    /**
     * Get the price based on unit type
     */
    public function getPriceAttribute()
    {
        return $this->unit_type === 'kg' ? $this->price_per_kg : $this->price_per_tali;
    }
}
