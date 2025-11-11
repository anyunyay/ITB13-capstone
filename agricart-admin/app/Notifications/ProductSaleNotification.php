<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use App\Models\Stock;

class ProductSaleNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $stock;
    public $sale;
    public $customer;
    public $auditTrail;

    public function __construct(Stock $stock, $sale, $customer, $auditTrail = null)
    {
        $this->stock = $stock;
        $this->sale = $sale;
        $this->customer = $customer;
        $this->auditTrail = $auditTrail;
    }

    public function via($notifiable)
    {
        return ['database', 'mail'];
    }

    public function toMail($notifiable)
    {
        $product = $this->stock->product;
        
        // Build action URL with highlight parameter if available
        $actionUrl = '/member/all-stocks?view=transactions';
        if ($this->auditTrail && $this->auditTrail->id) {
            $actionUrl .= '&highlight_transaction=' . $this->auditTrail->id;
        }
        
        return (new MailMessage)
            ->subject('Product Sale Notification')
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('Your product has been sold!')
            ->line('Sale Details:')
            ->line('Product: ' . $product->name)
            ->line('Customer: ' . $this->customer->name)
            ->line('Quantity Sold: ' . $this->stock->quantity)
            ->line('Sale Date: ' . now()->format('F j, Y g:i A'))
            ->action('View Transaction', url($actionUrl))
            ->line('Thank you for using our platform!');
    }

    public function toArray($notifiable)
    {
        $actionUrl = '/member/all-stocks?view=transactions';
        
        // If we have an audit trail ID, add it to highlight the transaction
        if ($this->auditTrail && $this->auditTrail->id) {
            $actionUrl .= '&highlight_transaction=' . $this->auditTrail->id;
        }
        
        return [
            'stock_id' => $this->stock->id,
            'sale_id' => $this->sale->id,
            'audit_trail_id' => $this->auditTrail ? $this->auditTrail->id : null,
            'type' => 'product_sale',
            'product_name' => $this->stock->product->name,
            'customer_name' => $this->customer->name,
            'quantity_sold' => $this->stock->quantity,
            'message' => 'Your product ' . $this->stock->product->name . ' was sold to ' . $this->customer->name,
            'action_url' => $actionUrl,
        ];
    }
}
