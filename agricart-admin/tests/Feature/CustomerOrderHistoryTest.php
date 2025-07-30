<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Sales;
use App\Models\Product;
use App\Models\Stock;
use App\Models\AuditTrail;
use App\Notifications\DeliveryStatusUpdate;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class CustomerOrderHistoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_view_order_history_with_delivery_status()
    {
        // Create a customer
        $customer = User::factory()->customer()->create();

        // Create an approved order with delivery status
        $order = Sales::create([
            'customer_id' => $customer->id,
            'status' => 'approved',
            'delivery_status' => 'out_for_delivery',
            'total_amount' => 100,
        ]);

        // Customer should be able to view order history
        $response = $this->actingAs($customer)->get('/customer/orders/history');
        
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Customer/Order History/index')
                ->has('orders')
                ->where('orders.0.id', $order->id)
                ->where('orders.0.delivery_status', 'out_for_delivery')
        );
    }

    public function test_customer_can_view_delivery_status_notifications()
    {
        // Create a customer
        $customer = User::factory()->customer()->create();

        // Create an approved order
        $order = Sales::create([
            'customer_id' => $customer->id,
            'status' => 'approved',
            'delivery_status' => 'pending',
            'total_amount' => 100,
        ]);

        // Send a delivery status notification
        $customer->notify(new DeliveryStatusUpdate($order->id, 'out_for_delivery', 'Your order is out for delivery!'));

        // Customer should be able to view notifications globally
        $response = $this->actingAs($customer)->get('/customer/orders/history');
        
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Customer/Order History/index')
                ->has('customerNotifications')
                ->where('customerNotifications.0.order_id', $order->id)
                ->where('customerNotifications.0.delivery_status', 'out_for_delivery')
        );
    }

    public function test_delivery_status_tracker_shows_correct_stages()
    {
        // Create a customer
        $customer = User::factory()->customer()->create();

        // Create an approved order with delivered status
        $order = Sales::create([
            'customer_id' => $customer->id,
            'status' => 'approved',
            'delivery_status' => 'delivered',
            'total_amount' => 100,
        ]);

        // Customer should be able to view order history with delivery tracker
        $response = $this->actingAs($customer)->get('/customer/orders/history');
        
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Customer/Order History/index')
                ->has('orders')
                ->where('orders.0.delivery_status', 'delivered')
        );
    }

    public function test_delivery_status_tracker_stays_visible_after_notification_read()
    {
        // Create a customer
        $customer = User::factory()->customer()->create();

        // Create an approved order with delivery status
        $order = Sales::create([
            'customer_id' => $customer->id,
            'status' => 'approved',
            'delivery_status' => 'out_for_delivery',
            'total_amount' => 100,
        ]);

        // Send a notification
        $customer->notify(new DeliveryStatusUpdate($order->id, 'out_for_delivery', 'Your order is out for delivery!'));

        // First request - should have notifications and delivery tracker
        $response1 = $this->actingAs($customer)->get('/customer/orders/history');
        $response1->assertStatus(200);
        $response1->assertInertia(fn ($page) => 
            $page->component('Customer/Order History/index')
                ->has('orders')
                ->where('orders.0.delivery_status', 'out_for_delivery')
        );

        // Mark notifications as read
        $this->actingAs($customer)->post('/customer/notifications/mark-read', [
            'ids' => $customer->unreadNotifications->pluck('id')->toArray()
        ]);

        // Second request - notifications should be gone but delivery tracker should remain
        $response2 = $this->actingAs($customer)->get('/customer/orders/history');
        $response2->assertStatus(200);
        $response2->assertInertia(fn ($page) => 
            $page->component('Customer/Order History/index')
                ->has('orders')
                ->where('orders.0.delivery_status', 'out_for_delivery')
        );
    }
} 