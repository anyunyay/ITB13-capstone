<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\SalesAudit;
use App\Notifications\OrderDelayedNotification;

class UpdateDelayedOrders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:update-delayed-orders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update orders that are over 24 hours old to delayed status and notify customers';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking for delayed orders...');

        // Find orders that are over 24 hours old and still pending
        $delayedOrders = SalesAudit::where('status', 'pending')
            ->where('created_at', '<', now()->subHours(24))
            ->with('customer')
            ->get();

        $count = 0;
        foreach ($delayedOrders as $order) {
            // Update status to delayed
            $order->update(['status' => 'delayed']);
            
            // Send notification to customer
            if ($order->customer) {
                $order->customer->notify(new OrderDelayedNotification($order));
                $count++;
            }
        }

        $this->info("Updated {$count} orders to delayed status and sent notifications.");
        
        return 0;
    }
}
