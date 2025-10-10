<?php

namespace App\Http\Controllers;

use App\Models\EmailChangeRequest;
use App\Models\User;
use App\Notifications\EmailChangeOtpNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class EmailChangeController extends Controller
{
    /**
     * Get the appropriate profile route for the authenticated user type
     */
    private function getProfileRoute(): string
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
     * Send OTP for email change.
     */
    public function sendOtp(Request $request)
    {
        try {
            /** @var User $user */
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
                // Return JSON response for modal requests
                if ($request->expectsJson() || $request->header('X-Requested-With') === 'XMLHttpRequest') {
                    return response()->json([
                        'success' => false,
                        'errors' => [
                            'new_email' => 'The new email must be different from your current email.'
                        ]
                    ], 422);
                }
                return back()->withErrors([
                    'new_email' => 'The new email must be different from your current email.'
                ]);
            }

            if ($validator->fails()) {
                // Return JSON response for modal requests
                if ($request->expectsJson() || $request->header('X-Requested-With') === 'XMLHttpRequest') {
                    return response()->json([
                        'success' => false,
                        'errors' => $validator->errors()
                    ], 422);
                }
                return back()->withErrors($validator->errors());
            }

            $newEmail = $request->new_email;

            // Create email change request
            $emailChangeRequest = EmailChangeRequest::createForUser($user->id, $newEmail);

            // Send OTP notification
            try {
                $user->notify(new EmailChangeOtpNotification($emailChangeRequest->otp, $newEmail));
            } catch (\Exception $e) {
                Log::error('Failed to send OTP email', [
                    'error' => $e->getMessage(),
                    'user_id' => $user->id,
                    'user_type' => $user->type,
                    'new_email' => $newEmail
                ]);
                
                // Return JSON response for modal requests
                if ($request->expectsJson() || $request->header('X-Requested-With') === 'XMLHttpRequest') {
                    return response()->json([
                        'success' => false,
                        'errors' => [
                            'general' => 'Failed to send verification email. Please try again.'
                        ]
                    ], 500);
                }
                return back()->withErrors([
                    'general' => 'Failed to send verification email. Please try again.'
                ]);
            }

            // Return JSON response for modal requests
            if ($request->expectsJson() || $request->header('X-Requested-With') === 'XMLHttpRequest') {
                return response()->json([
                    'success' => true,
                    'message' => 'Verification code sent to your new email address.',
                    'emailChangeRequest' => [
                        'id' => $emailChangeRequest->id,
                        'user_id' => $emailChangeRequest->user_id,
                        'new_email' => $emailChangeRequest->new_email,
                        'otp' => $emailChangeRequest->otp,
                        'expires_at' => $emailChangeRequest->expires_at,
                        'is_used' => $emailChangeRequest->is_used,
                    ]
                ]);
            }

            // Return Inertia-compatible response with flash messages
            return back()->with([
                'success' => true,
                'message' => 'Verification code sent to your new email address.',
                'emailChangeRequest' => $emailChangeRequest
            ])->with('flash', [
                'success' => true,
                'message' => 'Verification code sent to your new email address.',
                'emailChangeRequest' => $emailChangeRequest
            ]);
        } catch (\Exception $e) {
            Log::error('Email change OTP error', [
                'error' => $e->getMessage(),
                'user_type' => Auth::user()?->type,
                'trace' => $e->getTraceAsString()
            ]);
            
            // Return JSON response for modal requests
            if ($request->expectsJson() || $request->header('X-Requested-With') === 'XMLHttpRequest') {
                return response()->json([
                    'success' => false,
                    'errors' => [
                        'general' => 'An error occurred while processing your request. Please try again.'
                    ]
                ], 500);
            }
            return back()->withErrors([
                'general' => 'An error occurred while processing your request. Please try again.'
            ]);
        }
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

    /**
     * Verify the OTP and change email.
     */
    public function verifyOtp(Request $request, $requestId)
    {
        /** @var User $user */
        $user = Auth::user();
        
        $validator = Validator::make($request->all(), [
            'otp' => 'required|string|size:6'
        ], [
            'otp.required' => 'Please enter the verification code.',
            'otp.size' => 'Verification code must be 6 digits.',
        ]);

        if ($validator->fails()) {
            // Return JSON response for modal requests
            if ($request->expectsJson() || $request->header('X-Requested-With') === 'XMLHttpRequest') {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }
            return back()->withErrors($validator->errors());
        }

        $emailChangeRequest = EmailChangeRequest::findValidOtp($user->id, $request->otp);
        
        // Debug logging
        Log::info('OTP Verification Debug', [
            'user_id' => $user->id,
            'otp' => $request->otp,
            'otp_length' => strlen($request->otp),
            'request_id' => $requestId,
            'current_time' => now()->toISOString(),
            'found_request' => $emailChangeRequest ? [
                'id' => $emailChangeRequest->id,
                'otp' => $emailChangeRequest->otp,
                'otp_length' => strlen($emailChangeRequest->otp),
                'is_used' => $emailChangeRequest->is_used,
                'expires_at' => $emailChangeRequest->expires_at,
                'is_expired' => $emailChangeRequest->isExpired(),
                'time_until_expiry' => $emailChangeRequest->expires_at->diffInMinutes(now()),
            ] : null,
            'all_user_requests' => EmailChangeRequest::where('user_id', $user->id)
                ->where('is_used', false)
                ->get(['id', 'otp', 'is_used', 'expires_at'])
                ->map(function($req) {
                    return [
                        'id' => $req->id,
                        'otp' => $req->otp,
                        'otp_length' => strlen($req->otp),
                        'is_used' => $req->is_used,
                        'expires_at' => $req->expires_at,
                        'is_expired' => $req->isExpired(),
                        'time_until_expiry' => $req->expires_at->diffInMinutes(now()),
                    ];
                })
                ->toArray()
        ]);

        if (!$emailChangeRequest || $emailChangeRequest->id != $requestId) {
            // Return JSON response for modal requests
            if ($request->expectsJson() || $request->header('X-Requested-With') === 'XMLHttpRequest') {
                return response()->json([
                    'success' => false,
                    'errors' => [
                        'otp' => 'Invalid or expired verification code.'
                    ]
                ], 422);
            }
            return back()->withErrors([
                'otp' => 'Invalid or expired verification code.'
            ]);
        }

        // Update user's email
        $user->email = $emailChangeRequest->new_email;
        $user->email_verified_at = now(); // Keep email verified since they successfully verified the OTP
        $user->save();

        // Mark the request as used
        $emailChangeRequest->markAsUsed();

        // Return JSON response for modal requests
        if ($request->expectsJson() || $request->header('X-Requested-With') === 'XMLHttpRequest') {
            return response()->json([
                'success' => true,
                'message' => 'Email address changed successfully!'
            ]);
        }

        return back()->with([
            'success' => true,
            'message' => 'Email address changed successfully!'
        ])->with('flash', [
            'success' => true,
            'message' => 'Email address changed successfully!'
        ]);
    }

    /**
     * Resend OTP.
     */
    public function resendOtp(Request $request, $requestId)
    {
        /** @var User $user */
        $user = Auth::user();
        $emailChangeRequest = EmailChangeRequest::where('id', $requestId)
            ->where('user_id', $user->id)
            ->where('is_used', false)
            ->first();

        if (!$emailChangeRequest) {
            // Return JSON response for modal requests
            if ($request->expectsJson() || $request->header('X-Requested-With') === 'XMLHttpRequest') {
                return response()->json([
                    'success' => false,
                    'errors' => [
                        'general' => 'Invalid verification request.'
                    ]
                ], 422);
            }
            return back()->withErrors([
                'general' => 'Invalid verification request.'
            ]);
        }

        // Create a new OTP
        $newOtp = EmailChangeRequest::generateOtp();
        $emailChangeRequest->update([
            'otp' => $newOtp,
            'expires_at' => now()->addMinutes(15),
        ]);

        // Send new OTP notification
        $user->notify(new EmailChangeOtpNotification($newOtp, $emailChangeRequest->new_email));

        // Return JSON response for modal requests
        if ($request->expectsJson() || $request->header('X-Requested-With') === 'XMLHttpRequest') {
            return response()->json([
                'success' => true,
                'message' => 'New verification code sent to your email address.'
            ]);
        }

        return back()->with([
            'success' => true,
            'message' => 'New verification code sent to your email address.'
        ])->with('flash', [
            'success' => true,
            'message' => 'New verification code sent to your email address.'
        ]);
    }

    /**
     * Cancel email change request.
     */
    public function cancel(Request $request, $requestId)
    {
        /** @var User $user */
        $user = Auth::user();
        $emailChangeRequest = EmailChangeRequest::where('id', $requestId)
            ->where('user_id', $user->id)
            ->where('is_used', false)
            ->first();

        if ($emailChangeRequest) {
            $emailChangeRequest->markAsUsed();
        }

        // Return JSON response for modal requests
        if ($request->expectsJson() || $request->header('X-Requested-With') === 'XMLHttpRequest') {
            return response()->json([
                'success' => true,
                'message' => 'Email change request cancelled.'
            ]);
        }

        return back()->with([
            'success' => true,
            'message' => 'Email change request cancelled.'
        ])->with('flash', [
            'success' => true,
            'message' => 'Email change request cancelled.'
        ]);
    }
}
