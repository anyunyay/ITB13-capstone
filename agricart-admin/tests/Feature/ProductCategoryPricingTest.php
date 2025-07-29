<?php

use App\Models\Product;
use App\Models\User;
use App\Models\Stock;
use App\Models\Sales;
use App\Models\AuditTrail;
use Database\Seeders\RoleSeeder;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

test('product can have category-specific prices', function () {
    $product = Product::create([
        'name' => 'Test Product',
        'price_kilo' => 150.00,
        'price_pc' => 25.00,
        'price_tali' => 50.00,
        'description' => 'Test description',
        'produce_type' => 'fruit',
        'image' => 'test-image.jpg',
    ]);

    expect($product->price_kilo)->toBe(150.00);
    expect($product->price_pc)->toBe(25.00);
    expect($product->price_tali)->toBe(50.00);
});

test('product can have partial category prices', function () {
    $product = Product::create([
        'name' => 'Test Product',
        'price_kilo' => 150.00,
        'price_pc' => null,
        'price_tali' => 50.00,
        'description' => 'Test description',
        'produce_type' => 'fruit',
        'image' => 'test-image.jpg',
    ]);

    expect($product->price_kilo)->toBe(150.00);
    expect($product->price_pc)->toBeNull();
    expect($product->price_tali)->toBe(50.00);
});

test('admin can create product with category prices', function () {
    $admin = User::factory()->admin()->create();
    $admin->assignRole('admin');

    $response = $this->actingAs($admin)->post('/admin/inventory', [
        'name' => 'New Product',
        'price_kilo' => 150.00,
        'price_pc' => 25.00,
        'price_tali' => 50.00,
        'description' => 'Test description',
        'produce_type' => 'fruit',
        'image' => \Illuminate\Http\UploadedFile::fake()->create('product.jpg', 100),
    ]);

    $response->assertRedirect('/admin/inventory');
    
    $product = Product::where('name', 'New Product')->first();
    expect($product)->not->toBeNull();
    expect($product->price_kilo)->toBe(150);
    expect($product->price_pc)->toBe(25);
    expect($product->price_tali)->toBe(50);
});

test('admin can update product category prices', function () {
    $admin = User::factory()->admin()->create();
    $admin->assignRole('admin');
    
    $product = Product::create([
        'name' => 'Test Product',
        'price_kilo' => 150.00,
        'price_pc' => 25.00,
        'price_tali' => 50.00,
        'description' => 'Test description',
        'produce_type' => 'fruit',
        'image' => 'test-image.jpg',
    ]);

    $response = $this->actingAs($admin)->put("/admin/inventory/{$product->id}", [
        'name' => 'Updated Product',
        'price_kilo' => 180.00,
        'price_pc' => 30.00,
        'price_tali' => 60.00,
        'description' => 'Updated description',
        'produce_type' => 'vegetable',
        '_method' => 'PUT',
    ]);

    $response->assertRedirect('/admin/inventory');
    
    $product->refresh();
    expect($product->price_kilo)->toBe(180);
    expect($product->price_pc)->toBe(30);
    expect($product->price_tali)->toBe(60);
}); 

test('seeder creates products without price field', function () {
    // Clear existing products
    Product::truncate();
    
    // Run the seeder
    $this->artisan('db:seed', ['--class' => 'ProductSeeder']);
    
    $product = Product::first();
    expect($product)->not->toBeNull();
    expect($product->getAttributes())->not->toHaveKey('price');
    expect($product->price_kilo)->not->toBeNull();
    expect($product->price_pc)->not->toBeNull();
    expect($product->price_tali)->not->toBeNull();
}); 

test('sales calculation uses category-specific prices', function () {
    $product = Product::create([
        'name' => 'Test Product',
        'price_kilo' => 150.00,
        'price_pc' => 25.00,
        'price_tali' => 50.00,
        'description' => 'Test description',
        'produce_type' => 'fruit',
        'image' => 'test-image.jpg',
    ]);

    $customer = User::factory()->customer()->create();
    $member = User::factory()->member()->create();
    
    // Create a stock for the product
    $stock = Stock::create([
        'product_id' => $product->id,
        'quantity' => 10.0,
        'member_id' => $member->id,
        'category' => 'Kilo',
    ]);

    // Create a sale
    $sale = Sales::create([
        'customer_id' => $customer->id,
        'total_amount' => 0,
        'status' => 'approved',
    ]);

    // Create audit trail for kilo category
    $auditTrail = AuditTrail::create([
        'sale_id' => $sale->id,
        'stock_id' => $stock->id,
        'product_id' => $product->id,
        'category' => 'Kilo',
        'quantity' => 2.0,
    ]);

    // Calculate expected revenue (2 kilos * 150.00 per kilo)
    $expectedRevenue = 2.0 * 150.00;
    
    // Test the calculation logic
    $price = 0;
    if ($auditTrail->category === 'Kilo' && $auditTrail->product->price_kilo) {
        $price = $auditTrail->product->price_kilo;
    } elseif ($auditTrail->category === 'Pc' && $auditTrail->product->price_pc) {
        $price = $auditTrail->product->price_pc;
    } elseif ($auditTrail->category === 'Tali' && $auditTrail->product->price_tali) {
        $price = $auditTrail->product->price_tali;
    }
    
    $actualRevenue = $auditTrail->quantity * $price;
    
    expect($actualRevenue)->toBe($expectedRevenue);
    expect($price)->toBe(150);
}); 