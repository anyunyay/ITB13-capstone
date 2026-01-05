<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use App\Models\Stock;
use App\Models\User;

class StockRemovedNotification extends Notification
{
    use Queueable;

    public $stock;
    public $quantityRemoved;
    public $reason;
    public $removedBy;

    public function __construct(Stock $stock, float $quantityRemoved, string $reason, User $removedBy)
    {
        $this->stock = $stock;
        $this->quantityRemoved = $quantityRemoved;
        $this->reason = $reason;
        $this->removedBy = $removedBy;
    }

    public function via($notifiable)
    {
        return ['database', 'mail'];
    }

    public function toMail($notifiable)
    {
        $product = $this->stock->product;
        
        return (new MailMessage)
            ->subject('Stock Removal Notice')
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('Some of your stock has been removed from the system.')
            ->line('Stock Removal Details:')
            ->line('Product: ' . $product->name)
            ->line('Quantity Removed: ' . $this->quantityRemoved . ' ' . $this->stock->category)
            ->line('Reason: ' . $this->reason)
            ->line('Remaining Quantity: ' . $this->stock->quantity . ' ' . $this->stock->category)
            ->line('Removed by: ' . $this->removedBy->name . ' (' . ucfirst($this->removedBy->type) . ')')
            ->line('Date: ' . now()->format('F j, Y g:i A'))
            ->action('View Your Stocks', url('/member/all-stocks'))
            ->line('If you have any questions about this removal, please contact the administrator.');
    }

    public function toArray($notifiable)
    {
        return [
            'stock_id' => $this->stock->id,
            'product_id' => $this->stock->product_id,
            'type' => 'stock_removed',
            'message_key' => 'stock_removed',
            'message_params' => [
                'product_name' => $this->stock->product->name,
                'quantity_removed' => $this->quantityRemoved,
                'category' => $this->stock->category,
                'reason' => $this->reason,
            ],
            'product_name' => $this->stock->product->name,
            'quantity_removed' => $this->quantityRemoved,
            'remaining_quantity' => $this->stock->quantity,
            'category' => $this->stock->category,
            'reason' => $this->reason,
            'removed_by' => $this->removedBy->name,
            'removed_by_type' => $this->removedBy->type,
            'action_url' => '/member/all-stocks?view=stocks&highlight_product=' . $this->stock->product_id . '&highlight_category=' . urlencode($this->stock->category),
        ];
    }
}
