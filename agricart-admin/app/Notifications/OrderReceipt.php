<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use App\Models\Sales;

class OrderReceipt extends Notification implements ShouldQueue
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
            ->subject('🎉 Order Approved & Receipt - Order #' . $order->id)
            ->greeting('Hello ' . $customer->name . '!')
            ->line('🎉 Great news! Your order has been approved and is now being processed.')
            ->line('📋 Order Details:')
            ->line('Order ID: #' . $order->id)
            ->line('Total Amount: ₱' . number_format($order->total_amount, 2))
            ->line('Status: ✅ Approved')
            ->line('Approved by: ' . ($admin->name ?? 'System Admin'))
            ->line('Approval Date: ' . ($order->updated_at ? $order->updated_at->format('F j, Y g:i A') : 'N/A'))
            ->when($order->admin_notes, function ($message) {
                return $message->line('Admin Notes: ' . $this->order->admin_notes);
            })
            ->line('📦 What happens next?')
            ->line('• Your order is being prepared for delivery')
            ->line('• A logistic provider will be assigned soon')
            ->line('• You will receive delivery updates via email')
            ->line('• Estimated delivery: Within 48 hours')
            ->view('emails.order-receipt', [
                'order' => $order,
                'customer' => $customer,
                'admin' => $admin,
            ])
            ->action('Track Your Order', url('/customer/orders/history'))
            ->line('Thank you for choosing AgriCart!');
    }

    public function toArray($notifiable)
    {
        return [
            'order_id' => $this->order->id,
            'type' => 'order_receipt',
            'message' => 'Order receipt sent for order #' . $this->order->id,
        ];
    }
} 