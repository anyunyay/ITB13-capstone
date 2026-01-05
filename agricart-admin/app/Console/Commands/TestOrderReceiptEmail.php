<?php

namespace App\Console\Commands;

use App\Models\Sales;
use App\Models\User;
use App\Models\Product;
use App\Models\Stock;
use App\Notifications\OrderReceipt;
use Illuminate\Console\Command;

class TestOrderReceiptEmail extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:order-receipt-email {order_id?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test the order receipt email functionality';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $orderId = $this->argument('order_id');

        if ($orderId) {
            $order = Sales::with(['customer', 'admin', 'auditTrail.product'])->find($orderId);
            
            if (!$order) {
                $this->error("Order #{$orderId} not found!");
                return 1;
            }
        } else {
            // Create a test order if no order ID provided
            $this->info('Creating test order...');
            
            $customer = User::where('type', 'customer')->first();
            $admin = User::where('type', 'admin')->first();
            
            if (!$customer || !$admin) {
                $this->error('No customer or admin found in database!');
                return 1;
            }
            
            $product = Product::first();
            if (!$product) {
                $this->error('No products found in database!');
                return 1;
            }
            
            // Create a test order
            $order = Sales::create([
                'customer_id' => $customer->id,
                'admin_id' => $admin->id,
                'status' => 'approved',
                'total_amount' => 150.00,
                'admin_notes' => 'Test order for email receipt',
            ]);
            
            $this->info("Created test order #{$order->id}");
        }

        $this->info("Sending receipt email for order #{$order->id} to {$order->customer->email}...");
        
        try {
            $order->customer->notify(new OrderReceipt($order));
            $this->info('✅ Receipt email sent successfully!');
            $this->info("Check the email at: {$order->customer->email}");
        } catch (\Exception $e) {
            $this->error('❌ Failed to send receipt email: ' . $e->getMessage());
            return 1;
        }

        return 0;
    }
} 