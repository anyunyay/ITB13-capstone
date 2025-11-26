<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\SalesAudit;
use Illuminate\Support\Facades\Log;

class ClearExpiredSuspiciousOrders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'orders:clear-expired-suspicious';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clear suspicious flags for orders older than 10 minutes';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting to clear expired suspicious orders...');

        $timeWindowMinutes = 10;
        $expirationTime = now()->subMinutes($timeWindowMinutes);

        $this->info("Expiration time: {$expirationTime->toDateTimeString()}");

        // Find all suspicious orders older than 10 minutes
        $expiredOrders = SalesAudit::where('is_suspicious', true)
            ->where('created_at', '<', $expirationTime)
            ->whereIn('status', ['pending', 'delayed']) // Only clear pending/delayed orders
            ->get();

        if ($expiredOrders->isEmpty()) {
            $this->info('No expired suspicious orders found.');
            Log::info('Scheduled task: No expired suspicious orders found');
            return 0;
        }

        $this->info("Found {$expiredOrders->count()} expired suspicious orders.");

        // Group orders by customer to clear entire windows
        $ordersByCustomer = $expiredOrders->groupBy('customer_id');

        $clearedCount = 0;
        foreach ($ordersByCustomer as $customerId => $customerOrders) {
            // Get the oldest order in this customer's expired group
            $oldestOrder = $customerOrders->sortBy('created_at')->first();
            $oldestOrderTime = $oldestOrder->created_at;

            // Find all orders in the same 10-minute window for this customer
            $windowStart = $oldestOrderTime;
            $windowEnd = $oldestOrderTime->copy()->addMinutes($timeWindowMinutes);

            $ordersInWindow = SalesAudit::where('customer_id', $customerId)
                ->where('is_suspicious', true)
                ->whereBetween('created_at', [$windowStart, $windowEnd])
                ->whereIn('status', ['pending', 'delayed'])
                ->get();

            // Clear all orders in this window
            foreach ($ordersInWindow as $order) {
                $orderAge = $order->created_at->diffInMinutes(now());
                
                $order->update([
                    'is_suspicious' => false,
                    'suspicious_reason' => null,
                ]);
                
                $clearedCount++;

                $customerName = $order->customer->name ?? 'N/A';
                $this->line("  - Cleared Order #{$order->id} (Customer: {$customerName}, Age: {$orderAge} minutes)");

                Log::info('Scheduled task: Cleared expired suspicious order', [
                    'order_id' => $order->id,
                    'customer_id' => $order->customer_id,
                    'order_age_minutes' => $orderAge,
                    'created_at' => $order->created_at->toISOString(),
                    'window_start' => $windowStart->toISOString(),
                    'window_end' => $windowEnd->toISOString(),
                ]);
            }
        }

        $this->info("Successfully cleared {$clearedCount} expired suspicious orders.");

        Log::info('Scheduled task: Expired suspicious orders cleared', [
            'total_cleared' => $clearedCount,
            'customers_affected' => $ordersByCustomer->count(),
        ]);

        return 0;
    }
}
