<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\PasswordChangeRequest;

class PasswordChangeRequestNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $passwordChangeRequest;

    /**
     * Create a new notification instance.
     */
    public function __construct(PasswordChangeRequest $passwordChangeRequest)
    {
        $this->passwordChangeRequest = $passwordChangeRequest;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $member = $this->passwordChangeRequest->member;
        $status = $this->passwordChangeRequest->status ?? 'pending';
        
        if ($status === 'cancelled') {
            return (new MailMessage)
                ->subject('Password Change Request Cancelled - Member ID: ' . $member->member_id)
                ->greeting('Hello ' . $notifiable->name . '!')
                ->line('A member has cancelled their password change request.')
                ->line('Request Details:')
                ->line('Member Name: ' . $member->name)
                ->line('Member ID: ' . $member->member_id)
                ->line('Contact Number: ' . ($member->contact_number ?? 'N/A'))
                ->line('Cancelled At: ' . now()->format('F j, Y g:i A'))
                ->action('View Members', url('/admin/membership'))
                ->line('No action is required from you.');
        }
        
        return (new MailMessage)
            ->subject('Password Change Request - Member ID: ' . $member->member_id)
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('A member has requested to change their password and requires your approval.')
            ->line('Request Details:')
            ->line('Member Name: ' . $member->name)
            ->line('Member ID: ' . $member->member_id)
            ->line('Contact Number: ' . ($member->contact_number ?? 'N/A'))
            ->line('Requested At: ' . $this->passwordChangeRequest->requested_at->format('F j, Y g:i A'))
            ->action('Review Request', url('/admin/membership'))
            ->line('Please review and approve this password change request.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $member = $this->passwordChangeRequest->member;
        $status = $this->passwordChangeRequest->status ?? 'pending';
        
        if ($status === 'cancelled') {
            return [
                'request_id' => $this->passwordChangeRequest->id,
                'member_id' => $member->id,
                'type' => 'password_change_request',
                'member_name' => $member->name,
                'member_contact' => $member->contact_number ?? 'N/A',
                'requested_at' => $this->passwordChangeRequest->requested_at->toISOString(),
                'message' => 'Password change request cancelled by ' . $member->name . ' (ID: ' . $member->member_id . ')',
                'action_url' => '/admin/membership',
            ];
        }
        
        return [
            'request_id' => $this->passwordChangeRequest->id,
            'member_id' => $member->id,
            'type' => 'password_change_request',
            'member_name' => $member->name,
            'member_contact' => $member->contact_number ?? 'N/A',
            'requested_at' => $this->passwordChangeRequest->requested_at->toISOString(),
            'message' => 'Password change request from ' . $member->name . ' (ID: ' . $member->member_id . ')',
            'action_url' => '/admin/membership',
        ];
    }
}
