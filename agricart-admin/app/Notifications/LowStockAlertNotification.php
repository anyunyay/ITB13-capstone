<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use App\Models\Stock;

class LowStockAlertNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $stock;
    public $threshold;

    public function __construct(Stock $stock, $threshold = 10)
    {
        $this->stock = $stock;
        $this->threshold = $threshold;
    }

    public function via($notifiable)
    {
        return ['database', 'mail'];
    }

    public function toMail($notifiable)
    {
        $product = $this->stock->product;
        
        return (new MailMessage)
            ->subject('Low Stock Alert')
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('Your product is running low on stock!')
            ->line('Stock Details:')
            ->line('Product: ' . $product->name)
            ->line('Current Quantity: ' . $this->stock->quantity)
            ->line('Alert Threshold: ' . $this->threshold)
            ->line('Alert Date: ' . now()->format('F j, Y g:i A'))
            ->action('Manage Stock', url('/member/inventory'))
            ->line('Please consider restocking this product soon.');
    }

    public function toArray($notifiable)
    {
        return [
            'stock_id' => $this->stock->id,
            'type' => 'low_stock_alert',
            'product_name' => $this->stock->product->name,
            'current_quantity' => $this->stock->quantity,
            'threshold' => $this->threshold,
            'message' => 'Low stock alert: ' . $this->stock->product->name . ' has only ' . $this->stock->quantity . ' units left',
            'action_url' => '/member/inventory',
        ];
    }
}
