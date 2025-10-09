<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\EmailChangeRequest;
use App\Notifications\EmailChangeOtpNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class EmailChangeController extends Controller
{
    /**
     * Show the email change form.
     */
    public function show()
    {
        $user = Auth::user();
        
        return Inertia::render('Customer/Profile/change-email', [
            'user' => $user
        ]);
    }

    /**
     * Send OTP for email change.
     */
    public function sendOtp(Request $request)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Authentication required.'
                ], 401);
            }
            
            $validator = Validator::make($request->all(), [
                'new_email' => [
                    'required',
                    'email',
                    'max:255',
                    'unique:users,email,' . $user->id,
                ]
            ], [
                'new_email.required' => 'Please enter a new email address.',
                'new_email.email' => 'Please enter a valid email address.',
                'new_email.unique' => 'This email address is already in use.',
            ]);

            // Custom validation for different email
            if ($request->new_email === $user->email) {
                return back()->withErrors([
                    'new_email' => 'The new email must be different from your current email.'
                ]);
            }

            if ($validator->fails()) {
                return back()->withErrors($validator->errors());
            }

            $newEmail = $request->new_email;

            // Create email change request
            $emailChangeRequest = EmailChangeRequest::createForUser($user->id, $newEmail);

            // Send OTP notification to current email
            try {
                $user->notify(new EmailChangeOtpNotification($emailChangeRequest->otp, $newEmail, $user->email));
            } catch (\Exception $e) {
                \Log::error('Failed to send OTP email', [
                    'error' => $e->getMessage(),
                    'user_id' => $user->id,
                    'new_email' => $newEmail
                ]);
                
                return back()->withErrors([
                    'general' => 'Failed to send verification email. Please try again.'
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Verification code sent to your current email address.',
                'requestId' => $emailChangeRequest->id,
                'newEmail' => $newEmail,
                'currentEmail' => $user->email
            ]);
        } catch (\Exception $e) {
            \Log::error('Email change OTP error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->withErrors([
                'general' => 'An error occurred while processing your request. Please try again.'
            ]);
        }
    }

    /**
     * Show the OTP verification page.
     */
    public function showVerify(Request $request, $requestId)
    {
        $user = Auth::user();
        $emailChangeRequest = EmailChangeRequest::where('id', $requestId)
            ->where('user_id', $user->id)
            ->where('is_used', false)
            ->first();

        if (!$emailChangeRequest) {
            return redirect()->route('customer.profile.email-change.show')
                ->with('error', 'Invalid or expired verification request.');
        }

        if ($emailChangeRequest->isExpired()) {
            return redirect()->route('customer.profile.email-change.show')
                ->with('error', 'Verification code has expired. Please request a new one.');
        }

        return Inertia::render('Customer/Profile/verify-email-change', [
            'user' => $user,
            'emailChangeRequest' => [
                'id' => $emailChangeRequest->id,
                'new_email' => $emailChangeRequest->new_email,
                'expires_at' => $emailChangeRequest->expires_at->toISOString(),
            ]
        ]);
    }

    /**
     * Verify the OTP and change email.
     */
    public function verifyOtp(Request $request, $requestId)
    {
        $user = Auth::user();
        
        $validator = Validator::make($request->all(), [
            'otp' => 'required|string|size:6'
        ], [
            'otp.required' => 'Please enter the verification code.',
            'otp.size' => 'Verification code must be 6 digits.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $emailChangeRequest = EmailChangeRequest::findValidOtp($user->id, $request->otp);

        if (!$emailChangeRequest || $emailChangeRequest->id != $requestId) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired verification code.'
            ], 422);
        }

        // Update user's email
        $user->email = $emailChangeRequest->new_email;
        $user->email_verified_at = now(); // Keep email verified since they successfully verified the OTP
        $user->save();

        // Mark the request as used
        $emailChangeRequest->markAsUsed();

        return response()->json([
            'success' => true,
            'message' => 'Email address changed successfully!',
            'redirect_url' => route('customer.profile.info')
        ]);
    }

    /**
     * Resend OTP.
     */
    public function resendOtp(Request $request, $requestId)
    {
        $user = Auth::user();
        $emailChangeRequest = EmailChangeRequest::where('id', $requestId)
            ->where('user_id', $user->id)
            ->where('is_used', false)
            ->first();

        if (!$emailChangeRequest) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid verification request.'
            ], 422);
        }

        // Create a new OTP
        $newOtp = EmailChangeRequest::generateOtp();
        $emailChangeRequest->update([
            'otp' => $newOtp,
            'expires_at' => now()->addMinutes(15),
        ]);

        // Send new OTP notification to current email
        $user->notify(new EmailChangeOtpNotification($newOtp, $emailChangeRequest->new_email, $user->email));

        return response()->json([
            'success' => true,
            'message' => 'New verification code sent to your email address.'
        ]);
    }

    /**
     * Cancel email change request.
     */
    public function cancel(Request $request, $requestId)
    {
        $user = Auth::user();
        $emailChangeRequest = EmailChangeRequest::where('id', $requestId)
            ->where('user_id', $user->id)
            ->where('is_used', false)
            ->first();

        if ($emailChangeRequest) {
            $emailChangeRequest->markAsUsed();
        }

        return response()->json([
            'success' => true,
            'message' => 'Email change request cancelled.',
            'redirect_url' => route('customer.profile.info')
        ]);
    }
}
