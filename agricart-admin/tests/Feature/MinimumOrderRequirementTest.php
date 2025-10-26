<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Product;
use App\Models\Stock;
use App\Models\Cart;
use App\Models\CartItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class MinimumOrderRequirementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create roles and permissions
        $admin = Role::create(['name' => 'admin']);
        $customer = Role::create(['name' => 'customer']);
        $member = Role::create(['name' => 'member']);
        $logistic = Role::create(['name' => 'logistic']);
        
        // Create permissions
        $permissions = [
            'view inventory', 'create products', 'edit products', 'delete products',
            'view archive', 'archive products', 'unarchive products', 'delete archived products',
            'view stocks', 'create stocks', 'edit stocks', 'delete stocks',
            'view orders', 'manage orders', 'delete orders',
            'view sold stock', 'view stock trail',
            'view logistics', 'create logistics', 'edit logistics', 'delete logistics',
            'view staffs', 'create staffs', 'edit staffs', 'delete staffs',
            'view membership', 'create members', 'edit members', 'delete members',
        ];
        
        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }
        
        // Assign all permissions to admin
        $admin->givePermissionTo(Permission::all());
    }

    public function test_checkout_fails_when_order_below_minimum()
    {
        // Create a customer
        $customer = User::factory()->customer()->create();
        $customer->assignRole('customer');
        
        // Create a member for stock
        $member = User::factory()->member()->create();
        $member->assignRole('member');
        
        // Create a product with low price
        $product = Product::factory()->create([
            'price_kilo' => 10.00, // Php10 per kilo
        ]);
        
        // Create stock for the product
        $stock = Stock::factory()->create([
            'product_id' => $product->id,
            'member_id' => $member->id,
            'quantity' => 10,
            'category' => 'Kilo',
        ]);

        // Customer adds small quantity to cart (total will be Php50, below Php75 minimum)
        $this->actingAs($customer)->post('/customer/cart/store', [
            'product_id' => $product->id,
            'category' => 'Kilo',
            'quantity' => 5, // 5 kilos * Php10 = Php50
        ]);

        // Customer tries to checkout
        $response = $this->actingAs($customer)->post('/customer/cart/checkout');
        
        // Check that it redirects back to cart
        $response->assertRedirect('/customer/cart');
        
        // Check that no order was created
        $this->assertDatabaseMissing('sales', [
            'customer_id' => $customer->id,
        ]);
        
        // Check that cart still has items
        $this->assertDatabaseHas('cart_items', [
            'product_id' => $product->id,
            'category' => 'Kilo',
            'quantity' => 5,
        ]);
    }

    public function test_checkout_succeeds_when_order_meets_minimum()
    {
        // Create a customer
        $customer = User::factory()->customer()->create();
        $customer->assignRole('customer');
        
        // Create a member for stock
        $member = User::factory()->member()->create();
        $member->assignRole('member');
        
        // Create a product with price that will meet minimum
        $product = Product::factory()->create([
            'price_kilo' => 20.00, // Php20 per kilo
        ]);
        
        // Create stock for the product
        $stock = Stock::factory()->create([
            'product_id' => $product->id,
            'member_id' => $member->id,
            'quantity' => 10,
            'category' => 'Kilo',
        ]);

        // Customer adds quantity to cart (total will be Php80, above Php75 minimum)
        $this->actingAs($customer)->post('/customer/cart/store', [
            'product_id' => $product->id,
            'category' => 'Kilo',
            'quantity' => 4, // 4 kilos * Php20 = Php80
        ]);

        // Customer checks out
        $response = $this->actingAs($customer)->post('/customer/cart/checkout');
        
        $response->assertRedirect('/customer/cart');
        
        // Check that a pending order was created
        $this->assertDatabaseHas('sales', [
            'customer_id' => $customer->id,
            'status' => 'pending',
            'total_amount' => 80.00, // 4 kilos * Php20
        ]);
        
        // Check that cart is cleared
        $this->assertDatabaseMissing('cart_items', [
            'product_id' => $product->id,
        ]);
    }

    public function test_cart_total_calculation_includes_item_prices()
    {
        // Create a customer
        $customer = User::factory()->customer()->create();
        $customer->assignRole('customer');
        
        // Create a member for stock
        $member = User::factory()->member()->create();
        $member->assignRole('member');
        
        // Create products with different prices
        $product1 = Product::factory()->create([
            'price_kilo' => 15.00,
        ]);
        
        $product2 = Product::factory()->create([
            'price_pc' => 25.00,
        ]);
        
        // Create stock for the products
        Stock::factory()->create([
            'product_id' => $product1->id,
            'member_id' => $member->id,
            'quantity' => 10,
            'category' => 'Kilo',
        ]);
        
        Stock::factory()->create([
            'product_id' => $product2->id,
            'member_id' => $member->id,
            'quantity' => 10,
            'category' => 'Pc',
        ]);

        // Customer adds items to cart
        $this->actingAs($customer)->post('/customer/cart/store', [
            'product_id' => $product1->id,
            'category' => 'Kilo',
            'quantity' => 3, // 3 kilos * Php15 = Php45
        ]);
        
        $this->actingAs($customer)->post('/customer/cart/store', [
            'product_id' => $product2->id,
            'category' => 'Pc',
            'quantity' => 2, // 2 pcs * Php25 = Php50
        ]);

        // Total should be Php95 (Php45 + Php50), which meets minimum
        $response = $this->actingAs($customer)->post('/customer/cart/checkout');
        
        $response->assertRedirect('/customer/cart');
        
        // Check that a pending order was created with correct total
        $this->assertDatabaseHas('sales', [
            'customer_id' => $customer->id,
            'status' => 'pending',
            'total_amount' => 95.00, // Php45 + Php50
        ]);
    }

    public function test_cart_page_displays_total_and_minimum_requirement()
    {
        // Create a customer
        $customer = User::factory()->customer()->create();
        $customer->assignRole('customer');
        
        // Create a member for stock
        $member = User::factory()->member()->create();
        $member->assignRole('member');
        
        // Create a product
        $product = Product::factory()->create([
            'price_kilo' => 10.00,
        ]);
        
        // Create stock for the product
        Stock::factory()->create([
            'product_id' => $product->id,
            'member_id' => $member->id,
            'quantity' => 10,
            'category' => 'Kilo',
        ]);

        // Customer adds item to cart
        $this->actingAs($customer)->post('/customer/cart/store', [
            'product_id' => $product->id,
            'category' => 'Kilo',
            'quantity' => 5, // Php50 total
        ]);

        // Visit cart page
        $response = $this->actingAs($customer)->get('/customer/cart');
        
        $response->assertStatus(200);
        
        // The response should include cart total in the props
        $response->assertInertia(fn ($page) => 
            $page->has('cartTotal') && 
            $page->component('Customer/Cart/index')
        );
    }
} 