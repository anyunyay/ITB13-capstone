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
        
        foreach ($this->getFileFields() as $field) {
            if ($this->$field) {
                $fileService->deleteFile($this->$field);
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
    public function deleteFile(string $field): bool
    {
        $fileService = app(FileUploadService::class);
        
        if (!$this->$field) {
            return false;
        }

        $result = $fileService->deleteFile($this->$field);
        
        if ($result) {
            $this->$field = null;
            $this->save();
        }
        
        return $result;
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