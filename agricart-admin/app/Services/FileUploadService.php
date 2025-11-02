<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class FileUploadService
{
    /**
     * Allowed file types for each category
     */
    private const ALLOWED_TYPES = [
        'products' => ['jpeg', 'jpg', 'png', 'gif', 'svg', 'webp'],
        'documents' => ['jpeg', 'jpg', 'png', 'pdf', 'doc', 'docx'],
        'delivery-proofs' => ['jpeg', 'jpg', 'png', 'pdf'],
        'avatars' => ['jpeg', 'jpg', 'png', 'gif', 'svg', 'webp'],
    ];

    /**
     * Maximum file sizes in KB for each category
     */
    private const MAX_SIZES = [
        'products' => 2048, // 2MB
        'documents' => 5120, // 5MB
        'delivery-proofs' => 3072, // 3MB
        'avatars' => 1024, // 1MB
    ];

    /**
     * Storage paths for each category (relative to public directory)
     */
    private const STORAGE_PATHS = [
        'products' => 'storage/products',
        'documents' => 'storage/documents',
        'delivery-proofs' => 'storage/delivery-proofs',
        'avatars' => 'storage/documents', // Avatars stored in documents folder
    ];

    /**
     * Upload a file to the specified category
     *
     * @param UploadedFile $file
     * @param string $category
     * @param string|null $customName
     * @return string|null The relative path to the uploaded file
     * @throws \InvalidArgumentException
     */
    public function uploadFile(UploadedFile $file, string $category, ?string $customName = null): ?string
    {
        $this->validateCategory($category);
        $this->validateFile($file, $category);

        $fileName = $this->generateFileName($file, $customName);
        $relativePath = self::STORAGE_PATHS[$category];
        $absolutePath = public_path($relativePath);
        
        // Ensure directory exists
        if (!File::exists($absolutePath)) {
            File::makeDirectory($absolutePath, 0755, true);
        }

        // Move file to storage
        $file->move($absolutePath, $fileName);

        // Return relative path from public directory
        return $relativePath . '/' . $fileName;
    }

    /**
     * Delete a file from storage
     *
     * @param string|null $filePath
     * @return bool
     */
    public function deleteFile(?string $filePath): bool
    {
        if (!$filePath) {
            return false;
        }

        $fullPath = public_path($filePath);
        
        if (File::exists($fullPath)) {
            return File::delete($fullPath);
        }

        return false;
    }

    /**
     * Update a file (delete old, upload new)
     *
     * @param UploadedFile $newFile
     * @param string $category
     * @param string|null $oldFilePath
     * @param string|null $customName
     * @return string|null
     */
    public function updateFile(UploadedFile $newFile, string $category, ?string $oldFilePath = null, ?string $customName = null): ?string
    {
        // Upload new file first
        $newFilePath = $this->uploadFile($newFile, $category, $customName);

        // Delete old file if upload was successful and old file exists
        if ($newFilePath && $oldFilePath) {
            $this->deleteFile($oldFilePath);
        }

        return $newFilePath;
    }

    /**
     * Get the full URL for a file
     *
     * @param string|null $filePath
     * @return string|null
     */
    public function getFileUrl(?string $filePath): ?string
    {
        if (!$filePath) {
            return null;
        }

        // If it's already a full URL, return as is
        if (filter_var($filePath, FILTER_VALIDATE_URL)) {
            return $filePath;
        }

        // Ensure path starts with /
        if (!str_starts_with($filePath, '/')) {
            $filePath = '/' . $filePath;
        }

        return $filePath;
    }

    /**
     * Validate file category
     *
     * @param string $category
     * @throws \InvalidArgumentException
     */
    private function validateCategory(string $category): void
    {
        if (!array_key_exists($category, self::ALLOWED_TYPES)) {
            throw new \InvalidArgumentException("Invalid file category: {$category}");
        }
    }

    /**
     * Validate uploaded file
     *
     * @param UploadedFile $file
     * @param string $category
     * @throws \InvalidArgumentException
     */
    private function validateFile(UploadedFile $file, string $category): void
    {
        // Check if file is valid
        if (!$file->isValid()) {
            throw new \InvalidArgumentException('Invalid file upload');
        }

        // Check file extension
        $extension = strtolower($file->getClientOriginalExtension());
        if (!in_array($extension, self::ALLOWED_TYPES[$category])) {
            $allowedTypes = implode(', ', self::ALLOWED_TYPES[$category]);
            throw new \InvalidArgumentException("File type not allowed. Allowed types: {$allowedTypes}");
        }

        // Check file size
        $fileSizeKB = $file->getSize() / 1024;
        if ($fileSizeKB > self::MAX_SIZES[$category]) {
            $maxSizeMB = self::MAX_SIZES[$category] / 1024;
            throw new \InvalidArgumentException("File size exceeds maximum allowed size of {$maxSizeMB}MB");
        }
    }

    /**
     * Generate a unique file name
     *
     * @param UploadedFile $file
     * @param string|null $customName
     * @return string
     */
    private function generateFileName(UploadedFile $file, ?string $customName = null): string
    {
        $extension = $file->getClientOriginalExtension();
        
        if ($customName) {
            return Str::slug($customName) . '_' . time() . '.' . $extension;
        }

        return time() . '_' . Str::random(10) . '.' . $extension;
    }

    /**
     * Get validation rules for a file category
     *
     * @param string $category
     * @param bool $required
     * @return array
     */
    public static function getValidationRules(string $category, bool $required = true): array
    {
        if (!array_key_exists($category, self::ALLOWED_TYPES)) {
            throw new \InvalidArgumentException("Invalid file category: {$category}");
        }

        $rules = [];
        
        if ($required) {
            $rules[] = 'required';
        } else {
            $rules[] = 'nullable';
        }

        $rules[] = 'file';
        $rules[] = 'mimes:' . implode(',', self::ALLOWED_TYPES[$category]);
        $rules[] = 'max:' . self::MAX_SIZES[$category];

        return $rules;
    }

    /**
     * Migrate existing files to new structure
     *
     * @param string $oldPath
     * @param string $category
     * @return string|null New file path
     */
    public function migrateFile(string $oldPath, string $category): ?string
    {
        $this->validateCategory($category);
        
        $fullOldPath = public_path($oldPath);
        
        if (!File::exists($fullOldPath)) {
            return null;
        }

        $fileName = basename($oldPath);
        $relativePath = self::STORAGE_PATHS[$category];
        $absolutePath = public_path($relativePath);
        
        // Ensure directory exists
        if (!File::exists($absolutePath)) {
            File::makeDirectory($absolutePath, 0755, true);
        }

        $newFullPath = $absolutePath . '/' . $fileName;
        
        // Copy file to new location
        if (File::copy($fullOldPath, $newFullPath)) {
            // Return relative path from public directory
            return $relativePath . '/' . $fileName;
        }

        return null;
    }
}