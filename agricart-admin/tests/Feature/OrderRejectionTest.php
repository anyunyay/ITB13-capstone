<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Sales;
use App\Models\Product;
use App\Models\Stock;
use App\Models\AuditTrail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderRejectionTest extends TestCase
{
    use RefreshDatabase;

    public function test_rejected_order_has_null_delivery_status()
    {
        // Create an admin with manage orders permission
        $admin = User::factory()->admin()->create();
        $admin->givePermissionTo('manage orders');

        // Create a customer
        $customer = User::factory()->customer()->create();

        // Create a pending order
        $order = Sales::create([
            'customer_id' => $customer->id,
            'status' => 'pending',
            'delivery_status' => null,
            'total_amount' => 100,
        ]);

        // Admin rejects the order
        $response = $this->actingAs($admin)->post("/admin/orders/{$order->id}/reject", [
            'admin_notes' => 'Order rejected due to insufficient stock.',
        ]);

        $response->assertRedirect();

        // Check that the order has null delivery status
        $this->assertDatabaseHas('sales', [
            'id' => $order->id,
            'status' => 'rejected',
            'delivery_status' => null,
        ]);
    }

    public function test_approved_order_rejected_has_null_delivery_status()
    {
        // Create an admin with manage orders permission
        $admin = User::factory()->admin()->create();
        $admin->givePermissionTo('manage orders');

        // Create a customer
        $customer = User::factory()->customer()->create();

        // Create an approved order with delivery status
        $order = Sales::create([
            'customer_id' => $customer->id,
            'status' => 'approved',
            'delivery_status' => 'out_for_delivery',
            'total_amount' => 100,
        ]);

        // Admin rejects the order
        $response = $this->actingAs($admin)->post("/admin/orders/{$order->id}/reject", [
            'admin_notes' => 'Order rejected due to customer request.',
        ]);

        $response->assertRedirect();

        // Check that the order has null delivery status
        $this->assertDatabaseHas('sales', [
            'id' => $order->id,
            'status' => 'rejected',
            'delivery_status' => null,
        ]);
    }

    public function test_customer_cannot_see_delivery_tracker_for_rejected_orders()
    {
        // Create a customer
        $customer = User::factory()->customer()->create();

        // Create a rejected order
        $order = Sales::create([
            'customer_id' => $customer->id,
            'status' => 'rejected',
            'delivery_status' => null,
            'total_amount' => 100,
        ]);

        // Customer should not see delivery tracker for rejected orders
        $response = $this->actingAs($customer)->get('/customer/orders/history');
        
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Customer/Order History/index')
                ->has('orders')
                ->where('orders.0.status', 'rejected')
                ->where('orders.0.delivery_status', null)
        );
    }
} 