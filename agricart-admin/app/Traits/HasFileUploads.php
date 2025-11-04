<?php

namespace App\Traits;

use App\Services\FileUploadService;

trait HasFileUploads
{
    /**
     * Boot the trait
     */
    public static function bootHasFileUploads()
    {
        // Clean up files when model is deleted
        static::deleting(function ($model) {
            $model->cleanupFiles();
        });
    }

    /**
     * Clean up all files associated with this model
     */
    public function cleanupFiles(): void
    {
        $fileService = app(FileUploadService::class);
        
        foreach ($this->getFileFields() as $field => $category) {
            if ($this->$field) {
                // Handle both array format ['field' => 'category'] and simple array ['field']
                if (is_string($field) && is_string($category)) {
                    $fieldName = $field;
                    $fileCategory = $category;
                } else {
                    $fieldName = $category; // In case of simple array format
                    $fileCategory = $this->getFileCategoryForField($fieldName);
                }
                
                $this->deleteFileForField($fieldName, $fileCategory);
            }
        }
    }

    /**
     * Get the file fields that should be cleaned up
     * Override this method in your model to specify which fields contain file paths
     */
    protected function getFileFields(): array
    {
        return [];
    }

    /**
     * Upload a file for a specific field
     */
    public function uploadFile(string $field, $file, string $category, ?string $customName = null): ?string
    {
        $fileService = app(FileUploadService::class);
        
        if (!$file) {
            return null;
        }

        return $fileService->uploadFile($file, $category, $customName);
    }

    /**
     * Update a file for a specific field
     */
    public function updateFile(string $field, $newFile, string $category, ?string $customName = null): ?string
    {
        $fileService = app(FileUploadService::class);
        
        if (!$newFile) {
            return $this->$field;
        }

        $oldFile = $this->$field;
        $newPath = $fileService->updateFile($newFile, $category, $oldFile, $customName);
        
        return $newPath;
    }

    /**
     * Delete a file for a specific field
     */
    public function deleteFile(string $field, ?string $category = null): bool
    {
        if (!$category) {
            $category = $this->getFileCategoryForField($field);
        }
        
        return $this->deleteFileForField($field, $category);
    }

    /**
     * Delete a file for a specific field with category
     */
    protected function deleteFileForField(string $field, string $category): bool
    {
        $fileService = app(FileUploadService::class);
        
        if (!$this->$field) {
            return false;
        }

        // Handle different path formats for backward compatibility
        $filePath = $this->normalizeFilePath($this->$field, $category);
        
        $result = $fileService->deleteFile($filePath, $category);
        
        if ($result) {
            $this->$field = null;
            $this->saveQuietly(); // Use saveQuietly to avoid triggering events during cleanup
        }
        
        return $result;
    }

    /**
     * Normalize file path for deletion
     */
    protected function normalizeFilePath(string $filePath, string $category): string
    {
        // If it's just a filename, add the category folder
        if (!str_contains($filePath, '/')) {
            return $this->getCategoryFolder($category) . '/' . $filePath;
        }
        
        // If it already contains the category folder, use as is
        return $filePath;
    }

    /**
     * Get category folder for file path normalization
     */
    protected function getCategoryFolder(string $category): string
    {
        return match($category) {
            'products' => 'products',
            'documents', 'avatars' => 'documents',
            'delivery-proofs' => 'delivery-proofs',
            default => $category
        };
    }

    /**
     * Get file category for a specific field (override in models)
     */
    protected function getFileCategoryForField(string $field): string
    {
        // Default implementation - models should override this
        return match($field) {
            'image' => 'products',
            'avatar' => 'avatars',
            'document' => 'documents',
            'delivery_proof_image' => 'delivery-proofs',
            default => 'documents'
        };
    }

    /**
     * Get the URL for a file field
     */
    public function getFileUrl(string $field): ?string
    {
        $fileService = app(FileUploadService::class);
        return $fileService->getFileUrl($this->$field);
    }
}