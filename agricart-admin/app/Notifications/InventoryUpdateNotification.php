<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use App\Models\Stock;

class InventoryUpdateNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $stock;
    public $action;
    public $member;

    public function __construct(Stock $stock, $action, $member = null)
    {
        $this->stock = $stock;
        $this->action = $action;
        $this->member = $member;
    }

    public function via($notifiable)
    {
        return ['database', 'mail'];
    }

    public function toMail($notifiable)
    {
        $product = $this->stock->product;
        $member = $this->member ?? $this->stock->member;
        
        return (new MailMessage)
            ->subject('Inventory Update - ' . ucfirst($this->action))
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('An inventory update has been made that requires your attention.')
            ->line('Update Details:')
            ->line('Product: ' . $product->name)
            ->line('Member: ' . $member->name)
            ->line('Quantity: ' . $this->stock->quantity)
            ->line('Action: ' . ucfirst($this->action))
            ->line('Update Date: ' . now()->format('F j, Y g:i A'))
            ->action('View Inventory', url('/admin/inventory'))
            ->line('Please review this inventory update.');
    }

    public function toArray($notifiable)
    {
        return [
            'stock_id' => $this->stock->id,
            'product_id' => $this->stock->product_id,
            'type' => 'inventory_update',
            'action' => $this->action,
            'message_key' => 'inventory_update_' . $this->action,
            'message_params' => [
                'product_name' => $this->stock->product->name,
                'member_name' => ($this->member ?? $this->stock->member)->name,
            ],
            'product_name' => $this->stock->product->name,
            'member_name' => ($this->member ?? $this->stock->member)->name,
            'quantity' => $this->stock->quantity,
            'action_url' => '/admin/inventory',
        ];
    }
}
