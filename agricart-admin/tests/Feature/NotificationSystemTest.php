<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Sales;
use App\Models\Stock;
use App\Models\Product;
use App\Notifications\NewOrderNotification;
use App\Notifications\ProductSaleNotification;
use App\Notifications\LowStockAlertNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class NotificationSystemTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_receives_new_order_notification()
    {
        Notification::fake();

        // Create admin user
        $admin = User::factory()->create(['type' => 'admin']);
        
        // Create customer user
        $customer = User::factory()->create(['type' => 'customer']);
        
        // Create a new order
        $order = Sales::create([
            'customer_id' => $customer->id,
            'total_amount' => 100.00,
            'status' => 'pending',
        ]);

        // Trigger notification
        $admin->notify(new NewOrderNotification($order));

        // Assert notification was sent
        Notification::assertSentTo($admin, NewOrderNotification::class);
    }

    public function test_member_receives_product_sale_notification()
    {
        Notification::fake();

        // Create member user
        $member = User::factory()->create(['type' => 'member']);
        
        // Create customer user
        $customer = User::factory()->create(['type' => 'customer']);
        
        // Create product
        $product = Product::factory()->create();
        
        // Create stock
        $stock = Stock::create([
            'product_id' => $product->id,
            'member_id' => $member->id,
            'quantity' => 10,
            'category' => 'Kilo',
        ]);
        
        // Create order
        $order = Sales::create([
            'customer_id' => $customer->id,
            'total_amount' => 100.00,
            'status' => 'approved',
        ]);

        // Trigger notification
        $member->notify(new ProductSaleNotification($stock, $order, $customer));

        // Assert notification was sent
        Notification::assertSentTo($member, ProductSaleNotification::class);
    }

    public function test_member_receives_low_stock_alert()
    {
        Notification::fake();

        // Create member user
        $member = User::factory()->create(['type' => 'member']);
        
        // Create product
        $product = Product::factory()->create();
        
        // Create low stock
        $stock = Stock::create([
            'product_id' => $product->id,
            'member_id' => $member->id,
            'quantity' => 5, // Low stock
            'category' => 'Kilo',
        ]);

        // Trigger notification
        $member->notify(new LowStockAlertNotification($stock, 10));

        // Assert notification was sent
        Notification::assertSentTo($member, LowStockAlertNotification::class);
    }

    public function test_notification_data_structure()
    {
        // Create test data
        $member = User::factory()->create(['type' => 'member']);
        $customer = User::factory()->create(['type' => 'customer']);
        $product = Product::factory()->create();
        
        $stock = Stock::create([
            'product_id' => $product->id,
            'member_id' => $member->id,
            'quantity' => 10,
            'category' => 'Kilo',
        ]);
        
        $order = Sales::create([
            'customer_id' => $customer->id,
            'total_amount' => 100.00,
            'status' => 'approved',
        ]);

        // Create notification
        $notification = new ProductSaleNotification($stock, $order, $customer);
        
        // Test notification data
        $data = $notification->toArray($member);
        
        $this->assertArrayHasKey('type', $data);
        $this->assertArrayHasKey('message', $data);
        $this->assertArrayHasKey('action_url', $data);
        $this->assertEquals('product_sale', $data['type']);
        $this->assertStringContains('sold', $data['message']);
    }
}
