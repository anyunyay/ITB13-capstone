<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\HasFileUploads;

class Product extends Model
{
    use HasFactory, HasFileUploads;

    protected $fillable = [
        'name',
        'price_kilo',
        'price_pc',
        'price_tali',
        'description',
        'image',
        'produce_type',
        'archived_at',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = ['image_url'];

    protected $casts = [
        'price_kilo' => 'decimal:2',
        'price_pc' => 'decimal:2',
        'price_tali' => 'decimal:2',
        'archived_at' => 'datetime',
    ];

    public function stocks()
    {
        return $this->hasMany(Stock::class);
    }

    public function removedStocks()
    {
        return $this->hasMany(Stock::class)->removed();
    }

    public function auditTrails()
    {
        return $this->hasMany(AuditTrail::class);
    }

    public function priceHistories()
    {
        return $this->hasMany(ProductPriceHistory::class);
    }

    public function cartItems()
    {
        return $this->hasMany(CartItem::class);
    }

    public function scopeArchived($query)
    {
        return $query->whereNotNull('archived_at');
    }

    public function scopeActive($query)
    {
        return $query->whereNull('archived_at');
    }

    /**
     * Check if the product has any available stock (quantity > 0)
     */
    public function hasAvailableStock()
    {
        return $this->stocks()
            ->where('quantity', '>', 0)
            ->whereNull('removed_at')
            ->exists();
    }

    /**
     * Check if the product has any related sales data
     */
    public function hasSalesData()
    {
        return $this->auditTrails()->exists();
    }

    /**
     * Check if the product has any cart items
     */
    public function hasCartItems()
    {
        return $this->cartItems()->exists();
    }

    /**
     * Check if the product can be deleted
     * Product can only be deleted when:
     * 1. It has no available stock (all stocks are out of stock or removed)
     * 2. It has no sales data (no audit trails)
     * 3. It has no cart items
     */
    public function canBeDeleted()
    {
        return !$this->hasAvailableStock() && 
               !$this->hasSalesData() && 
               !$this->hasCartItems();
    }

    /**
     * Get the reason why the product cannot be deleted
     */
    public function getDeletionRestrictionReason()
    {
        if ($this->hasAvailableStock()) {
            return 'Product has available stock that cannot be deleted.';
        }
        
        if ($this->hasSalesData()) {
            return 'Product has sales history and cannot be deleted.';
        }
        
        if ($this->hasCartItems()) {
            return 'Product has items in customer carts and cannot be deleted.';
        }
        
        return null;
    }

    /**
     * Get the image URL with proper path handling
     */
    public function getImageUrlAttribute()
    {
        if (!$this->image) {
            return null;
        }

        // If it's already a full URL, return as is
        if (filter_var($this->image, FILTER_VALIDATE_URL)) {
            return $this->image;
        }

        // Ensure path starts with /
        if (!str_starts_with($this->image, '/')) {
            return '/' . $this->image;
        }

        return $this->image;
    }

    /**
     * Get the file fields that should be cleaned up
     */
    protected function getFileFields(): array
    {
        return ['image'];
    }

    /**
     * Delete the product image file
     */
    public function deleteImageFile(): bool
    {
        return $this->deleteFile('image');
    }
}
