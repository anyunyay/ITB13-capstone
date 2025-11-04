<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Services\FileUploadService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Foundation\Testing\RefreshDatabase;

class FileUploadServiceTest extends TestCase
{
    use RefreshDatabase;

    protected FileUploadService $fileService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->fileService = new FileUploadService();
    }

    protected function tearDown(): void
    {
        // Clean up test files from both public and private storage
        Storage::disk('public')->deleteDirectory('products');
        Storage::disk('private')->deleteDirectory('documents');
        Storage::disk('private')->deleteDirectory('delivery-proofs');

        parent::tearDown();
    }

    /** @test */
    public function it_can_get_validation_rules_for_valid_categories()
    {
        $rules = FileUploadService::getValidationRules('products', true);
        
        $this->assertIsArray($rules);
        $this->assertContains('required', $rules);
        $this->assertContains('file', $rules);
    }

    /** @test */
    public function it_throws_exception_for_invalid_category()
    {
        $this->expectException(\InvalidArgumentException::class);
        FileUploadService::getValidationRules('invalid_category', true);
    }

    /** @test */
    public function it_can_upload_file_to_products_category()
    {
        $file = UploadedFile::fake()->image('test-product.jpg', 100, 100);
        
        $filePath = $this->fileService->uploadFile($file, 'products', 'test-product');
        
        $this->assertNotNull($filePath);
        $this->assertStringStartsWith('products/', $filePath);
        $this->assertTrue(Storage::disk('public')->exists($filePath));
    }

    /** @test */
    public function it_can_upload_file_to_documents_category()
    {
        $file = UploadedFile::fake()->create('test-document.pdf', 100);
        
        $filePath = $this->fileService->uploadFile($file, 'documents', 'test-document');
        
        $this->assertNotNull($filePath);
        $this->assertStringStartsWith('documents/', $filePath);
        $this->assertTrue(Storage::disk('private')->exists($filePath));
    }

    /** @test */
    public function it_can_delete_uploaded_file()
    {
        $file = UploadedFile::fake()->image('test-delete.jpg', 100, 100);
        $filePath = $this->fileService->uploadFile($file, 'products');
        
        $this->assertTrue(Storage::disk('public')->exists($filePath));
        
        $deleted = $this->fileService->deleteFile($filePath, 'products');
        
        $this->assertTrue($deleted);
        $this->assertFalse(Storage::disk('public')->exists($filePath));
    }

    /** @test */
    public function it_can_update_file()
    {
        // Upload initial file
        $oldFile = UploadedFile::fake()->image('old-file.jpg', 100, 100);
        $oldPath = $this->fileService->uploadFile($oldFile, 'products');
        
        $this->assertTrue(Storage::disk('public')->exists($oldPath));
        
        // Update with new file
        $newFile = UploadedFile::fake()->image('new-file.jpg', 100, 100);
        $newPath = $this->fileService->updateFile($newFile, 'products', $oldPath);
        
        $this->assertNotNull($newPath);
        $this->assertNotEquals($oldPath, $newPath);
        $this->assertFalse(Storage::disk('public')->exists($oldPath)); // Old file should be deleted
        $this->assertTrue(Storage::disk('public')->exists($newPath)); // New file should exist
    }

    /** @test */
    public function it_generates_proper_file_urls()
    {
        $filePath = 'products/test-image.jpg';
        $url = $this->fileService->getFileUrl($filePath, 'products');
        
        $this->assertStringContainsString('/storage/', $url);
    }

    /** @test */
    public function it_handles_null_file_paths_gracefully()
    {
        $url = $this->fileService->getFileUrl(null, 'products');
        $this->assertNull($url);
        
        $deleted = $this->fileService->deleteFile(null, 'products');
        $this->assertFalse($deleted);
    }

    /** @test */
    public function it_validates_file_extensions()
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('File type not allowed');
        
        $file = UploadedFile::fake()->create('test.txt', 100); // .txt not allowed for products
        $this->fileService->uploadFile($file, 'products');
    }

    /** @test */
    public function it_validates_file_sizes()
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('File size exceeds maximum');
        
        // Create a file larger than the 2MB limit for products (2048KB)
        $file = UploadedFile::fake()->create('large-file.jpg', 3000); // 3MB
        $this->fileService->uploadFile($file, 'products');
    }

    /** @test */
    public function it_stores_files_in_correct_storage_disks()
    {
        // Test product image goes to public storage
        $productFile = UploadedFile::fake()->image('product.jpg', 100, 100);
        $productPath = $this->fileService->uploadFile($productFile, 'products');
        $this->assertTrue(Storage::disk('public')->exists($productPath));
        
        // Test document goes to private storage
        $documentFile = UploadedFile::fake()->create('document.pdf', 100);
        $documentPath = $this->fileService->uploadFile($documentFile, 'documents');
        $this->assertTrue(Storage::disk('private')->exists($documentPath));
        
        // Test delivery proof goes to private storage
        $proofFile = UploadedFile::fake()->image('proof.jpg', 100, 100);
        $proofPath = $this->fileService->uploadFile($proofFile, 'delivery-proofs');
        $this->assertTrue(Storage::disk('private')->exists($proofPath));
    }
}