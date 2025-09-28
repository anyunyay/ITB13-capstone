<?php

namespace App\Console\Commands;

use App\Models\Sales;
use App\Notifications\OrderStatusUpdate;
use Illuminate\Console\Command;
use Carbon\Carbon;

class ExpireOldOrders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'orders:expire';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Expire orders that are older than 24 hours and still pending';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $expiredOrders = Sales::where('status', 'pending')
            ->where('created_at', '<', Carbon::now()->subHours(24))
            ->get();

        $count = 0;

        foreach ($expiredOrders as $order) {
            // Update order status to expired
            $order->update([
                'status' => 'expired',
                'admin_notes' => 'Order automatically expired after 24 hours without approval.'
            ]);

            // Notify customer about expired order
            $order->customer?->notify(new OrderStatusUpdate(
                $order->id, 
                'expired', 
                'Your order has expired due to no approval within 24 hours. Please place a new order if needed.'
            ));

            $count++;
        }

        if ($count > 0) {
            $this->info("Expired {$count} order(s) that were older than 24 hours.");
        } else {
            $this->info('No orders found that needed to be expired.');
        }

        return 0;
    }
}
