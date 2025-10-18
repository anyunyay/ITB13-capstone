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
    protected $signature = 'stock:check-low-alerts {--threshold=10 : Stock threshold for available stock alerts}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check for low stock alerts and notify members (available stocks only)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $threshold = $this->option('threshold');
        
        $totalAlertCount = 0;

        // Check available stocks (not assigned to any customer)
        $availableLowStocks = Stock::active()
            ->available()
            ->where('quantity', '<=', $threshold)
            ->where('quantity', '>', 0)
            ->with(['product', 'member'])
            ->get();

        $availableAlertCount = 0;
        foreach ($availableLowStocks as $stock) {
            if (!$this->hasRecentAlert($stock)) {
                $stock->member->notify(new LowStockAlertNotification($stock, $threshold));
                $availableAlertCount++;
            }
        }

        $totalAlertCount = $availableAlertCount;

        $this->info("Sent {$availableAlertCount} available stock alerts to members.");
        $this->info("Total alerts sent: {$totalAlertCount}");
        
        return Command::SUCCESS;
    }

    /**
     * Check if we've already sent an alert for this stock recently (within last 24 hours)
     */
    private function hasRecentAlert($stock)
    {
        return $stock->member->notifications()
            ->where('type', 'App\\Notifications\\LowStockAlertNotification')
            ->where('data->stock_id', $stock->id)
            ->where('created_at', '>=', now()->subDay())
            ->exists();
    }
}
