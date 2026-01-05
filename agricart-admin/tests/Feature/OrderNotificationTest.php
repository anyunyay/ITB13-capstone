<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Sales;
use App\Models\Product;
use App\Models\Stock;
use App\Models\AuditTrail;
use App\Notifications\OrderReceipt;
use App\Notifications\OrderRejectionNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;

class OrderNotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_order_approval_sends_receipt_notification()
    {
        Notification::fake();

        // Create test users
        $customer = User::factory()->create(['type' => 'customer']);
        $admin = User::factory()->create(['type' => 'admin']);

        // Create test product and stock
        $product = Product::factory()->create();
        $stock = Stock::factory()->create([
            'product_id' => $product->id,
            'member_id' => User::factory()->create(['type' => 'member'])->id,
            'quantity' => 10,
        ]);

        // Create test order
        $order = Sales::factory()->create([
            'customer_id' => $customer->id,
            'admin_id' => $admin->id,
            'status' => 'approved',
            'total_amount' => 1500.00,
            'admin_notes' => 'Test approval notes',
        ]);

        // Create audit trail
        AuditTrail::factory()->create([
            'sale_id' => $order->id,
            'product_id' => $product->id,
            'stock_id' => $stock->id,
            'quantity' => 5,
            'category' => 'kilo',
        ]);

        // Send notification
        $customer->notify(new OrderReceipt($order));

        // Assert notification was sent
        Notification::assertSentTo(
            $customer,
            OrderReceipt::class,
            function ($notification) use ($order) {
                return $notification->order->id === $order->id;
            }
        );
    }

    public function test_order_rejection_sends_rejection_notification()
    {
        Notification::fake();

        // Create test users
        $customer = User::factory()->create(['type' => 'customer']);
        $admin = User::factory()->create(['type' => 'admin']);

        // Create test product and stock
        $product = Product::factory()->create();
        $stock = Stock::factory()->create([
            'product_id' => $product->id,
            'member_id' => User::factory()->create(['type' => 'member'])->id,
            'quantity' => 10,
        ]);

        // Create test order
        $order = Sales::factory()->create([
            'customer_id' => $customer->id,
            'admin_id' => $admin->id,
            'status' => 'rejected',
            'total_amount' => 1500.00,
            'admin_notes' => 'Insufficient stock available',
        ]);

        // Create audit trail
        AuditTrail::factory()->create([
            'sale_id' => $order->id,
            'product_id' => $product->id,
            'stock_id' => $stock->id,
            'quantity' => 5,
            'category' => 'kilo',
        ]);

        // Send notification
        $customer->notify(new OrderRejectionNotification($order));

        // Assert notification was sent
        Notification::assertSentTo(
            $customer,
            OrderRejectionNotification::class,
            function ($notification) use ($order) {
                return $notification->order->id === $order->id;
            }
        );
    }

    public function test_approval_notification_contains_correct_data()
    {
        // Create test users
        $customer = User::factory()->create(['type' => 'customer']);
        $admin = User::factory()->create(['type' => 'admin']);

        // Create test order
        $order = Sales::factory()->create([
            'customer_id' => $customer->id,
            'admin_id' => $admin->id,
            'status' => 'approved',
            'total_amount' => 2500.00,
            'admin_notes' => 'Order approved with special notes',
        ]);

        // Create notification
        $notification = new OrderReceipt($order);
        $mailMessage = $notification->toMail($customer);

        // Assert mail message contains correct data
        $this->assertStringContainsString('Order Approved & Receipt', $mailMessage->subject);
        $this->assertStringContainsString($order->id, $mailMessage->subject);
        $this->assertStringContainsString('Great news!', $mailMessage->introLines[0]);
        
        // Check if admin notes are included in the intro lines
        $introLinesText = implode(' ', $mailMessage->introLines);
        $this->assertStringContainsString('Order approved with special notes', $introLinesText);
    }

    public function test_rejection_notification_contains_correct_data()
    {
        // Create test users
        $customer = User::factory()->create(['type' => 'customer']);
        $admin = User::factory()->create(['type' => 'admin']);

        // Create test order
        $order = Sales::factory()->create([
            'customer_id' => $customer->id,
            'admin_id' => $admin->id,
            'status' => 'rejected',
            'total_amount' => 1800.00,
            'admin_notes' => 'Product out of stock',
        ]);

        // Create notification
        $notification = new OrderRejectionNotification($order);
        $mailMessage = $notification->toMail($customer);

        // Assert mail message contains correct data
        $this->assertStringContainsString('Order Update', $mailMessage->subject);
        $this->assertStringContainsString('Declined', $mailMessage->subject);
        $this->assertStringContainsString($order->id, $mailMessage->subject);
        $this->assertStringContainsString('regret to inform you', $mailMessage->introLines[0]);
        
        // Check if admin notes are included in the intro lines
        $introLinesText = implode(' ', $mailMessage->introLines);
        $this->assertStringContainsString('Product out of stock', $introLinesText);
    }
}
