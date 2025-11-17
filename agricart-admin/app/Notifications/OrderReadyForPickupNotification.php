<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;
use App\Models\SalesAudit;

class OrderReadyForPickupNotification extends Notification implements ShouldQueue
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
            ->line('Great news! Your order is now ready for pickup.')
            ->line('Order Details:')
            ->line('Order ID: #' . $this->order->id)
            ->line('Total Amount: ₱' . number_format($this->order->total_amount, 2))
            ->line('Ready for Pickup: ' . $this->order->ready_for_pickup_at->format('F j, Y g:i A'))
            ->line('Your order has been prepared and is ready for pickup. Please contact your assigned logistics provider to arrange delivery.')
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
            'type' => 'order_ready_for_pickup',
            'message_key' => 'order_ready_for_pickup',
            'message_params' => [
                'order_id' => $this->order->id,
            ],
            'action_url' => '/customer/orders/history',
            'ready_for_pickup_at' => $this->order->ready_for_pickup_at,
        ];
    }

    /**
     * Get the broadcastable representation of the notification.
     */
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'order_id' => $this->order->id,
            'type' => 'order_ready_for_pickup',
            'message' => 'Your order #' . $this->order->id . ' is ready for pickup!',
        ]);
    }
}
