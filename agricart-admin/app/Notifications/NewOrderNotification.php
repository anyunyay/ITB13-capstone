<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use App\Models\Sales;

class NewOrderNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $order;

    public function __construct(Sales $order)
    {
        $this->order = $order;
    }

    public function via($notifiable)
    {
        return ['database', 'mail'];
    }

    public function toMail($notifiable)
    {
        $customer = $this->order->customer;
        
        return (new MailMessage)
            ->subject('New Order Received - Order #' . $this->order->id)
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('A new order has been placed and requires your attention.')
            ->line('Order Details:')
            ->line('Order ID: #' . $this->order->id)
            ->line('Customer: ' . $customer->name)
            ->line('Total Amount: ₱' . number_format($this->order->total_amount, 2))
            ->line('Status: ' . ucfirst($this->order->status))
            ->line('Order Date: ' . ($this->order->created_at ? $this->order->created_at->format('F j, Y g:i A') : 'N/A'))
            ->action('View Order', url('/admin/orders/' . $this->order->id))
            ->line('Please review and process this order as soon as possible.');
    }

    public function toArray($notifiable)
    {
        return [
            'order_id' => $this->order->id,
            'type' => 'new_order',
            'customer_name' => $this->order->customer->name,
            'total_amount' => $this->order->total_amount,
            'message' => 'New order #' . $this->order->id . ' from ' . $this->order->customer->name,
            'action_url' => '/admin/orders/' . $this->order->id,
        ];
    }
}
