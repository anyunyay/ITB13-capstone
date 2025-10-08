<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\SalesAudit;

class CheckUrgentOrders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'urgent-orders:check';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check urgent orders and debug popup issues';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking urgent orders...');
        
        // Get all pending orders
        $pendingOrders = SalesAudit::where('status', 'pending')->get();
        $this->info("Total pending orders: {$pendingOrders->count()}");
        
        // Check urgent orders using the same logic as middleware
        $urgentOrders = $pendingOrders->filter(function ($order) {
            // Check if manually marked as urgent
            if ($order->is_urgent) return true;
            // Check if within 8 hours of 24-hour limit
            $orderAge = $order->created_at->diffInHours(now());
            return $orderAge >= 16; // 16+ hours old (8 hours left)
        });
        
        $this->info("Urgent orders count: {$urgentOrders->count()}");
        
        if ($urgentOrders->count() > 0) {
            $this->info("\nUrgent orders details:");
            foreach ($urgentOrders as $order) {
                $orderAge = $order->created_at->diffInHours(now());
                $hoursLeft = 24 - $orderAge;
                $urgencyType = $order->is_urgent ? 'Manual' : 'Time-based';
                $this->line("  - Order #{$order->id}: {$hoursLeft}h left ({$urgencyType}) - Customer: {$order->customer->name}");
            }
            
            $this->info("\nThe popup should show when you login as admin/staff.");
            $this->info("If it doesn't show, try clearing your browser's session storage:");
            $this->info("1. Open browser dev tools (F12)");
            $this->info("2. Go to Application/Storage tab");
            $this->info("3. Clear Session Storage");
            $this->info("4. Refresh the page");
        } else {
            $this->warn("No urgent orders found. The popup won't show.");
        }
        
        return 0;
    }
}