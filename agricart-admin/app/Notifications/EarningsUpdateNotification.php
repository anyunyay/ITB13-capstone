<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

class EarningsUpdateNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $amount;
    public $period;
    public $details;

    public function __construct($amount, $period, $details = [])
    {
        $this->amount = $amount;
        $this->period = $period;
        $this->details = $details;
    }

    public function via($notifiable)
    {
        return ['database', 'mail'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Earnings Update')
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('Your earnings have been updated.')
            ->line('Earnings Details:')
            ->line('Amount: ₱' . number_format($this->amount, 2))
            ->line('Period: ' . $this->period)
            ->line('Update Date: ' . now()->format('F j, Y g:i A'))
            ->action('View Dashboard', url('/member/dashboard'))
            ->line('Thank you for your continued partnership!');
    }

    public function toArray($notifiable)
    {
        return [
            'type' => 'earnings_update',
            'message_key' => 'earnings_update',
            'message_params' => [
                'period' => $this->period,
                'amount' => number_format($this->amount, 2),
            ],
            'amount' => $this->amount,
            'period' => $this->period,
            'details' => $this->details,
            'action_url' => '/member/dashboard',
        ];
    }
}
