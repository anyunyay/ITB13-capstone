<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EmailChangeOtpNotification extends Notification
{
    use Queueable;

    protected $otp;
    protected $newEmail;

    /**
     * Create a new notification instance.
     */
    public function __construct(string $otp, string $newEmail)
    {
        $this->otp = $otp;
        $this->newEmail = $newEmail;
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
            ->subject('Email Change Verification Code')
            ->greeting('Hello!')
            ->line('You have requested to change your email address to: **' . $this->newEmail . '**')
            ->line('Your verification code is:')
            ->line('## **' . $this->otp . '**')
            ->line('This code will expire in 30 seconds.')
            ->line('If you did not request this email change, please ignore this message.')
            ->salutation('Thank you for using our application!');
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
        ];
    }
}
