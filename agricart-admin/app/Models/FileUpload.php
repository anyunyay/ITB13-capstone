<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FileUpload extends Model
{
    protected $fillable = [
        'path',
        'type',
        'original_name',
        'mime_type',
        'size',
        'owner_id',
        'uploaded_by',
    ];

    protected $casts = [
        'size' => 'integer',
    ];

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function getUrlAttribute(): string
    {
        if ($this->type === 'product-image') {
            return asset('storage/' . $this->path);
        }
        
        return route('private.file.serve', [
            'type' => $this->type,
            'filename' => basename($this->path)
        ]);
    }
}
