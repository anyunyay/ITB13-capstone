<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\HasFileUploads;

class DeliveryProof extends Model
{
    use HasFactory, HasFileUploads;

    protected $fillable = [
        'sales_id',
        'logistic_id',
        'proof_image',
        'notes',
        'uploaded_at',
    ];

    protected $casts = [
        'uploaded_at' => 'datetime',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = ['proof_image_url'];

    /**
     * Get the file fields that should be cleaned up
     */
    protected function getFileFields(): array
    {
        return ['proof_image'];
    }

    /**
     * Relationship to sales order
     */
    public function sales()
    {
        return $this->belongsTo(Sales::class);
    }

    /**
     * Relationship to logistic user
     */
    public function logistic()
    {
        return $this->belongsTo(User::class, 'logistic_id')->where('type', 'logistic');
    }

    /**
     * Get the proof image URL with proper path handling
     */
    public function getProofImageUrlAttribute()
    {
        if (!$this->proof_image) {
            return null;
        }

        // If it's already a full URL, return as is
        if (filter_var($this->proof_image, FILTER_VALIDATE_URL)) {
            return $this->proof_image;
        }

        // Ensure path starts with /
        if (!str_starts_with($this->proof_image, '/')) {
            return '/' . $this->proof_image;
        }

        return $this->proof_image;
    }

    /**
     * Delete the delivery proof image file
     */
    public function deleteProofImageFile(): bool
    {
        return $this->deleteFile('proof_image');
    }
}