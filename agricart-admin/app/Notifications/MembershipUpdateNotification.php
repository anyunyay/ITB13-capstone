<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use App\Models\User;

class MembershipUpdateNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $member;
    public $action;

    public function __construct(User $member, $action)
    {
        $this->member = $member;
        $this->action = $action;
    }

    public function via($notifiable)
    {
        return ['database', 'mail'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Membership Update - ' . ucfirst($this->action))
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('A membership update has been made that requires your attention.')
            ->line('Update Details:')
            ->line('Member: ' . $this->member->name)
            ->line('Member ID: ' . ($this->member->member_id ?? 'N/A'))
            ->line('Contact: ' . ($this->member->contact_number ?? 'N/A'))
            ->line('Action: ' . ucfirst($this->action))
            ->line('Update Date: ' . now()->format('F j, Y g:i A'))
            ->action('View Members', url('/admin/membership'))
            ->line('Please review this membership update.');
    }

    public function toArray($notifiable)
    {
        return [
            'member_id' => $this->member->id,
            'member_identifier' => $this->member->member_id ?? 'N/A',
            'type' => 'membership_update',
            'action' => $this->action,
            'message_key' => 'membership_update_' . $this->action,
            'message_params' => [
                'member_name' => $this->member->name,
            ],
            'member_name' => $this->member->name,
            'member_contact' => $this->member->contact_number ?? 'N/A',
            'action_url' => '/admin/membership',
        ];
    }
}
