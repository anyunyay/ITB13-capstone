<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use App\Models\Product;
use App\Models\SalesAudit;
use App\Models\User;

class CleanupOrphanedFiles extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'files:cleanup-orphaned 
                            {--dry-run : Show what would be deleted without actually deleting}
                            {--category= : Specific category to clean (products, documents, delivery-proofs)}';

    /**
     * The console command description.
     */
    protected $description = 'Clean up orphaned files that are no longer referenced in the database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $dryRun = $this->option('dry-run');
        $category = $this->option('category');
        
        $this->info('Starting orphaned file cleanup...');
        
        if ($dryRun) {
            $this->warn('DRY RUN MODE - No files will actually be deleted');
        }

        $totalDeleted = 0;
        $totalSize = 0;

        if (!$category || $category === 'products') {
            [$deleted, $size] = $this->cleanupProductImages($dryRun);
            $totalDeleted += $deleted;
            $totalSize += $size;
        }

        if (!$category || $category === 'delivery-proofs') {
            [$deleted, $size] = $this->cleanupDeliveryProofs($dryRun);
            $totalDeleted += $deleted;
            $totalSize += $size;
        }

        if (!$category || $category === 'documents') {
            [$deleted, $size] = $this->cleanupDocuments($dryRun);
            $totalDeleted += $deleted;
            $totalSize += $size;
        }

        $this->info("Cleanup completed!");
        $this->info("Files processed: {$totalDeleted}");
        $this->info("Space freed: " . $this->formatBytes($totalSize));
    }

    /**
     * Clean up orphaned product images
     */
    private function cleanupProductImages(bool $dryRun): array
    {
        $this->info('Checking product images...');
        
        $disk = Storage::disk('public');
        $files = $disk->files('products');
        
        // Get all product image filenames from database
        $usedImages = Product::whereNotNull('image')
            ->pluck('image')
            ->map(function ($image) {
                // Handle both formats: 'filename.ext' and 'products/filename.ext'
                return basename($image);
            })
            ->unique()
            ->toArray();

        $deleted = 0;
        $totalSize = 0;

        foreach ($files as $file) {
            $filename = basename($file);
            
            // Skip if file is referenced in database
            if (in_array($filename, $usedImages)) {
                continue;
            }

            // Skip fallback image
            if ($filename === 'fallback-photo.png') {
                continue;
            }

            $size = $disk->size($file);
            $totalSize += $size;

            if ($dryRun) {
                $this->line("Would delete: {$file} (" . $this->formatBytes($size) . ")");
            } else {
                if ($disk->delete($file)) {
                    $this->line("Deleted: {$file} (" . $this->formatBytes($size) . ")");
                    $deleted++;
                } else {
                    $this->error("Failed to delete: {$file}");
                }
            }
        }

        return [$deleted, $totalSize];
    }

    /**
     * Clean up orphaned delivery proof images
     */
    private function cleanupDeliveryProofs(bool $dryRun): array
    {
        $this->info('Checking delivery proof images...');
        
        $disk = Storage::disk('private');
        $files = $disk->files('delivery-proofs');
        
        // Get all delivery proof filenames from database
        $usedProofs = SalesAudit::whereNotNull('delivery_proof_image')
            ->pluck('delivery_proof_image')
            ->map(function ($image) {
                return basename($image);
            })
            ->unique()
            ->toArray();

        $deleted = 0;
        $totalSize = 0;

        foreach ($files as $file) {
            $filename = basename($file);
            
            // Skip if file is referenced in database
            if (in_array($filename, $usedProofs)) {
                continue;
            }

            $size = $disk->size($file);
            $totalSize += $size;

            if ($dryRun) {
                $this->line("Would delete: {$file} (" . $this->formatBytes($size) . ")");
            } else {
                if ($disk->delete($file)) {
                    $this->line("Deleted: {$file} (" . $this->formatBytes($size) . ")");
                    $deleted++;
                } else {
                    $this->error("Failed to delete: {$file}");
                }
            }
        }

        return [$deleted, $totalSize];
    }

    /**
     * Clean up orphaned document files
     */
    private function cleanupDocuments(bool $dryRun): array
    {
        $this->info('Checking document files...');
        
        $disk = Storage::disk('private');
        $files = $disk->files('documents');
        
        // Get all document filenames from database (users, etc.)
        $usedDocuments = collect();
        
        // Add user avatars if you have them
        $userAvatars = User::whereNotNull('avatar')
            ->pluck('avatar')
            ->map(function ($avatar) {
                return basename($avatar);
            });
        $usedDocuments = $usedDocuments->merge($userAvatars);

        // Add member documents
        $memberDocuments = User::where('type', 'member')
            ->whereNotNull('document')
            ->pluck('document')
            ->map(function ($document) {
                return basename($document);
            });
        $usedDocuments = $usedDocuments->merge($memberDocuments);

        $usedDocuments = $usedDocuments->unique()->toArray();

        $deleted = 0;
        $totalSize = 0;

        foreach ($files as $file) {
            $filename = basename($file);
            
            // Skip if file is referenced in database
            if (in_array($filename, $usedDocuments)) {
                continue;
            }

            $size = $disk->size($file);
            $totalSize += $size;

            if ($dryRun) {
                $this->line("Would delete: {$file} (" . $this->formatBytes($size) . ")");
            } else {
                if ($disk->delete($file)) {
                    $this->line("Deleted: {$file} (" . $this->formatBytes($size) . ")");
                    $deleted++;
                } else {
                    $this->error("Failed to delete: {$file}");
                }
            }
        }

        return [$deleted, $totalSize];
    }

    /**
     * Format bytes to human readable format
     */
    private function formatBytes(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        
        $bytes /= (1 << (10 * $pow));
        
        return round($bytes, 2) . ' ' . $units[$pow];
    }
}