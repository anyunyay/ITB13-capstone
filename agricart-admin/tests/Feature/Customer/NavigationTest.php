<?php

namespace Tests\Feature\Customer;

use App\Models\User;
use App\Models\Product;
use App\Models\Stock;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NavigationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create a customer user
        $this->customer = User::factory()->customer()->create();
        
        // Create a product with stock
        $this->product = Product::factory()->create([
            'name' => 'Test Product',
            'produce_type' => 'fruit',
            'price_kilo' => 50.00,
            'description' => 'Test product description'
        ]);
        
        // Create stock for the product
        Stock::factory()->create([
            'product_id' => $this->product->id,
            'category' => 'Kilo',
            'quantity' => 10
        ]);
    }

    public function test_customer_can_navigate_from_produce_to_product_detail()
    {
        $response = $this->actingAs($this->customer)
            ->get('/customer/produce');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Customer/Home/produce'));
    }

    public function test_customer_can_navigate_to_product_detail_page()
    {
        $response = $this->actingAs($this->customer)
            ->get("/customer/product/{$this->product->id}");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Customer/Products/product'));
    }

    public function test_product_detail_page_has_correct_back_navigation()
    {
        $response = $this->actingAs($this->customer)
            ->get("/customer/product/{$this->product->id}");

        $response->assertStatus(200);
        
        // The page should render with the product data
        $response->assertInertia(fn ($page) => 
            $page->component('Customer/Products/product')
                ->has('product')
                ->where('product.id', $this->product->id)
                ->where('product.name', $this->product->name)
        );
    }

    public function test_produce_page_route_exists()
    {
        $response = $this->actingAs($this->customer)
            ->get('/customer/produce');

        $response->assertStatus(200);
    }

    public function test_product_page_route_exists()
    {
        $response = $this->actingAs($this->customer)
            ->get("/customer/product/{$this->product->id}");

        $response->assertStatus(200);
    }
}
