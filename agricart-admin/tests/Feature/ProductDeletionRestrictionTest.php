<?php

use App\Models\User;
use App\Models\Product;
use App\Models\Stock;
use App\Models\Sales;
use App\Models\AuditTrail;
use App\Models\Cart;
use App\Models\CartItem;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    // Create permissions
    Permission::create(['name' => 'delete products']);
    
    // Create admin role and assign permissions
    $adminRole = Role::create(['name' => 'admin']);
    $adminRole->givePermissionTo('delete products');
    
    // Create admin user
    $this->admin = User::factory()->create([
        'type' => 'admin',
    ]);
    $this->admin->assignRole($adminRole);
    
    // Create a test product
    $this->product = Product::factory()->create([
        'name' => 'Test Product',
        'price_kilo' => 100.00,
    ]);
});

test('product cannot be deleted when it has available stock', function () {
    // Create stock with available quantity
    Stock::factory()->create([
        'product_id' => $this->product->id,
        'quantity' => 10,
        'removed_at' => null,
    ]);

    $response = $this->actingAs($this->admin)
        ->delete(route('inventory.destroy', $this->product));

    $response->assertRedirect(route('inventory.index'));
    $response->assertSessionHas('flash');
    $flash = session('flash');
    expect($flash['type'])->toBe('error');
    expect($flash['message'])->toContain('Cannot delete product');
    $this->assertDatabaseHas('products', ['id' => $this->product->id]);
});

test('product cannot be deleted when it has sales data', function () {
    // Create a customer
    $customer = User::factory()->create(['type' => 'customer']);
    
    // Create a sale
    $sale = Sales::factory()->create([
        'customer_id' => $customer->id,
        'status' => 'approved',
    ]);
    
    // Create audit trail linking product to sale
    AuditTrail::factory()->create([
        'sale_id' => $sale->id,
        'product_id' => $this->product->id,
        'stock_id' => Stock::factory()->create(['product_id' => $this->product->id])->id,
        'quantity' => 5,
    ]);

    $response = $this->actingAs($this->admin)
        ->delete(route('inventory.destroy', $this->product));

    $response->assertRedirect(route('inventory.index'));
    $response->assertSessionHas('flash');
    $flash = session('flash');
    expect($flash['type'])->toBe('error');
    expect($flash['message'])->toContain('Cannot delete product');
    $this->assertDatabaseHas('products', ['id' => $this->product->id]);
});

test('product cannot be deleted when it has cart items', function () {
    // Create a customer
    $customer = User::factory()->create(['type' => 'customer']);
    
    // Create a cart
    $cart = Cart::factory()->create(['user_id' => $customer->id]);
    
    // Create cart item
    CartItem::factory()->create([
        'cart_id' => $cart->id,
        'product_id' => $this->product->id,
        'quantity' => 2,
    ]);

    $response = $this->actingAs($this->admin)
        ->delete(route('inventory.destroy', $this->product));

    $response->assertRedirect(route('inventory.index'));
    $response->assertSessionHas('flash');
    $flash = session('flash');
    expect($flash['type'])->toBe('error');
    expect($flash['message'])->toContain('Cannot delete product');
    $this->assertDatabaseHas('products', ['id' => $this->product->id]);
});

test('product can be deleted when all conditions are met', function () {
    // Create stock with zero quantity (out of stock)
    Stock::factory()->create([
        'product_id' => $this->product->id,
        'quantity' => 0,
        'removed_at' => null,
    ]);

    $response = $this->actingAs($this->admin)
        ->delete(route('inventory.destroy', $this->product));

    $response->assertRedirect(route('inventory.index'));
    $response->assertSessionHas('flash');
    $flash = session('flash');
    expect($flash['type'])->toBe('success');
    expect($flash['message'])->toBe('Inventory item deleted successfully');
    $this->assertDatabaseMissing('products', ['id' => $this->product->id]);
});

test('archived product cannot be force deleted when it has sales data', function () {
    // Archive the product
    $this->product->update(['archived_at' => now()]);
    
    // Create a customer
    $customer = User::factory()->create(['type' => 'customer']);
    
    // Create a sale
    $sale = Sales::factory()->create([
        'customer_id' => $customer->id,
        'status' => 'approved',
    ]);
    
    // Create audit trail linking product to sale
    AuditTrail::factory()->create([
        'sale_id' => $sale->id,
        'product_id' => $this->product->id,
        'stock_id' => Stock::factory()->create(['product_id' => $this->product->id])->id,
        'quantity' => 5,
    ]);

    $response = $this->actingAs($this->admin)
        ->delete(route('inventory.archived.forceDelete', $this->product));

    $response->assertRedirect(route('inventory.archived.index'));
    $response->assertSessionHas('flash');
    $flash = session('flash');
    expect($flash['type'])->toBe('error');
    expect($flash['message'])->toContain('Cannot permanently delete product');
    $this->assertDatabaseHas('products', ['id' => $this->product->id]);
});

test('product model methods work correctly', function () {
    // Test hasAvailableStock method
    Stock::factory()->create([
        'product_id' => $this->product->id,
        'quantity' => 5,
        'removed_at' => null,
    ]);
    
    expect($this->product->hasAvailableStock())->toBeTrue();
    expect($this->product->canBeDeleted())->toBeFalse();
    
    // Test hasSalesData method
    $customer = User::factory()->create(['type' => 'customer']);
    $sale = Sales::factory()->create(['customer_id' => $customer->id]);
    AuditTrail::factory()->create([
        'sale_id' => $sale->id,
        'product_id' => $this->product->id,
        'stock_id' => Stock::factory()->create(['product_id' => $this->product->id])->id,
        'quantity' => 1,
    ]);
    
    expect($this->product->hasSalesData())->toBeTrue();
    expect($this->product->canBeDeleted())->toBeFalse();
    
    // Test hasCartItems method
    $cart = Cart::factory()->create(['user_id' => $customer->id]);
    CartItem::factory()->create([
        'cart_id' => $cart->id,
        'product_id' => $this->product->id,
        'quantity' => 1,
    ]);
    
    expect($this->product->hasCartItems())->toBeTrue();
    expect($this->product->canBeDeleted())->toBeFalse();
    
    // Test getDeletionRestrictionReason method
    $reason = $this->product->getDeletionRestrictionReason();
    expect($reason)->toContain('available stock');
});
