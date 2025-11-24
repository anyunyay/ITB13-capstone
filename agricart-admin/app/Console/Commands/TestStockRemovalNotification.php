<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Stock;
use App\Models\User;
use App\Notifications\StockRemovedNotification;

class TestStockRemovalNotification extends Command
{
    protected $signature = 'test:stock-removal-notification';
    protected $description = 'Test stock removal notification';

    public function handle()
    {
        $this->info('Testing Stock Removal Notification...');
        
        // Find a stock with a member
        $stock = Stock::with(['member', 'product'])
            ->whereHas('member')
            ->whereHas('product')
            ->where('quantity', '>', 0)
            ->first();
        
        if (!$stock) {
            $this->error('No suitable stock found for testing');
            return 1;
        }
        
        if (!$stock->member) {
            $this->error('Stock has no member');
            return 1;
        }
        
        $this->info("Found stock: {$stock->product->name}");
        $this->info("Member: {$stock->member->name} (ID: {$stock->member->id})");
        $this->info("Member email: {$stock->member->email}");
        
        // Get an admin user for testing
        $admin = User::where('type', 'admin')->first();
        if (!$admin) {
            $this->error('No admin user found');
            return 1;
        }
        
        try {
            // Send test notification
            $stock->member->notify(new StockRemovedNotification(
                $stock,
                5.0,
                'Listing Error',
                $admin
            ));
            
            $this->info('✓ Notification sent successfully!');
            $this->info('Check the member\'s notifications at /member/notifications');
            
            // Check if notification was created
            $notificationCount = $stock->member->notifications()
                ->where('type', 'App\\Notifications\\StockRemovedNotification')
                ->count();
            
            $this->info("Member now has {$notificationCount} stock removal notification(s)");
            
            return 0;
        } catch (\Exception $e) {
            $this->error('Failed to send notification: ' . $e->getMessage());
            $this->error('Stack trace: ' . $e->getTraceAsString());
            return 1;
        }
    }
}
