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
        return ['database'];
    }

    public function toArray($notifiable)
    {
        return [
            'order_id' => $this->orderId,
            'status' => $this->status,
            'message' => $this->message,
        ];
    }
}
