<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use App\Models\Sales;

class OrderRejectionNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $order;

    public function __construct(Sales $order)
    {
        $this->order = $order;
    }

    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable)
    {
        $order = $this->order;
        $customer = $order->customer;
        $admin = $order->admin;
        
        return (new MailMessage)
            ->subject('Order Update - Order #' . $order->id . ' (Declined)')
            ->greeting('Hello ' . $customer->name . '!')
            ->line('We regret to inform you that your order has been declined.')
            ->line('Order Details:')
            ->line('Order ID: #' . $order->id)
            ->line('Total Amount: ₱' . number_format($order->total_amount, 2))
            ->line('Status: Declined')
            ->line('Declined by: ' . ($admin->name ?? 'System Admin'))
            ->line('Date: ' . ($order->updated_at ? $order->updated_at->format('F j, Y g:i A') : 'N/A'))
            ->when($order->admin_notes, function ($message) {
                return $message->line('Reason: ' . $this->order->admin_notes);
            })
            ->line('What happens next?')
            ->line('• Your payment (if any) will be refunded within 3-5 business days')
            ->line('• You can place a new order with different items')
            ->line('• Contact our support team if you have any questions')
            ->view('emails.order-rejection', [
                'order' => $order,
                'customer' => $customer,
                'admin' => $admin,
            ])
            ->action('View Order History', url('/customer/orders/history'))
            ->line('We apologize for any inconvenience and thank you for your understanding.');
    }

    public function toArray($notifiable)
    {
        return [
            'order_id' => $this->order->id,
            'type' => 'order_rejection',
            'message' => 'Order #' . $this->order->id . ' has been declined',
            'reason' => $this->order->admin_notes,
        ];
    }
}
