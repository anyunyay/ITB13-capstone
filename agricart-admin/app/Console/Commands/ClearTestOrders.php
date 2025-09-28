<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Sales;
use App\Models\AuditTrail;
use App\Models\User;

class ClearTestOrders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test-orders:clear {--force : Force delete without confirmation}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clear all test orders created by UrgentOrderTestSeeder';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Find the test customer
        $customer = User::where('email', 'customer@customer.com')->first();
        
        if (!$customer) {
            $this->error('Customer with email customer@customer.com not found.');
            return 1;
        }

        // Get all orders for this customer
        $orders = Sales::where('customer_id', $customer->id)->get();
        
        if ($orders->isEmpty()) {
            $this->info('No test orders found for customer@customer.com');
            return 0;
        }

        $this->info("Found {$orders->count()} orders for customer@customer.com");
        
        if ($this->option('force') || $this->confirm('Are you sure you want to delete all these orders?')) {
            $deletedCount = 0;
            
            foreach ($orders as $order) {
                // Delete audit trail entries first
                AuditTrail::where('sale_id', $order->id)->delete();
                
                // Delete the order
                $order->delete();
                $deletedCount++;
            }
            
            $this->info("✅ Successfully deleted {$deletedCount} test orders and their audit trail entries.");
        } else {
            $this->info('Operation cancelled.');
        }

        return 0;
    }
}