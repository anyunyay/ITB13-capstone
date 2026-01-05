<?php

use App\Models\Product;
use App\Models\PriceTrend;
use App\Models\User;
use Database\Seeders\RoleSeeder;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

test('price trend records are created when product prices change', function () {
    $admin = User::factory()->admin()->create();
    $admin->assignRole('admin');
    
    // Create a product with initial prices
    $product = Product::create([
        'name' => 'Test Product',
        'price_kilo' => 150.00,
        'price_pc' => 25.00,
        'price_tali' => 50.00,
        'description' => 'Test description',
        'produce_type' => 'fruit',
        'image' => 'test-image.jpg',
    ]);

    // Update the product prices
    $response = $this->actingAs($admin)->put("/admin/inventory/{$product->id}", [
        'name' => 'Test Product',
        'price_kilo' => 180.00,
        'price_pc' => 30.00,
        'price_tali' => 60.00,
        'description' => 'Test description',
        'produce_type' => 'fruit',
        '_method' => 'PUT',
    ]);

    $response->assertRedirect('/admin/inventory');
    
    // Check that price trend records were created
    $priceTrends = PriceTrend::where('product_name', 'Test Product')
        ->whereDate('date', now()->toDateString())
        ->get();

    expect($priceTrends)->toHaveCount(3); // One for each price type

    // Check kilo price trend
    $kiloTrend = $priceTrends->where('unit_type', 'kg')->first();
    expect($kiloTrend)->not->toBeNull();
    expect($kiloTrend->price_per_kg)->toBe('180.00');
    expect($kiloTrend->price_per_tali)->toBeNull();
    expect($kiloTrend->price_per_pc)->toBeNull();

    // Check tali price trend
    $taliTrend = $priceTrends->where('unit_type', 'tali')->first();
    expect($taliTrend)->not->toBeNull();
    expect($taliTrend->price_per_tali)->toBe('60.00');
    expect($taliTrend->price_per_kg)->toBeNull();
    expect($taliTrend->price_per_pc)->toBeNull();

    // Check pc price trend
    $pcTrend = $priceTrends->where('unit_type', 'pc')->first();
    expect($pcTrend)->not->toBeNull();
    expect($pcTrend->price_per_pc)->toBe('30.00');
    expect($pcTrend->price_per_kg)->toBeNull();
    expect($pcTrend->price_per_tali)->toBeNull();
});

test('same-day price reversion deletes price trend records', function () {
    $admin = User::factory()->admin()->create();
    $admin->assignRole('admin');
    
    // Create a product with initial prices
    $product = Product::create([
        'name' => 'Test Product',
        'price_kilo' => 150.00,
        'price_pc' => 25.00,
        'price_tali' => 50.00,
        'description' => 'Test description',
        'produce_type' => 'fruit',
        'image' => 'test-image.jpg',
    ]);

    // First update - change prices
    $this->actingAs($admin)->put("/admin/inventory/{$product->id}", [
        'name' => 'Test Product',
        'price_kilo' => 180.00,
        'price_pc' => 30.00,
        'price_tali' => 60.00,
        'description' => 'Test description',
        'produce_type' => 'fruit',
        '_method' => 'PUT',
    ]);

    // Verify price trend records were created
    $priceTrends = PriceTrend::where('product_name', 'Test Product')
        ->whereDate('date', now()->toDateString())
        ->get();
    expect($priceTrends)->toHaveCount(3);

    // Second update - revert to original prices on same day
    $this->actingAs($admin)->put("/admin/inventory/{$product->id}", [
        'name' => 'Test Product',
        'price_kilo' => 150.00,
        'price_pc' => 25.00,
        'price_tali' => 50.00,
        'description' => 'Test description',
        'produce_type' => 'fruit',
        '_method' => 'PUT',
    ]);

    // Verify price trend records were deleted
    $priceTrends = PriceTrend::where('product_name', 'Test Product')
        ->whereDate('date', now()->toDateString())
        ->get();
    expect($priceTrends)->toHaveCount(0);
});

test('price trend records are updated when prices change again on same day', function () {
    $admin = User::factory()->admin()->create();
    $admin->assignRole('admin');
    
    // Create a product with initial prices
    $product = Product::create([
        'name' => 'Test Product',
        'price_kilo' => 150.00,
        'price_pc' => 25.00,
        'price_tali' => 50.00,
        'description' => 'Test description',
        'produce_type' => 'fruit',
        'image' => 'test-image.jpg',
    ]);

    // First update - change prices
    $this->actingAs($admin)->put("/admin/inventory/{$product->id}", [
        'name' => 'Test Product',
        'price_kilo' => 180.00,
        'price_pc' => 30.00,
        'price_tali' => 60.00,
        'description' => 'Test description',
        'produce_type' => 'fruit',
        '_method' => 'PUT',
    ]);

    // Second update - change prices again on same day
    $this->actingAs($admin)->put("/admin/inventory/{$product->id}", [
        'name' => 'Test Product',
        'price_kilo' => 200.00,
        'price_pc' => 35.00,
        'price_tali' => 70.00,
        'description' => 'Test description',
        'produce_type' => 'fruit',
        '_method' => 'PUT',
    ]);

    // Verify price trend records were updated (not duplicated)
    $priceTrends = PriceTrend::where('product_name', 'Test Product')
        ->whereDate('date', now()->toDateString())
        ->get();
    expect($priceTrends)->toHaveCount(3);

    // Check that prices were updated to the latest values
    $kiloTrend = $priceTrends->where('unit_type', 'kg')->first();
    expect($kiloTrend->price_per_kg)->toBe('200.00');

    $taliTrend = $priceTrends->where('unit_type', 'tali')->first();
    expect($taliTrend->price_per_tali)->toBe('70.00');

    $pcTrend = $priceTrends->where('unit_type', 'pc')->first();
    expect($pcTrend->price_per_pc)->toBe('35.00');
});

test('price trend records are created for partial price updates', function () {
    $admin = User::factory()->admin()->create();
    $admin->assignRole('admin');
    
    // Create a product with initial prices
    $product = Product::create([
        'name' => 'Test Product',
        'price_kilo' => 150.00,
        'price_pc' => 25.00,
        'price_tali' => 50.00,
        'description' => 'Test description',
        'produce_type' => 'fruit',
        'image' => 'test-image.jpg',
    ]);

    // Update only kilo price
    $this->actingAs($admin)->put("/admin/inventory/{$product->id}", [
        'name' => 'Test Product',
        'price_kilo' => 180.00,
        'price_pc' => 25.00, // Same as original
        'price_tali' => 50.00, // Same as original
        'description' => 'Test description',
        'produce_type' => 'fruit',
        '_method' => 'PUT',
    ]);

    // Verify only kilo price trend was created
    $priceTrends = PriceTrend::where('product_name', 'Test Product')
        ->whereDate('date', now()->toDateString())
        ->get();
    expect($priceTrends)->toHaveCount(1);

    $kiloTrend = $priceTrends->first();
    expect($kiloTrend->unit_type)->toBe('kg');
    expect($kiloTrend->price_per_kg)->toBe('180.00');
});

test('no price trend records are created when no prices change', function () {
    $admin = User::factory()->admin()->create();
    $admin->assignRole('admin');
    
    // Create a product with initial prices
    $product = Product::create([
        'name' => 'Test Product',
        'price_kilo' => 150.00,
        'price_pc' => 25.00,
        'price_tali' => 50.00,
        'description' => 'Test description',
        'produce_type' => 'fruit',
        'image' => 'test-image.jpg',
    ]);

    // Update only non-price fields
    $this->actingAs($admin)->put("/admin/inventory/{$product->id}", [
        'name' => 'Test Product',
        'price_kilo' => 150.00, // Same as original
        'price_pc' => 25.00, // Same as original
        'price_tali' => 50.00, // Same as original
        'description' => 'Updated description', // Only this changed
        'produce_type' => 'vegetable', // And this
        '_method' => 'PUT',
    ]);

    // Verify no price trend records were created
    $priceTrends = PriceTrend::where('product_name', 'Test Product')
        ->whereDate('date', now()->toDateString())
        ->get();
    expect($priceTrends)->toHaveCount(0);
});
