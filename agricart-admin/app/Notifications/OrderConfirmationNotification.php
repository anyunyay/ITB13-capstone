<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use App\Models\SalesAudit;

class OrderConfirmationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $order;

    public function __construct(SalesAudit $order)
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
            ->subject('Order Confirmed - Order #' . $this->order->id)
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('Thank you for your order! Your order has been confirmed.')
            ->line('Estimated Approval Time: 24Hrs')
            ->line('Order Details:')
            ->line('Order ID: #' . $this->order->id)
            ->line('Total Amount: ₱' . number_format($this->order->total_amount, 2))
            ->line('Status: ' . ucfirst($this->order->status))
            ->line('Order Date: ' . ($this->order->created_at ? $this->order->created_at->format('F j, Y g:i A') : 'N/A'))
            ->action('View Order History', url('/customer/orders/history'))
            ->line('We will notify you when your order status changes.');
    }

    public function toArray($notifiable)
    {
        return [
            'order_id' => $this->order->id,
            'type' => 'order_confirmation',
            'total_amount' => $this->order->total_amount,
            'status' => $this->order->status,
            'message' => 'Order Confirmed',
            'sub_message' => 'Estimated Approval Time: 24Hrs',
            'action_url' => '/customer/orders/history',
        ];
    }
}
