<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\BroadcastMessage;

class OrderStatusUpdate extends Notification implements ShouldQueue
{
    use Queueable;

    public $orderId;
    public $status;
    public $message;

    public function __construct($orderId, $status, $message)
    {
        $this->orderId = $orderId;
        $this->status = $status;
        $this->message = $message;
    }

    public function via($notifiable)
    {
        return ['database', 'mail'];
    }

    public function toMail($notifiable)
    {
        $mailMessage = (new MailMessage)
            ->subject('Order Status Update - Order #' . $this->orderId)
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('Your order status has been updated.')
            ->line('Order Details:')
            ->line('Order ID: #' . $this->orderId)
            ->line('New Status: ' . ucfirst($this->status));

        // Special handling for approved status
        if ($this->status === 'approved') {
            $mailMessage->line('Order Approved and Processing')
                       ->line('Estimated Time of Arrival: Within 48 Hrs');
        } else {
            $mailMessage->line('Message: ' . $this->message);
        }

        return $mailMessage
            ->line('Update Date: ' . now()->format('F j, Y g:i A'))
            ->action('View Order History', url('/customer/orders/history'))
            ->line('Thank you for your business!');
    }

    public function toArray($notifiable)
    {
        $data = [
            'order_id' => $this->orderId,
            'type' => 'order_status_update',
            'status' => $this->status,
            'action_url' => '/customer/orders/history',
        ];

        // Special handling for approved status
        if ($this->status === 'approved') {
            $data['message'] = 'Order Approved and Processing';
            $data['sub_message'] = 'Estimated Time of Arrival: Within 48 Hrs';
        } else {
            $data['message'] = $this->message;
        }

        return $data;
    }
}
