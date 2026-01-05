<?php

/**
 * Script to fix product image paths in the database
 * Changes from: products/filename.ext
 * To: filename.ext
 */

require_once __DIR__ . '/../vendor/autoload.php';

use Illuminate\Support\Facades\DB;

// Bootstrap Laravel
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "Starting product image path migration...\n";

try {
    // Get all products with image paths that contain 'products/'
    $products = DB::table('products')
        ->whereNotNull('image')
        ->where('image', 'like', 'products/%')
        ->get();

    $updated = 0;

    foreach ($products as $product) {
        // Extract just the filename from the path
        $filename = basename($product->image);
        
        // Update the database record
        DB::table('products')
            ->where('id', $product->id)
            ->update(['image' => $filename]);
        
        echo "Updated product ID {$product->id}: '{$product->image}' -> '{$filename}'\n";
        $updated++;
    }

    echo "\nMigration completed successfully!\n";
    echo "Updated {$updated} product image paths.\n";

} catch (Exception $e) {
    echo "Error during migration: " . $e->getMessage() . "\n";
    exit(1);
}