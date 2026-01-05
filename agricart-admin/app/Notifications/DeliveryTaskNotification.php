<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use App\Models\SalesAudit;

class DeliveryTaskNotification extends Notification implements ShouldQueue
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
        $customer = $this->order->customer;
        
        return (new MailMessage)
            ->subject('New Delivery Task Assigned')
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('A new delivery task has been assigned to you.')
            ->line('Delivery Details:')
            ->line('Order ID: #' . $this->order->id)
            ->line('Customer: ' . $customer->name)
            ->line('Customer Address: ' . $customer->address)
            ->line('Total Amount: ₱' . number_format($this->order->total_amount, 2))
            ->line('Assignment Date: ' . now()->format('F j, Y g:i A'))
            ->action('View Delivery Task', url('/logistic/deliveries/' . $this->order->id))
            ->line('Please complete this delivery as soon as possible.');
    }

    public function toArray($notifiable)
    {
        return [
            'order_id' => $this->order->id,
            'type' => 'delivery_task',
            'message_key' => 'delivery_task',
            'message_params' => [
                'order_id' => $this->order->id,
            ],
            'customer_name' => $this->order->customer->name,
            'customer_address' => $this->order->customer->address,
            'total_amount' => $this->order->total_amount,
            'action_url' => '/logistic/deliveries/' . $this->order->id,
        ];
    }
}
