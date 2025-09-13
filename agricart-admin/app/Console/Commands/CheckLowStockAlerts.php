<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Stock;
use App\Models\User;
use App\Notifications\LowStockAlertNotification;

class CheckLowStockAlerts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'stock:check-low-alerts {--threshold=10 : Stock threshold for low stock alerts}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check for low stock alerts and notify members';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $threshold = $this->option('threshold');
        
        // Get all active stocks with quantity below threshold
        $lowStocks = Stock::active()
            ->where('quantity', '<=', $threshold)
            ->where('quantity', '>', 0) // Don't alert for completely sold items
            ->with(['product', 'member'])
            ->get();

        $alertCount = 0;

        foreach ($lowStocks as $stock) {
            // Check if we've already sent an alert for this stock recently (within last 24 hours)
            $recentAlert = $stock->member->notifications()
                ->where('type', 'App\\Notifications\\LowStockAlertNotification')
                ->where('data->stock_id', $stock->id)
                ->where('created_at', '>=', now()->subDay())
                ->exists();

            if (!$recentAlert) {
                $stock->member->notify(new LowStockAlertNotification($stock, $threshold));
                $alertCount++;
            }
        }

        $this->info("Sent {$alertCount} low stock alerts to members.");
        
        return Command::SUCCESS;
    }
}
