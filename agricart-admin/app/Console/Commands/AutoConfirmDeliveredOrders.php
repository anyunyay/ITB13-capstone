<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Sales;
use App\Helpers\SystemLogger;

class AutoConfirmDeliveredOrders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'orders:auto-confirm';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Automatically confirm orders that have been delivered for 3 days without customer confirmation';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting auto-confirmation process...');
        
        // Get orders that are eligible for auto-confirmation
        $eligibleOrders = Sales::where('customer_received', false)
            ->whereNotNull('delivered_at')
            ->where('delivered_at', '<=', now()->subDays(3))
            ->get();
        
        $confirmedCount = 0;
        
        foreach ($eligibleOrders as $order) {
            if ($order->isEligibleForAutoConfirmation()) {
                $order->autoConfirmIfEligible();
                $confirmedCount++;
                
                // Log the auto-confirmation
                SystemLogger::logOrderStatusChange(
                    $order->id,
                    'pending_confirmation',
                    'auto_confirmed',
                    null, // No user ID for system actions
                    'system',
                    [
                        'auto_confirmed_at' => now()->toISOString(),
                        'delivered_at' => $order->delivered_at->toISOString(),
                        'days_since_delivery' => $order->delivered_at->diffInDays(now()),
                        'customer_id' => $order->customer_id
                    ]
                );
                
                $this->line("Auto-confirmed order #{$order->id} (delivered {$order->delivered_at->diffInDays(now())} days ago)");
            }
        }
        
        $this->info("Auto-confirmation completed. {$confirmedCount} orders were automatically confirmed.");
        
        return Command::SUCCESS;
    }
}
