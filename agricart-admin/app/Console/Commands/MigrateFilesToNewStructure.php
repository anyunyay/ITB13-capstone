<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Product;
use App\Models\User;
use App\Services\FileUploadService;
use Illuminate\Support\Facades\DB;

class MigrateFilesToNewStructure extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'files:migrate-structure {--dry-run : Show what would be migrated without actually doing it}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Migrate existing files to the new storage structure (public/storage/*)';

    /**
     * Execute the console command.
     */
    public function handle(FileUploadService $fileService)
    {
        $dryRun = $this->option('dry-run');
        
        if ($dryRun) {
            $this->info('DRY RUN MODE - No files will be moved');
        }

        $this->info('Starting file migration to new structure...');

        // Migrate product images
        $this->migrateProductImages($fileService, $dryRun);

        // Migrate user documents
        $this->migrateUserDocuments($fileService, $dryRun);

        // Migrate user avatars
        $this->migrateUserAvatars($fileService, $dryRun);

        $this->info('File migration completed!');
    }

    /**
     * Migrate product images
     */
    private function migrateProductImages(FileUploadService $fileService, bool $dryRun)
    {
        $this->info('Migrating product images...');
        
        $products = Product::whereNotNull('image')
            ->where('image', '!=', '')
            ->get();

        $migrated = 0;
        $skipped = 0;

        foreach ($products as $product) {
            // Skip if already in new structure
            if (str_starts_with($product->image, 'storage/products/')) {
                $skipped++;
                continue;
            }

            $this->line("Processing product: {$product->name} (ID: {$product->id})");
            $this->line("  Current image path: {$product->image}");

            if (!$dryRun) {
                try {
                    $newPath = $fileService->migrateFile($product->image, 'products');
                    
                    if ($newPath) {
                        $product->update(['image' => $newPath]);
                        $this->line("  ✓ Migrated to: {$newPath}");
                        $migrated++;
                    } else {
                        $this->error("  ✗ Failed to migrate: File not found or migration failed");
                        $skipped++;
                    }
                } catch (\Exception $e) {
                    $this->error("  ✗ Error migrating: " . $e->getMessage());
                    $skipped++;
                }
            } else {
                $this->line("  → Would migrate to: storage/products/");
                $migrated++;
            }
        }

        $this->info("Product images: {$migrated} migrated, {$skipped} skipped");
    }

    /**
     * Migrate user documents
     */
    private function migrateUserDocuments(FileUploadService $fileService, bool $dryRun)
    {
        $this->info('Migrating user documents...');
        
        $users = User::whereNotNull('document')
            ->where('document', '!=', '')
            ->get();

        $migrated = 0;
        $skipped = 0;

        foreach ($users as $user) {
            // Skip if already in new structure
            if (str_starts_with($user->document, 'storage/documents/')) {
                $skipped++;
                continue;
            }

            $this->line("Processing user: {$user->name} (ID: {$user->id})");
            $this->line("  Current document path: {$user->document}");

            if (!$dryRun) {
                try {
                    $newPath = $fileService->migrateFile($user->document, 'documents');
                    
                    if ($newPath) {
                        $user->update(['document' => $newPath]);
                        $this->line("  ✓ Migrated to: {$newPath}");
                        $migrated++;
                    } else {
                        $this->error("  ✗ Failed to migrate: File not found or migration failed");
                        $skipped++;
                    }
                } catch (\Exception $e) {
                    $this->error("  ✗ Error migrating: " . $e->getMessage());
                    $skipped++;
                }
            } else {
                $this->line("  → Would migrate to: storage/documents/");
                $migrated++;
            }
        }

        $this->info("User documents: {$migrated} migrated, {$skipped} skipped");
    }

    /**
     * Migrate user avatars
     */
    private function migrateUserAvatars(FileUploadService $fileService, bool $dryRun)
    {
        $this->info('Migrating user avatars...');
        
        $users = User::whereNotNull('avatar')
            ->where('avatar', '!=', '')
            ->get();

        $migrated = 0;
        $skipped = 0;

        foreach ($users as $user) {
            // Skip if already in new structure or is a URL
            if (str_starts_with($user->avatar, 'storage/documents/') || 
                filter_var($user->avatar, FILTER_VALIDATE_URL)) {
                $skipped++;
                continue;
            }

            $this->line("Processing user avatar: {$user->name} (ID: {$user->id})");
            $this->line("  Current avatar path: {$user->avatar}");

            if (!$dryRun) {
                try {
                    $newPath = $fileService->migrateFile($user->avatar, 'avatars');
                    
                    if ($newPath) {
                        $user->update(['avatar' => $newPath]);
                        $this->line("  ✓ Migrated to: {$newPath}");
                        $migrated++;
                    } else {
                        $this->error("  ✗ Failed to migrate: File not found or migration failed");
                        $skipped++;
                    }
                } catch (\Exception $e) {
                    $this->error("  ✗ Error migrating: " . $e->getMessage());
                    $skipped++;
                }
            } else {
                $this->line("  → Would migrate to: storage/documents/");
                $migrated++;
            }
        }

        $this->info("User avatars: {$migrated} migrated, {$skipped} skipped");
    }
}