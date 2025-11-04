<?php

require_once __DIR__ . '/../vendor/autoload.php';

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

// Bootstrap Laravel
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "Starting file migration from public to private storage...\n";

// Move documents from public/documents to private/documents
$publicDocumentsPath = storage_path('app/public/documents');
$privateDocumentsPath = storage_path('app/private/documents');

if (is_dir($publicDocumentsPath)) {
    $files = scandir($publicDocumentsPath);
    foreach ($files as $file) {
        if ($file !== '.' && $file !== '..' && is_file($publicDocumentsPath . '/' . $file)) {
            $sourcePath = $publicDocumentsPath . '/' . $file;
            $destPath = $privateDocumentsPath . '/' . $file;
            
            if (copy($sourcePath, $destPath)) {
                echo "Moved document: $file\n";
                
                // Update database record if exists
                DB::table('file_uploads')
                    ->where('path', 'documents/' . $file)
                    ->update(['path' => 'documents/' . $file]);
                
                // Remove original file
                unlink($sourcePath);
            } else {
                echo "Failed to move document: $file\n";
            }
        }
    }
}

// Move product images from product-images to products folder
$oldProductImagesPath = storage_path('app/public/product-images');
$newProductsPath = storage_path('app/public/products');

if (is_dir($oldProductImagesPath)) {
    $files = scandir($oldProductImagesPath);
    foreach ($files as $file) {
        if ($file !== '.' && $file !== '..' && is_file($oldProductImagesPath . '/' . $file)) {
            $sourcePath = $oldProductImagesPath . '/' . $file;
            $destPath = $newProductsPath . '/' . $file;
            
            if (copy($sourcePath, $destPath)) {
                echo "Moved product image: $file\n";
                
                // Update database record
                DB::table('file_uploads')
                    ->where('path', 'product-images/' . $file)
                    ->update(['path' => 'products/' . $file]);
                
                // Remove original file
                unlink($sourcePath);
            } else {
                echo "Failed to move product image: $file\n";
            }
        }
    }
}

echo "File migration completed!\n";