<?php

namespace App\Http\Controllers;

use App\Models\PhoneChangeRequest;
use App\Notifications\PhoneChangeOtpNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class PhoneChangeController extends BaseOtpController
{
    /**
     * Get the OTP request model class name
     */
    protected function getOtpRequestModel(): string
    {
        return PhoneChangeRequest::class;
    }

    /**
     * Get the notification class name for sending OTP
     */
    protected function getOtpNotificationClass(): string
    {
        return PhoneChangeOtpNotification::class;
    }

    /**
     * Get the verification type name
     */
    protected function getVerificationType(): string
    {
        return 'phone number';
    }

    /**
     * Get the field name for the new value
     */
    protected function getNewValueFieldName(): string
    {
        return 'new_phone';
    }

    /**
     * Get the user field name to update
     */
    protected function getUserFieldName(): string
    {
        return 'contact_number';
    }

    /**
     * Validate the new phone number input
     */
    protected function validateNewValue(Request $request): \Illuminate\Contracts\Validation\Validator
    {
        return Validator::make($request->all(), [
            'new_phone' => [
                'required',
                'string',
                'regex:/^9\d{9}$/',
                'unique:users,contact_number,' . Auth::id(),
            ]
        ], [
            'new_phone.required' => 'Please enter a new phone number.',
            'new_phone.regex' => 'Please enter a valid Philippine mobile number (9XXXXXXXXX).',
            'new_phone.unique' => 'This phone number is already in use.',
        ]);
    }

    /**
     * Show the OTP verification page.
     * This method is kept for backward compatibility but redirects to profile page.
     */
    public function showVerify(Request $request, $requestId)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $otpRequestModel = $this->getOtpRequestModel();
        $otpRequest = $otpRequestModel::where('id', $requestId)
            ->where('user_id', $user->id)
            ->where('is_used', false)
            ->first();

        if (!$otpRequest) {
            return redirect()->route($this->getProfileRoute())
                ->with('error', 'Invalid or expired verification request.');
        }

        if ($otpRequest->isExpired()) {
            return redirect()->route($this->getProfileRoute())
                ->with('error', 'Verification code has expired. Please request a new one.');
        }

        // Redirect to profile page with a message to use the modal
        return redirect()->route($this->getProfileRoute())
            ->with('message', 'Please use the phone change modal to verify your new phone number.');
    }
}
