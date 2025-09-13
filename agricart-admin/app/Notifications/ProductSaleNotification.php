<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use App\Models\Stock;

class ProductSaleNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $stock;
    public $sale;
    public $customer;

    public function __construct(Stock $stock, $sale, $customer)
    {
        $this->stock = $stock;
        $this->sale = $sale;
        $this->customer = $customer;
    }

    public function via($notifiable)
    {
        return ['database', 'mail'];
    }

    public function toMail($notifiable)
    {
        $product = $this->stock->product;
        
        return (new MailMessage)
            ->subject('Product Sale Notification')
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('Your product has been sold!')
            ->line('Sale Details:')
            ->line('Product: ' . $product->name)
            ->line('Customer: ' . $this->customer->name)
            ->line('Quantity Sold: ' . $this->stock->quantity)
            ->line('Sale Date: ' . now()->format('F j, Y g:i A'))
            ->action('View Sales', url('/member/sales'))
            ->line('Thank you for using our platform!');
    }

    public function toArray($notifiable)
    {
        return [
            'stock_id' => $this->stock->id,
            'sale_id' => $this->sale->id,
            'type' => 'product_sale',
            'product_name' => $this->stock->product->name,
            'customer_name' => $this->customer->name,
            'quantity_sold' => $this->stock->quantity,
            'message' => 'Your product ' . $this->stock->product->name . ' was sold to ' . $this->customer->name,
            'action_url' => '/member/sales',
        ];
    }
}
