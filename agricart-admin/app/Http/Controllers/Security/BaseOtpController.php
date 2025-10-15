<?php

namespace App\Http\Controllers\Security;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

abstract class BaseOtpController extends \App\Http\Controllers\Controller
{
    /**
     * Get the appropriate profile route for the authenticated user type
     */
    protected function getProfileRoute(): string
    {
        $user = Auth::user();
        
        return match ($user->type) {
            'admin', 'staff' => 'admin.profile.info',
            'customer' => 'customer.profile.info',
            'logistic' => 'logistic.profile.info',
            'member' => 'member.profile.info',
            default => 'customer.profile.info',
        };
    }

    /**
     * Get the OTP request model class name
     */
    abstract protected function getOtpRequestModel(): string;

    /**
     * Get the notification class name for sending OTP
     */
    abstract protected function getOtpNotificationClass(): string;

    /**
     * Get the verification type name (e.g., 'email', 'phone')
     */
    abstract protected function getVerificationType(): string;

    /**
     * Get the field name for the new value (e.g., 'new_email', 'new_phone')
     */
    abstract protected function getNewValueFieldName(): string;

    /**
     * Get the user field name to update (e.g., 'email', 'contact_number')
     */
    abstract protected function getUserFieldName(): string;

    /**
     * Validate the new value input
     */
    abstract protected function validateNewValue(Request $request): \Illuminate\Contracts\Validation\Validator;

    /**
     * Send OTP for verification.
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
            
            $validator = $this->validateNewValue($request);

            if ($validator->fails()) {
                return $this->jsonResponse([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $newValue = $request->input($this->getNewValueFieldName());

            // Check if the new value is different from current value
            $currentValue = $user->{$this->getUserFieldName()};
            
            // For phone numbers, normalize both values for comparison
            if ($this->getVerificationType() === 'phone number') {
                // Current value is stored as +639XXXXXXXXX, normalize to 9XXXXXXXXX
                $normalizedCurrent = preg_replace('/^\+63/', '', $currentValue);
                $normalizedNew = preg_replace('/^0/', '', $newValue);
                
                if ($normalizedNew === $normalizedCurrent) {
                    return $this->jsonResponse([
                        'success' => false,
                        'errors' => [
                            $this->getNewValueFieldName() => "The new {$this->getVerificationType()} must be different from your current {$this->getVerificationType()}."
                        ]
                    ], 422);
                }
            } else {
                // For email, direct comparison
                if ($newValue === $currentValue) {
                    return $this->jsonResponse([
                        'success' => false,
                        'errors' => [
                            $this->getNewValueFieldName() => "The new {$this->getVerificationType()} must be different from your current {$this->getVerificationType()}."
                        ]
                    ], 422);
                }
            }

            // Create OTP request
            $otpRequestModel = $this->getOtpRequestModel();
            $otpRequest = $otpRequestModel::createForUser($user->id, $newValue);

            // Send OTP notification
            try {
                $notificationClass = $this->getOtpNotificationClass();
                $user->notify(new $notificationClass($otpRequest->otp, $newValue));
            } catch (\Exception $e) {
                Log::error("Failed to send {$this->getVerificationType()} OTP", [
                    'error' => $e->getMessage(),
                    'user_id' => $user->id,
                    'user_type' => $user->type,
                    'new_value' => $newValue
                ]);
                
                return $this->jsonResponse([
                    'success' => false,
                    'errors' => [
                        'general' => 'Failed to send verification code. Please try again.'
                    ]
                ], 500);
            }

            return $this->jsonResponse([
                'success' => true,
                'message' => "Verification code sent to your new {$this->getVerificationType()}.",
                'otpRequest' => [
                    'id' => $otpRequest->id,
                    'user_id' => $otpRequest->user_id,
                    $this->getNewValueFieldName() => $otpRequest->getVerificationTarget(),
                    'otp' => $otpRequest->otp,
                    'expires_at' => $otpRequest->expires_at,
                    'is_used' => $otpRequest->is_used,
                ]
            ]);

        } catch (\Exception $e) {
            Log::error("{$this->getVerificationType()} change OTP error", [
                'error' => $e->getMessage(),
                'user_type' => Auth::user()?->type,
                'trace' => $e->getTraceAsString()
            ]);
            
            return $this->jsonResponse([
                'success' => false,
                'errors' => [
                    'general' => 'An error occurred while processing your request. Please try again.'
                ]
            ], 500);
        }
    }

    /**
     * Verify the OTP and update the user field.
     */
    public function verifyOtp(Request $request, $requestId)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        
        $validator = Validator::make($request->all(), [
            'otp' => 'required|string|size:6'
        ], [
            'otp.required' => 'Please enter the verification code.',
            'otp.size' => 'Verification code must be 6 digits.',
        ]);

        if ($validator->fails()) {
            return $this->jsonResponse([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $otpRequestModel = $this->getOtpRequestModel();
        $otpRequest = $otpRequestModel::findValidOtp($user->id, $request->otp);

        if (!$otpRequest || $otpRequest->id != $requestId) {
            return $this->jsonResponse([
                'success' => false,
                'errors' => [
                    'otp' => 'Invalid or expired verification code.'
                ]
            ], 422);
        }

        // Update user's field
        $user->{$this->getUserFieldName()} = $otpRequest->getVerificationTarget();
        
        // For email changes, keep email verified since they successfully verified the OTP
        if ($this->getVerificationType() === 'email') {
            $user->email_verified_at = now();
        }
        
        $user->save();

        // Mark the request as used
        $otpRequest->markAsUsed();

        return $this->jsonResponse([
            'success' => true,
            'message' => ucfirst($this->getVerificationType()) . " changed successfully!"
        ]);
    }

    /**
     * Resend OTP.
     */
    public function resendOtp(Request $request, $requestId)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $otpRequestModel = $this->getOtpRequestModel();
        $otpRequest = $otpRequestModel::where('id', $requestId)
            ->where('user_id', $user->id)
            ->where('is_used', false)
            ->first();

        if (!$otpRequest) {
            return $this->jsonResponse([
                'success' => false,
                'errors' => [
                    'general' => 'Invalid verification request.'
                ]
            ], 422);
        }

        // Create a new OTP
        $newOtp = $otpRequestModel::generateOtp();
        $otpRequest->update([
            'otp' => $newOtp,
            'expires_at' => now()->addMinutes(15),
        ]);

        // Send new OTP notification
        $notificationClass = $this->getOtpNotificationClass();
        $user->notify(new $notificationClass($newOtp, $otpRequest->getVerificationTarget()));

        return $this->jsonResponse([
            'success' => true,
            'message' => "New verification code sent to your {$this->getVerificationType()}."
        ]);
    }

    /**
     * Cancel verification request.
     */
    public function cancel(Request $request, $requestId)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $otpRequestModel = $this->getOtpRequestModel();
        $otpRequest = $otpRequestModel::where('id', $requestId)
            ->where('user_id', $user->id)
            ->where('is_used', false)
            ->first();

        if ($otpRequest) {
            $otpRequest->markAsUsed();
        }

        return $this->jsonResponse([
            'success' => true,
            'message' => ucfirst($this->getVerificationType()) . " change request cancelled."
        ]);
    }

    /**
     * Helper method to return JSON response for modal requests
     */
    protected function jsonResponse(array $data, int $status = 200)
    {
        return response()->json($data, $status);
    }
}
