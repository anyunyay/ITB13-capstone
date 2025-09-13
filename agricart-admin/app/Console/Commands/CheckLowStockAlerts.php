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
    protected $signature = 'stock:check-low-alerts {--threshold=10 : Stock threshold for available stock alerts} {--partial-threshold=5 : Stock threshold for partial stock alerts}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check for low stock alerts and notify members (available stocks and partial stocks)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $threshold = $this->option('threshold');
        $partialThreshold = $this->option('partial-threshold');
        
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

        // Check partial stocks (assigned to customers but not completely sold)
        $partialLowStocks = Stock::active()
            ->partial()
            ->where('quantity', '<=', $partialThreshold)
            ->where('quantity', '>', 0)
            ->with(['product', 'member'])
            ->get();

        $partialAlertCount = 0;
        foreach ($partialLowStocks as $stock) {
            if (!$this->hasRecentAlert($stock)) {
                $stock->member->notify(new LowStockAlertNotification($stock, $partialThreshold));
                $partialAlertCount++;
            }
        }

        $totalAlertCount = $availableAlertCount + $partialAlertCount;

        $this->info("Sent {$availableAlertCount} available stock alerts and {$partialAlertCount} partial stock alerts to members.");
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
