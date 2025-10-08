<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\SalesAudit;
use Carbon\Carbon;

class DebugTimeCalculations extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'debug:time-calculations';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Debug time calculations for urgent orders';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Debugging time calculations for pending orders...');
        
        $pendingOrders = SalesAudit::where('status', 'pending')->get();
        
        foreach ($pendingOrders as $order) {
            $createdAt = $order->created_at;
            $now = now();
            
            // Method 1: Using diffInHours (what middleware uses)
            $hoursElapsed1 = $now->diffInHours($createdAt);
            
            // Method 2: Using Carbon diffInHours (what seeder uses)
            $hoursElapsed2 = $createdAt->diffInHours($now);
            
            // Method 3: Manual calculation
            $hoursElapsed3 = ($now->timestamp - $createdAt->timestamp) / 3600;
            
            $isUrgent1 = $hoursElapsed1 >= 16;
            $isUrgent2 = $hoursElapsed2 >= 16;
            $isUrgent3 = $hoursElapsed3 >= 16;
            
            $this->line("Order #{$order->id}:");
            $this->line("  Created: {$createdAt}");
            $this->line("  Now: {$now}");
            $this->line("  Method 1 (now->diffInHours): {$hoursElapsed1}hrs - Urgent: " . ($isUrgent1 ? 'YES' : 'NO'));
            $this->line("  Method 2 (createdAt->diffInHours): {$hoursElapsed2}hrs - Urgent: " . ($isUrgent2 ? 'YES' : 'NO'));
            $this->line("  Method 3 (manual): {$hoursElapsed3}hrs - Urgent: " . ($isUrgent3 ? 'YES' : 'NO'));
            $this->line("  Manually urgent: " . ($order->is_urgent ? 'YES' : 'NO'));
            $this->line('');
        }
        
        return 0;
    }
}