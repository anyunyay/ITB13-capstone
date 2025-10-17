<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;
use App\Models\SalesAudit;

class OrderPickedUpNotification extends Notification implements ShouldQueue
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
            ->subject('Order Picked Up - Order #' . $this->order->id)
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('Great news! Your order has been picked up and is on its way to you.')
            ->line('Order Details:')
            ->line('Order ID: #' . $this->order->id)
            ->line('Total Amount: ₱' . number_format($this->order->total_amount, 2))
            ->line('Picked Up: ' . now()->format('F j, Y g:i A'))
            ->line('Your order is now in transit and will be delivered to you soon.')
            ->action('View Order Details', url('/customer/orders/history'))
            ->line('Thank you for your business!');
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
            'type' => 'order_picked_up',
            'message' => 'Your order #' . $this->order->id . ' has been picked up and is on its way!',
            'action_url' => '/customer/orders/history',
            'picked_up_at' => now(),
        ];
    }

    /**
     * Get the broadcastable representation of the notification.
     */
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'order_id' => $this->order->id,
            'type' => 'order_picked_up',
            'message' => 'Your order #' . $this->order->id . ' has been picked up and is on its way!',
        ]);
    }
}
