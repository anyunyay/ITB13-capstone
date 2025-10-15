<?php

namespace App\Http\Controllers\Security;

use App\Models\EmailChangeRequest;
use App\Models\User;
use App\Notifications\EmailChangeOtpNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class EmailChangeController extends BaseOtpController
{
    /**
     * Get the OTP request model class name
     */
    protected function getOtpRequestModel(): string
    {
        return EmailChangeRequest::class;
    }

    /**
     * Get the notification class name for sending OTP
     */
    protected function getOtpNotificationClass(): string
    {
        return EmailChangeOtpNotification::class;
    }

    /**
     * Get the verification type name
     */
    protected function getVerificationType(): string
    {
        return 'email';
    }

    /**
     * Get the field name for the new value
     */
    protected function getNewValueFieldName(): string
    {
        return 'new_email';
    }

    /**
     * Get the user field name to update
     */
    protected function getUserFieldName(): string
    {
        return 'email';
    }

    /**
     * Validate the new email input
     */
    protected function validateNewValue(Request $request): \Illuminate\Contracts\Validation\Validator
    {
        return Validator::make($request->all(), [
            'new_email' => [
                'required',
                'email',
                'max:255',
                'unique:users,email,' . Auth::id(),
            ]
        ], [
            'new_email.required' => 'Please enter a new email address.',
            'new_email.email' => 'Please enter a valid email address.',
            'new_email.unique' => 'This email address is already in use.',
        ]);
    }

    /**
     * Show the OTP verification page.
     * This method is kept for backward compatibility but redirects to profile page.
     */
    public function showVerify(Request $request, $requestId)
    {
        /** @var User $user */
        $user = Auth::user();
        $emailChangeRequest = EmailChangeRequest::where('id', $requestId)
            ->where('user_id', $user->id)
            ->where('is_used', false)
            ->first();

        if (!$emailChangeRequest) {
            return redirect()->route($this->getProfileRoute())
                ->with('error', 'Invalid or expired verification request.');
        }

        if ($emailChangeRequest->isExpired()) {
            return redirect()->route($this->getProfileRoute())
                ->with('error', 'Verification code has expired. Please request a new one.');
        }

        // Redirect to profile page with a message to use the modal
        return redirect()->route($this->getProfileRoute())
            ->with('message', 'Please use the email change modal to verify your new email address.');
    }
}
