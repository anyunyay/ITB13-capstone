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
                'numeric',
                'regex:/^9\d{9}$/',
                'unique:users,contact_number,' . Auth::id(),
            ]
        ], [
            'new_phone.required' => 'Please enter a new phone number.',
            'new_phone.numeric' => 'Phone number must be numeric.',
            'new_phone.regex' => 'Please enter a valid Philippine mobile number (9XXXXXXXXX).',
            'new_phone.unique' => 'This phone number is already in use.',
        ]);
    }

    /**
     * Override sendOtp to add additional phone number validation
     */
    public function sendOtp(Request $request)
    {
        try {
            /** @var \App\Models\User $user */
            $user = Auth::user();
            
            if (!$user) {
                return $this->jsonResponse([
                    'success' => false,
                    'message' => 'Authentication required.'
                ], 401);
            }
            
            // First, validate the phone number format and uniqueness
            $validator = $this->validateNewValue($request);

            if ($validator->fails()) {
                return $this->jsonResponse([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $newPhone = $request->input('new_phone');
            
            // Additional check: Ensure the phone number doesn't exist in any format
            $existingUser = \App\Models\User::where('contact_number', $newPhone)
                ->orWhere('contact_number', '+63' . $newPhone)
                ->orWhere('contact_number', '0' . $newPhone)
                ->where('id', '!=', $user->id)
                ->first();

            if ($existingUser) {
                return $this->jsonResponse([
                    'success' => false,
                    'errors' => [
                        'new_phone' => 'This phone number is already in use by another user.'
                    ]
                ], 422);
            }

            // Call parent sendOtp method to continue with the OTP process
            return parent::sendOtp($request);
            
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Phone change OTP error: ' . $e->getMessage());
            return $this->jsonResponse([
                'success' => false,
                'message' => 'Failed to send verification code. Please try again.'
            ], 500);
        }
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
