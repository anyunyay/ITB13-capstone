# File Management System Implementation

## Overview

This document outlines the comprehensive file management system implemented to ensure all uploaded images are properly organized in `public/storage` with dedicated folders for different file types.

## Directory Structure

```
public/storage/
├── documents/          # Member documents, user avatars
├── delivery-proofs/    # Delivery proof images
└── products/          # Product images
```

## Implementation Components

### 1. FileUploadService (`app/Services/FileUploadService.php`)

A centralized service that handles all file operations:

**Features:**
- **Category-based validation**: Different rules for each file type
- **Automatic directory creation**: Creates folders if they don't exist
- **File size limits**: Configurable per category
- **Secure file naming**: Prevents conflicts and security issues
- **File migration**: Moves existing files to new structure
- **Cleanup operations**: Removes files when no longer needed

**Supported Categories:**
- `products`: Product images (JPEG, PNG, GIF, SVG, WebP - max 2MB)
- `documents`: Member documents, avatars (JPEG, PNG, PDF, DOC, DOCX - max 5MB)
- `delivery-proofs`: Delivery proof images (JPEG, PNG, PDF - max 3MB)
- `avatars`: User avatars (stored in documents folder - max 1MB)

### 2. HasFileUploads Trait (`app/Traits/HasFileUploads.php`)

A reusable trait for models that handle file uploads:

**Features:**
- **Automatic cleanup**: Deletes files when model is deleted
- **Consistent API**: Standardized methods across models
- **File operations**: Upload, update, delete files
- **URL generation**: Proper file URL handling

### 3. Updated Models

#### Product Model (`app/Models/Product.php`)
- Uses `HasFileUploads` trait
- Handles product image files
- Automatic cleanup on deletion
- Proper URL generation

#### User Model (`app/Models/User.php`)
- Uses `HasFileUploads` trait
- Handles avatar and document files
- Separate methods for each file type
- Document URL accessor added

#### DeliveryProof Model (`app/Models/DeliveryProof.php`)
- New model for delivery proof management
- Handles delivery proof images
- Relationships to Sales and User models
- Automatic file cleanup

### 4. Updated Controllers

#### InventoryController (`app/Http/Controllers/Admin/InventoryController.php`)
- Uses FileUploadService for product images
- Proper validation using service rules
- Error handling for file operations
- Maintains existing functionality

#### MembershipController (`app/Http/Controllers/Admin/MembershipController.php`)
- Uses FileUploadService for member documents
- Handles document replacement workflow
- Proper validation and error handling

#### DeliveryProofController (`app/Http/Controllers/DeliveryProofController.php`)
- New controller for delivery proof management
- API endpoints for CRUD operations
- Permission-based access control
- File upload/update/delete operations

### 5. File Management API (`app/Http/Controllers/Api/FileManagementController.php`)

RESTful API for file operations:

**Endpoints:**
- `POST /api/files/upload` - Upload files
- `DELETE /api/files/delete` - Delete files
- `GET /api/files/info` - Get file information
- `GET /api/files/validation-rules` - Get validation rules for categories

### 6. Migration Command (`app/Console/Commands/MigrateFilesToNewStructure.php`)

Command to migrate existing files to the new structure:

```bash
# Dry run to see what would be migrated
php artisan files:migrate-structure --dry-run

# Actually migrate files
php artisan files:migrate-structure
```

### 7. Database Migration

New `delivery_proofs` table:
- Links to sales orders and logistic users
- Stores proof image path and notes
- Ensures one proof per sales order

## Path Structure Fix

**Issue Fixed**: The original implementation was creating nested `public/storage` directories instead of using the existing `public/storage` structure.

**Solution**: Updated the `FileUploadService` to:
- Use relative paths (`storage/products`) instead of absolute paths (`public/storage/products`)
- Convert to absolute paths using `public_path()` for file operations
- Return correct relative paths for database storage

**Result**: Files are now stored directly in:
- `public/storage/products/` (not `public/storage/public/storage/products/`)
- `public/storage/documents/`
- `public/storage/delivery-proofs/`

## Usage Examples

### Uploading Files in Controllers

```php
use App\Services\FileUploadService;

public function store(Request $request, FileUploadService $fileService)
{
    // Validate using service rules
    $request->validate([
        'image' => FileUploadService::getValidationRules('products', true)
    ]);

    // Upload file - returns path like 'storage/products/filename.jpg'
    $imagePath = $fileService->uploadFile(
        $request->file('image'),
        'products',
        'custom_name_prefix'
    );

    // Save to model
    $product = Product::create([
        'name' => $request->name,
        'image' => $imagePath // Stored as 'storage/products/filename.jpg'
    ]);
}
```

### Using the Trait in Models

```php
use App\Traits\HasFileUploads;

class Product extends Model
{
    use HasFileUploads;

    protected function getFileFields(): array
    {
        return ['image'];
    }

    public function deleteImageFile(): bool
    {
        return $this->deleteFile('image');
    }
}
```

### API Usage

```javascript
// Upload file via API
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('category', 'products');
formData.append('custom_name', 'my_product');

fetch('/api/files/upload', {
    method: 'POST',
    body: formData,
    headers: {
        'X-CSRF-TOKEN': csrfToken
    }
})
.then(response => response.json())
.then(data => {
    if (data.success) {
        console.log('File uploaded:', data.data.file_path);
    }
});
```

## CRUD Operations Verification

### Product Images
- **Create**: Files uploaded to `public/storage/products/`
- **Read**: URLs properly generated with `/storage/products/` prefix
- **Update**: Old files deleted, new files uploaded
- **Delete**: Files removed from filesystem when product deleted

### Member Documents
- **Create**: Files uploaded to `public/storage/documents/`
- **Read**: Document URLs accessible via `document_url` accessor
- **Update**: Supports replacement workflow with deletion marking
- **Delete**: Files cleaned up when member deleted

### Delivery Proofs
- **Create**: Files uploaded to `public/storage/delivery-proofs/`
- **Read**: Proof images accessible via API and relationships
- **Update**: Supports image replacement
- **Delete**: Files removed when proof deleted

### User Avatars
- **Create**: Files uploaded to `public/storage/documents/`
- **Read**: Avatar URLs properly generated
- **Update**: Old avatars replaced with new ones
- **Delete**: Files cleaned up when user deleted

## Security Features

1. **File Type Validation**: Only allowed extensions per category
2. **File Size Limits**: Configurable maximum sizes
3. **Secure Naming**: Prevents directory traversal and conflicts
4. **Permission Checks**: Role-based access to file operations
5. **Path Sanitization**: Ensures files stay in designated directories

## Error Handling

- Comprehensive exception handling in all file operations
- Graceful fallbacks for missing files
- Detailed error messages for debugging
- Rollback capabilities for failed operations

## Maintenance

### Regular Tasks
1. Monitor disk usage in storage directories
2. Clean up orphaned files (files not referenced in database)
3. Backup important files before major updates
4. Verify file permissions on storage directories

### Troubleshooting
1. Check directory permissions (755 recommended)
2. Verify file upload limits in PHP configuration
3. Monitor error logs for file operation failures
4. Use migration command to fix file structure issues

## Future Enhancements

1. **Image Optimization**: Automatic resizing and compression
2. **Cloud Storage**: Support for S3, Google Cloud, etc.
3. **File Versioning**: Keep history of file changes
4. **Bulk Operations**: Upload/delete multiple files at once
5. **File Metadata**: Store additional information about files