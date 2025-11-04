# File Management System Implementation

## Overview
A comprehensive file management system with role-based access controls for handling product images, documents, and delivery proofs.

## Storage Structure
```
storage/
├── app/
│   ├── public/
│   │   └── product-images/     # Public product images
│   └── private/
│       ├── documents/          # Admin-only documents
│       └── delivery-proofs/    # Logistics delivery proofs
└── public/                     # Symlinked to storage/app/public
```

## Database Schema

### file_uploads Table
```sql
CREATE TABLE file_uploads (
    id BIGINT PRIMARY KEY,
    path VARCHAR(255),
    type ENUM('product-image', 'document', 'delivery-proof'),
    original_name VARCHAR(255),
    mime_type VARCHAR(255),
    size INTEGER,
    owner_id BIGINT NULL,
    uploaded_by BIGINT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id),
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);
```

### users Table Addition
```sql
ALTER TABLE users ADD COLUMN can_view_delivery_proofs BOOLEAN DEFAULT FALSE;
```

## Controllers

### ProductImageController
Handles public product images accessible to all users.

**Routes:**
- `POST /product-images/upload` - Upload product image
- `DELETE /product-images/{id}` - Delete product image

**Features:**
- Image validation (JPEG, PNG, JPG, GIF, WEBP)
- 5MB file size limit
- UUID-based filenames
- Public URL generation

### PrivateFileController
Handles private documents and delivery proofs with role-based access.

**Routes:**
- `POST /private/documents/upload` - Upload document (Admin only)
- `POST /private/delivery-proofs/upload` - Upload delivery proof (Logistics only)
- `GET /private/file/{type}/{filename}` - Serve private file (Role-based)
- `GET /private/files/{type}` - List files (Role-based)
- `DELETE /private/files/{id}` - Delete file (Role-based)

**Features:**
- Role-based upload restrictions
- Secure file serving with streaming
- Path traversal protection
- Ownership validation
- MIME type validation

## Access Control Matrix

| File Type | Upload | View | Delete |
|-----------|--------|------|--------|
| Product Images | Admin/Staff | Everyone (public) | Admin/Staff |
| Documents | Admin | Admin Only | Admin |
| Delivery Proofs | Logistics | Logistics (own) + Admin + Staff (with permission) | Logistics (own) + Admin |

## Security Features

### 1. Path Traversal Protection
```php
if (str_contains($filename, '..') || str_contains($filename, '/') || str_contains($filename, '\\')) {
    abort(404);
}
```

### 2. Role-Based Access Control
```php
private function authorizeFileAccess(User $user, FileUpload $fileUpload)
{
    switch ($fileUpload->type) {
        case 'document':
            if ($user->type !== 'admin') {
                abort(403, 'Unauthorized to view documents');
            }
            break;
        // ... other cases
    }
}
```

### 3. File Ownership Validation
```php
if ($user->type === 'logistic' && $fileUpload->owner_id === $user->id) {
    return; // Allow access to own files
}
```

### 4. Secure File Streaming
```php
$stream = Storage::disk('private')->readStream($filePath);
return new StreamedResponse(function () use ($stream) {
    fpassthru($stream);
    fclose($stream);
}, 200, [
    'Content-Type' => $fileUpload->mime_type,
    'Content-Disposition' => 'inline; filename="' . $fileUpload->original_name . '"',
    'Cache-Control' => 'no-cache, must-revalidate',
]);
```

## Usage Examples

### 1. Upload Product Image
```javascript
const formData = new FormData();
formData.append('image', file);

fetch('/product-images/upload', {
    method: 'POST',
    body: formData,
    headers: {
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
    }
})
.then(response => response.json())
.then(data => {
    if (data.success) {
        console.log('Image uploaded:', data.data.url);
    }
});
```

### 2. Upload Document (Admin Only)
```javascript
const formData = new FormData();
formData.append('document', file);

fetch('/private/documents/upload', {
    method: 'POST',
    body: formData,
    headers: {
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
    }
})
.then(response => response.json())
.then(data => {
    if (data.success) {
        console.log('Document uploaded:', data.data.url);
    }
});
```

### 3. Upload Delivery Proof (Logistics Only)
```javascript
const formData = new FormData();
formData.append('proof', file);

fetch('/private/delivery-proofs/upload', {
    method: 'POST',
    body: formData,
    headers: {
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
    }
})
.then(response => response.json())
.then(data => {
    if (data.success) {
        console.log('Delivery proof uploaded:', data.data.url);
    }
});
```

### 4. List Files with Access Control
```javascript
fetch('/private/files/delivery-proof')
.then(response => response.json())
.then(data => {
    if (data.success) {
        data.data.data.forEach(file => {
            console.log('File:', file.original_name, 'URL:', file.url);
        });
    }
});
```

## File Validation Rules

### Product Images
- **Types:** JPEG, PNG, JPG, GIF, WEBP
- **Max Size:** 5MB
- **Validation:** `image|mimes:jpeg,png,jpg,gif,webp|max:5120`

### Documents
- **Types:** PDF, DOC, DOCX, JPG, JPEG, PNG
- **Max Size:** 10MB
- **Validation:** `file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240`

### Delivery Proofs
- **Types:** PDF, JPG, JPEG, PNG
- **Max Size:** 5MB
- **Validation:** `file|mimes:pdf,jpg,jpeg,png|max:5120`

## Model Relationships

### FileUpload Model
```php
class FileUpload extends Model
{
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
```

## Configuration

### Filesystem Disks
```php
'disks' => [
    'public' => [
        'driver' => 'local',
        'root' => storage_path('app/public'),
        'url' => env('APP_URL').'/storage',
        'visibility' => 'public',
    ],
    
    'private' => [
        'driver' => 'local',
        'root' => storage_path('app/private'),
        'visibility' => 'private',
    ],
],
```

## Testing Scenarios

### 1. Admin Access Tests
- ✅ Admin can upload documents
- ✅ Admin can view all delivery proofs
- ✅ Admin can delete any file
- ❌ Non-admin cannot upload documents

### 2. Logistics Access Tests
- ✅ Logistics can upload delivery proofs
- ✅ Logistics can view their own delivery proofs
- ❌ Logistics cannot view other logistics' proofs
- ❌ Logistics cannot view documents

### 3. Staff Access Tests
- ✅ Staff with permission can view delivery proofs
- ❌ Staff without permission cannot view delivery proofs
- ❌ Staff cannot upload documents or delivery proofs

### 4. Security Tests
- ❌ Path traversal attempts (../) are blocked
- ❌ Direct file access to private files is prevented
- ✅ File ownership is validated
- ✅ MIME types are validated

## Maintenance

### File Cleanup
Consider implementing automatic cleanup for:
- Orphaned files (no database record)
- Files from deleted users
- Temporary upload failures

### Monitoring
Track:
- File upload success/failure rates
- Storage usage by type
- Access patterns for security auditing

## Future Enhancements

1. **File Versioning:** Track file versions and changes
2. **Bulk Operations:** Upload/delete multiple files
3. **File Compression:** Automatic image optimization
4. **Cloud Storage:** S3 integration for scalability
5. **File Sharing:** Temporary access links
6. **Audit Logging:** Detailed file access logs