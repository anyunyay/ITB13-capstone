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
        return ['database'];
    }

    public function toArray($notifiable)
    {
        return [
            'order_id' => $this->orderId,
            'delivery_status' => $this->deliveryStatus,
            'message' => $this->message,
        ];
    }
} 