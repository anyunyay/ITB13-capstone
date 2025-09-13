<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\BroadcastMessage;

class DeliveryStatusUpdate extends Notification implements ShouldQueue
{
    use Queueable;

    public $orderId;
    public $deliveryStatus;
    public $message;

    public function __construct($orderId, $deliveryStatus, $message)
    {
        $this->orderId = $orderId;
        $this->deliveryStatus = $deliveryStatus;
        $this->message = $message;
    }

    public function via($notifiable)
    {
        return ['database', 'mail'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Delivery Status Update - Order #' . $this->orderId)
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('Your delivery status has been updated.')
            ->line('Delivery Details:')
            ->line('Order ID: #' . $this->orderId)
            ->line('Delivery Status: ' . ucfirst(str_replace('_', ' ', $this->deliveryStatus)))
            ->line('Message: ' . $this->message)
            ->line('Update Date: ' . now()->format('F j, Y g:i A'))
            ->action('View Order', url('/customer/orders/' . $this->orderId))
            ->line('Thank you for your business!');
    }

    public function toArray($notifiable)
    {
        return [
            'order_id' => $this->orderId,
            'type' => 'delivery_status_update',
            'delivery_status' => $this->deliveryStatus,
            'message' => $this->message,
            'action_url' => '/customer/orders/' . $this->orderId,
        ];
    }
} 