<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EmailChangeOtpNotification extends Notification
{
    use Queueable;

    public $otp;
    public $newEmail;
    public $currentEmail;

    /**
     * Create a new notification instance.
     */
    public function __construct(string $otp, string $newEmail, string $currentEmail)
    {
        $this->otp = $otp;
        $this->newEmail = $newEmail;
        $this->currentEmail = $currentEmail;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Email Change Verification Code - AgriCart')
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('You have requested to change your email address from **' . $this->currentEmail . '** to **' . $this->newEmail . '**')
            ->line('For security purposes, we have sent this verification code to your current email address.')
            ->line('Please use the following verification code to complete your email change:')
            ->line('## **' . $this->otp . '**')
            ->line('This code will expire in 15 minutes.')
            ->line('If you did not request this email change, please ignore this message and your email will remain unchanged.')
            ->line('Thank you for using AgriCart!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'otp' => $this->otp,
            'new_email' => $this->newEmail,
            'current_email' => $this->currentEmail,
        ];
    }
}
