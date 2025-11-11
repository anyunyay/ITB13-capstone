<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use App\Models\Stock;
use App\Models\User;

class StockAddedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $stock;
    public $addedBy;

    public function __construct(Stock $stock, User $addedBy)
    {
        $this->stock = $stock;
        $this->addedBy = $addedBy;
    }

    public function via($notifiable)
    {
        return ['database', 'mail'];
    }

    public function toMail($notifiable)
    {
        $product = $this->stock->product;
        
        return (new MailMessage)
            ->subject('New Stock Added to Your Account')
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('New stock has been added to your account.')
            ->line('Stock Details:')
            ->line('Product: ' . $product->name)
            ->line('Quantity: ' . $this->stock->quantity . ' ' . $this->stock->category)
            ->line('Added by: ' . $this->addedBy->name . ' (' . ucfirst($this->addedBy->type) . ')')
            ->line('Date Added: ' . $this->stock->created_at->format('F j, Y g:i A'))
            ->action('View Your Stocks', url('/member/all-stocks'))
            ->line('Thank you for being part of our cooperative!');
    }

    public function toArray($notifiable)
    {
        return [
            'stock_id' => $this->stock->id,
            'product_id' => $this->stock->product_id,
            'type' => 'stock_added',
            'product_name' => $this->stock->product->name,
            'quantity' => $this->stock->quantity,
            'category' => $this->stock->category,
            'added_by' => $this->addedBy->name,
            'added_by_type' => $this->addedBy->type,
            'message' => $this->addedBy->name . ' added ' . $this->stock->quantity . ' ' . $this->stock->category . ' of ' . $this->stock->product->name . ' to your stock',
            'action_url' => '/member/all-stocks?view=stocks&highlight_product=' . $this->stock->product_id . '&highlight_category=' . urlencode($this->stock->category),
        ];
    }
}
