<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Sales;
use App\Models\User;
use App\Notifications\OrderReceipt;
use App\Notifications\OrderRejectionNotification;

class TestOrderNotifications extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:order-notifications {order_id?} {--type=both : Type of notification to test (approval, rejection, or both)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test order approval and rejection email notifications';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $orderId = $this->argument('order_id');
        $type = $this->option('type');

        if ($orderId) {
            $order = Sales::with(['customer', 'admin', 'auditTrail.product'])->find($orderId);
            if (!$order) {
                $this->error("Order with ID {$orderId} not found.");
                return 1;
            }
        } else {
            // Create a test order if none provided
            $this->info('Creating test order...');
            $order = $this->createTestOrder();
        }

        $this->info("Testing notifications for Order #{$order->id}");
        $this->info("Customer: {$order->customer->name} ({$order->customer->email})");

        if ($type === 'both' || $type === 'approval') {
            $this->testApprovalNotification($order);
        }

        if ($type === 'both' || $type === 'rejection') {
            $this->testRejectionNotification($order);
        }

        $this->info('Notification testing completed!');
        return 0;
    }

    private function testApprovalNotification(Sales $order)
    {
        $this->info("\n📧 Testing Order Approval Notification...");
        
        try {
            $order->customer->notify(new OrderReceipt($order));
            $this->info("✅ Order approval notification sent successfully!");
            $this->info("   Subject: 🎉 Order Approved & Receipt - Order #{$order->id}");
        } catch (\Exception $e) {
            $this->error("❌ Failed to send approval notification: " . $e->getMessage());
        }
    }

    private function testRejectionNotification(Sales $order)
    {
        $this->info("\n📧 Testing Order Rejection Notification...");
        
        try {
            $order->customer->notify(new OrderRejectionNotification($order));
            $this->info("✅ Order rejection notification sent successfully!");
            $this->info("   Subject: Order Update - Order #{$order->id} (Declined)");
        } catch (\Exception $e) {
            $this->error("❌ Failed to send rejection notification: " . $e->getMessage());
        }
    }

    private function createTestOrder()
    {
        // Find or create a test customer
        $customer = User::where('email', 'test@example.com')->first();
        if (!$customer) {
            $customer = User::create([
                'name' => 'Test Customer',
                'email' => 'test@example.com',
                'password' => bcrypt('password'),
                'type' => 'customer',
                'email_verified_at' => now(),
            ]);
        }

        // Find or create a test admin
        $admin = User::where('type', 'admin')->first();
        if (!$admin) {
            $admin = User::create([
                'name' => 'Test Admin',
                'email' => 'admin@example.com',
                'password' => bcrypt('password'),
                'type' => 'admin',
                'email_verified_at' => now(),
            ]);
        }

        // Create a test order
        $order = Sales::create([
            'customer_id' => $customer->id,
            'admin_id' => $admin->id,
            'total_amount' => 1500.00,
            'status' => 'approved',
            'admin_notes' => 'Test order for notification testing',
            'created_at' => now()->subHours(2),
            'updated_at' => now(),
        ]);

        $this->info("✅ Test order created with ID: {$order->id}");
        return $order;
    }
}
