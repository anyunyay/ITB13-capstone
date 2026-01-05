<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\SalesAudit;

class SuspiciousOrderNotification extends Notification
{
    use Queueable;

    protected $order;
    protected $relatedOrders;
    protected $reason;

    public function __construct(SalesAudit $order, array $relatedOrders, string $reason)
    {
        $this->order = $order;
        $this->relatedOrders = $relatedOrders;
        $this->reason = $reason;
    }

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        return [
            'message_key' => 'suspicious_order_detected',
            'order_id' => $this->order->id,
            'customer_id' => $this->order->customer_id,
            'customer_name' => $this->order->customer->name ?? 'Unknown',
            'total_amount' => $this->order->total_amount,
            'reason' => $this->reason,
            'related_orders' => $this->relatedOrders,
            'order_count' => count($this->relatedOrders) + 1,
            'created_at' => $this->order->created_at->toISOString(),
            'hidden_from_header' => false,
        ];
    }
}
