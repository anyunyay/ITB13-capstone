<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use App\Models\Sales;

class OrderDelayedNotification extends Notification implements ShouldQueue
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
        return (new MailMessage)
            ->subject('Order Delayed - Order #' . $this->order->id)
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('We apologize for the delay in processing your order.')
            ->line('Your order has exceeded the standard 24-hour processing time and is currently being reviewed.')
            ->line('Order Details:')
            ->line('Order ID: #' . $this->order->id)
            ->line('Total Amount: ₱' . number_format($this->order->total_amount, 2))
            ->line('Order Date: ' . ($this->order->created_at ? $this->order->created_at->format('F j, Y g:i A') : 'N/A'))
            ->line('If you have any concerns or questions about this delay, please contact us at:')
            ->line('Email: sample@email.com')
            ->line('We appreciate your patience and will process your order as soon as possible.')
            ->action('View Order History', url('/customer/orders/history'))
            ->line('Thank you for your understanding!');
    }

    public function toArray($notifiable)
    {
        return [
            'order_id' => $this->order->id,
            'type' => 'order_delayed',
            'total_amount' => $this->order->total_amount,
            'status' => $this->order->status,
            'message' => 'Your order #' . $this->order->id . ' has been delayed',
            'sub_message' => 'Contact us at sample@email.com if you have concerns',
            'action_url' => '/customer/orders/history',
            'contact_email' => 'sample@email.com',
        ];
    }
}
