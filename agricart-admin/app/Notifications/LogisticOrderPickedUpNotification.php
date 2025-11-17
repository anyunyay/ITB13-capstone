<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;
use App\Models\SalesAudit;

class LogisticOrderPickedUpNotification extends Notification implements ShouldQueue
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
        // Get delivery address
        $deliveryAddress = $this->order->address 
            ? $this->order->address->street . ', ' . $this->order->address->barangay . ', ' . $this->order->address->city . ', ' . $this->order->address->province
            : ($this->order->customer->defaultAddress 
                ? $this->order->customer->defaultAddress->street . ', ' . $this->order->customer->defaultAddress->barangay . ', ' . $this->order->customer->defaultAddress->city . ', ' . $this->order->customer->defaultAddress->province
                : 'Address not available');

        return (new MailMessage)
            ->subject('Order Pickup Confirmed - Order #' . $this->order->id)
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('The pickup for Order #' . $this->order->id . ' has been confirmed by the admin.')
            ->line('Order Details:')
            ->line('Order ID: #' . $this->order->id)
            ->line('Customer: ' . $this->order->customer->name)
            ->line('Delivery Address: ' . $deliveryAddress)
            ->line('Total Amount: ₱' . number_format($this->order->total_amount, 2))
            ->line('Picked Up: ' . $this->order->delivery_packed_time->format('F j, Y g:i A'))
            ->line('The order is now marked as "Out for Delivery". Please proceed with the delivery to the customer.')
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
        // Get delivery address
        $deliveryAddress = $this->order->address 
            ? $this->order->address->street . ', ' . $this->order->address->barangay . ', ' . $this->order->address->city . ', ' . $this->order->address->province
            : ($this->order->customer->defaultAddress 
                ? $this->order->customer->defaultAddress->street . ', ' . $this->order->customer->defaultAddress->barangay . ', ' . $this->order->customer->defaultAddress->city . ', ' . $this->order->customer->defaultAddress->province
                : 'Address not available');

        return [
            'order_id' => $this->order->id,
            'type' => 'logistic_order_picked_up',
            'message_key' => 'logistic_order_picked_up',
            'message_params' => [
                'order_id' => $this->order->id,
                'customer_name' => $this->order->customer->name,
            ],
            'action_url' => route('logistic.orders.show', $this->order->id),
            'picked_up_at' => $this->order->delivery_packed_time?->toISOString(),
            'customer_name' => $this->order->customer->name,
            'delivery_address' => $deliveryAddress,
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
            'type' => 'logistic_order_picked_up',
            'message' => 'Order #' . $this->order->id . ' pickup confirmed. Please proceed with delivery.',
        ]);
    }
}
