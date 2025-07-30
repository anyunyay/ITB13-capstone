<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Sales;
use App\Notifications\DeliveryStatusUpdate;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomerGlobalNotificationsTest extends TestCase
{
    use RefreshDatabase;

    public function test_delivery_status_notifications_visible_on_all_customer_pages()
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

        // Test that notifications are visible on home page
        $response1 = $this->actingAs($customer)->get('/');
        $response1->assertStatus(200);
        $response1->assertInertia(fn ($page) => 
            $page->has('customerNotifications')
                ->where('customerNotifications.0.order_id', $order->id)
                ->where('customerNotifications.0.delivery_status', 'out_for_delivery')
        );

        // Test that notifications are visible on cart page
        $response2 = $this->actingAs($customer)->get('/customer/cart');
        $response2->assertStatus(200);
        $response2->assertInertia(fn ($page) => 
            $page->has('customerNotifications')
                ->where('customerNotifications.0.order_id', $order->id)
                ->where('customerNotifications.0.delivery_status', 'out_for_delivery')
        );

        // Test that notifications are visible on order history page
        $response3 = $this->actingAs($customer)->get('/customer/orders/history');
        $response3->assertStatus(200);
        $response3->assertInertia(fn ($page) => 
            $page->has('customerNotifications')
                ->where('customerNotifications.0.order_id', $order->id)
                ->where('customerNotifications.0.delivery_status', 'out_for_delivery')
        );
    }

    public function test_notification_count_shows_correctly_in_header()
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

        // Send multiple notifications
        $customer->notify(new DeliveryStatusUpdate($order->id, 'out_for_delivery', 'Your order is out for delivery!'));
        $customer->notify(new DeliveryStatusUpdate($order->id, 'delivered', 'Your order has been delivered!'));

        // Test that notification count is correct
        $response = $this->actingAs($customer)->get('/');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->has('customerNotifications')
                ->where('customerNotifications', function ($notifications) {
                    return count($notifications) === 2;
                })
        );
    }

    public function test_delivery_status_notifications_have_correct_styling()
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

        // Send different types of delivery notifications
        $customer->notify(new DeliveryStatusUpdate($order->id, 'out_for_delivery', 'Your order is out for delivery!'));
        $customer->notify(new DeliveryStatusUpdate($order->id, 'delivered', 'Your order has been delivered!'));

        // Test that notifications have correct data structure
        $response = $this->actingAs($customer)->get('/');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->has('customerNotifications')
                ->where('customerNotifications.0.delivery_status', 'out_for_delivery')
                ->where('customerNotifications.1.delivery_status', 'delivered')
        );
    }
} 