<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;
use App\Models\SalesAudit;

class LogisticOrderReadyNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $order;

    /**
     * Create a new notification instance.
     */
    public function __construct(SalesAudit $order)
    {
        $this->order = $order;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Order Ready for Pickup - Order #' . $this->order->id)
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('A new order is ready for pickup and has been assigned to you.')
            ->line('Order Details:')
            ->line('Order ID: #' . $this->order->id)
            ->line('Customer: ' . $this->order->customer->name)
            ->line('Total Amount: ₱' . number_format($this->order->total_amount, 2))
            ->line('Ready for Pickup: ' . $this->order->delivery_ready_time->format('F j, Y g:i A'))
            ->line('Please collect the order and proceed with delivery.')
            ->action('View Order Details', route('logistic.orders.show', $this->order->id))
            ->line('Thank you for your service!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'order_id' => $this->order->id,
            'type' => 'logistic_order_ready',
            'message_key' => 'logistic_order_ready',
            'message_params' => [
                'order_id' => $this->order->id,
            ],
            'action_url' => route('logistic.orders.show', $this->order->id),
            'ready_for_pickup_at' => $this->order->delivery_ready_time?->toISOString(),
            'customer_name' => $this->order->customer->name,
            'total_amount' => $this->order->total_amount,
        ];
    }

    /**
     * Get the broadcastable representation of the notification.
     */
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'order_id' => $this->order->id,
            'type' => 'logistic_order_ready',
            'message' => 'Order #' . $this->order->id . ' is ready for pickup. Please collect it before proceeding to delivery.',
        ]);
    }
}
