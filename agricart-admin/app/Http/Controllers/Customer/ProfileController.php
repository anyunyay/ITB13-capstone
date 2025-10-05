<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Illuminate\Support\Facades\File;
use App\Models\EmailChangeRequest;
use App\Notifications\EmailChangeOtpNotification;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class ProfileController extends Controller
{
    /**
     * Display the profile information page.
     */
    public function profile()
    {
        $user = Auth::user();
        
        return Inertia::render('Customer/Profile/profile', [
            'user' => $user
        ]);
    }

    /**
     * Display the address management page.
     */
    public function address()
    {
        $user = Auth::user();
        $addresses = $user->addresses()->orderBy('is_default', 'desc')->orderBy('created_at', 'desc')->get();
        
        return Inertia::render('Customer/Profile/address', [
            'user' => $user,
            'addresses' => $addresses
        ]);
    }

    /**
     * Display the password change page.
     */
    public function password()
    {
        $user = Auth::user();
        
        return Inertia::render('Customer/Profile/password', [
            'user' => $user
        ]);
    }

    /**
     * Display the appearance settings page.
     */
    public function appearance()
    {
        $user = Auth::user();
        
        return Inertia::render('Customer/Profile/appearance', [
            'user' => $user
        ]);
    }

    /**
     * Display the help and support page.
     */
    public function help()
    {
        $user = Auth::user();
        
        return Inertia::render('Customer/Profile/help', [
            'user' => $user
        ]);
    }

    /**
     * Display the logout page.
     */
    public function logoutPage()
    {
        $user = Auth::user();
        
        return Inertia::render('Customer/Profile/logout', [
            'user' => $user
        ]);
    }

    /**
     * Update the customer's profile information.
     */
    public function update(Request $request)
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'contact_number' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'barangay' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'province' => 'nullable|string|max:255',
        ]);

        $user->update($validated);

        return redirect()->back()->with('success', 'Profile updated successfully.');
    }

    /**
     * Change the customer's password.
     */
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $user = Auth::user();

        if (!Hash::check($request->current_password, $user->password)) {
            return back()->withErrors([
                'current_password' => 'The provided password does not match your current password.',
            ]);
        }

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        return redirect()->back()->with('success', 'Password changed successfully.');
    }

    /**
     * Logout the customer.
     */
    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }

    /**
     * Upload or update the customer's avatar.
     */
    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $user = Auth::user();

        // Delete old avatar if exists
        if ($user->avatar) {
            $oldAvatarPath = public_path($user->avatar);
            if (File::exists($oldAvatarPath)) {
                File::delete($oldAvatarPath);
            }
        }

        // Upload new avatar
        if ($request->file('avatar')) {
            $avatar = $request->file('avatar');
            $avatarName = 'avatar_' . $user->id . '_' . time() . '.' . $avatar->getClientOriginalExtension();
            $avatar->move(public_path('images/avatars/'), $avatarName);
            
            $user->update([
                'avatar' => 'images/avatars/' . $avatarName,
            ]);
        }

        return redirect()->back()->with('success', 'Profile picture updated successfully.');
    }

    /**
     * Delete the customer's avatar.
     */
    public function deleteAvatar(Request $request)
    {
        $user = Auth::user();

        if ($user->avatar) {
            $avatarPath = public_path($user->avatar);
            if (File::exists($avatarPath)) {
                File::delete($avatarPath);
            }

            $user->update([
                'avatar' => null,
            ]);
        }

        return redirect()->back()->with('success', 'Profile picture removed successfully.');
    }


    /**
     * Send a help/support message.
     */
    public function sendHelpMessage(Request $request)
    {
        // TODO: Implement help message functionality
        return redirect()->back()->with('info', 'Help message functionality coming soon.');
    }

    /**
     * Request email change by sending OTP to new email.
     */
    public function requestEmailChange(Request $request)
    {
        $user = Auth::user();
        
        // Log the incoming request
        Log::info('Email change request received', [
            'user_id' => $user->id,
            'current_email' => $user->email,
            'new_email' => $request->new_email,
            'request_data' => $request->all()
        ]);
        
        $request->validate([
            'new_email' => 'required|email|max:255|unique:users,email',
        ]);

        // Additional validation to ensure new email is different from current
        if ($request->new_email === $user->email) {
            Log::warning('User tried to use same email', [
                'user_id' => $user->id,
                'email' => $user->email
            ]);
            return back()->withErrors([
                'new_email' => ['The new email must be different from your current email.']
            ]);
        }

        $newEmail = $request->new_email;

        // Check if there's already a pending request for this user
        $existingRequest = EmailChangeRequest::where('user_id', $user->id)
            ->where('verified', false)
            ->where('expires_at', '>', now())
            ->first();

        if ($existingRequest) {
            return back()->withErrors([
                'error' => 'You already have a pending email change request. Please wait for it to expire or verify the existing OTP.'
            ]);
        }

        // Generate OTP and create request
        $otp = EmailChangeRequest::generateOtp();
        $expiresAt = Carbon::now()->addSeconds(30);

        $emailChangeRequest = EmailChangeRequest::create([
            'user_id' => $user->id,
            'new_email' => $newEmail,
            'otp' => $otp,
            'expires_at' => $expiresAt,
            'verified' => false,
        ]);

        // Send OTP to new email address
        try {
            // Create a temporary user object for the new email to send notification
            $tempUser = new \App\Models\User();
            $tempUser->email = $newEmail;
            $tempUser->name = $user->name;
            
            Log::info('Attempting to send OTP email', [
                'user_id' => $user->id,
                'new_email' => $newEmail,
                'request_id' => $emailChangeRequest->id,
                'otp' => $otp
            ]);
            
            $tempUser->notify(new EmailChangeOtpNotification($otp, $newEmail));
            
            Log::info('OTP email sent successfully', [
                'user_id' => $user->id,
                'new_email' => $newEmail,
                'request_id' => $emailChangeRequest->id
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send OTP email', [
                'user_id' => $user->id,
                'new_email' => $newEmail,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            $emailChangeRequest->delete();
            return back()->withErrors([
                'error' => 'Failed to send OTP. Please check the email address and try again. Error: ' . $e->getMessage()
            ]);
        }

        return redirect()->route('customer.profile.email.verify', [
            'request_id' => $emailChangeRequest->id,
            'new_email' => $newEmail
        ])->with([
            'message' => 'OTP sent successfully to ' . $newEmail . '. Please check your email.'
        ]);
    }

    /**
     * Show OTP verification page.
     */
    public function showOtpVerification(Request $request)
    {
        $requestId = $request->query('request_id');
        $newEmail = $request->query('new_email');
        
        if (!$requestId || !$newEmail) {
            return redirect()->route('customer.profile.info')->withErrors([
                'error' => 'Invalid verification request. Please start the email change process again.'
            ]);
        }

        $emailChangeRequest = EmailChangeRequest::find($requestId);
        $user = Auth::user();

        // Verify ownership
        if (!$emailChangeRequest || $emailChangeRequest->user_id !== $user->id) {
            return redirect()->route('customer.profile.info')->withErrors([
                'error' => 'Invalid verification request.'
            ]);
        }

        // Check if already verified
        if ($emailChangeRequest->verified) {
            return redirect()->route('customer.profile.email.confirm', [
                'request_id' => $requestId,
                'new_email' => $newEmail
            ]);
        }

        // Check if expired
        if ($emailChangeRequest->isExpired()) {
            return redirect()->route('customer.profile.info')->withErrors([
                'error' => 'Verification request has expired. Please start the process again.'
            ]);
        }

        $expiresIn = $emailChangeRequest->expires_at->diffInSeconds(now());

        return Inertia::render('Customer/Profile/otp-verification', [
            'user' => $user,
            'newEmail' => $newEmail,
            'requestId' => (int) $requestId,
            'expiresIn' => max(0, $expiresIn),
        ]);
    }

    /**
     * Show email change confirmation page.
     */
    public function showEmailConfirmation(Request $request)
    {
        $requestId = $request->query('request_id');
        $newEmail = $request->query('new_email');
        
        if (!$requestId || !$newEmail) {
            return redirect()->route('customer.profile.info')->withErrors([
                'error' => 'Invalid confirmation request. Please start the email change process again.'
            ]);
        }

        $emailChangeRequest = EmailChangeRequest::find($requestId);
        $user = Auth::user();

        // Verify ownership and verification status
        if (!$emailChangeRequest || $emailChangeRequest->user_id !== $user->id || !$emailChangeRequest->verified) {
            return redirect()->route('customer.profile.info')->withErrors([
                'error' => 'Invalid or unverified request.'
            ]);
        }

        // Check if expired
        if ($emailChangeRequest->isExpired()) {
            return redirect()->route('customer.profile.info')->withErrors([
                'error' => 'Request has expired. Please start the process again.'
            ]);
        }

        return Inertia::render('Customer/Profile/email-confirmation', [
            'user' => $user,
            'newEmail' => $newEmail,
            'requestId' => (int) $requestId,
        ]);
    }

    /**
     * Verify OTP for email change request.
     */
    public function verifyOtp(Request $request)
    {
        Log::info('OTP verification request received', [
            'request_id' => $request->request_id,
            'otp_length' => strlen($request->otp),
            'user_id' => Auth::id()
        ]);

        $request->validate([
            'request_id' => 'required|integer|exists:email_change_requests,id',
            'otp' => 'required|string|size:6',
        ]);

        $emailChangeRequest = EmailChangeRequest::findOrFail($request->request_id);
        $user = Auth::user();

        Log::info('Email change request found', [
            'request_id' => $emailChangeRequest->id,
            'user_id' => $emailChangeRequest->user_id,
            'new_email' => $emailChangeRequest->new_email,
            'verified' => $emailChangeRequest->verified,
            'expires_at' => $emailChangeRequest->expires_at,
            'is_expired' => $emailChangeRequest->isExpired()
        ]);

        // Verify ownership
        if ($emailChangeRequest->user_id !== $user->id) {
            Log::warning('OTP verification failed - ownership mismatch', [
                'request_user_id' => $emailChangeRequest->user_id,
                'current_user_id' => $user->id
            ]);
            return back()->withErrors([
                'error' => 'Invalid request.'
            ]);
        }

        // Check if already verified
        if ($emailChangeRequest->verified) {
            Log::warning('OTP verification failed - already verified', [
                'request_id' => $emailChangeRequest->id
            ]);
            return back()->withErrors([
                'error' => 'This request has already been verified.'
            ]);
        }

        // Verify OTP
        if (!$emailChangeRequest->isValidOtp($request->otp)) {
            Log::warning('OTP verification failed - invalid OTP', [
                'request_id' => $emailChangeRequest->id,
                'provided_otp' => $request->otp,
                'stored_otp' => $emailChangeRequest->otp,
                'is_expired' => $emailChangeRequest->isExpired()
            ]);
            return back()->withErrors([
                'error' => 'Invalid or expired OTP. Please request a new one.'
            ]);
        }

        // Mark as verified
        $emailChangeRequest->update(['verified' => true]);

        Log::info('OTP verification successful', [
            'request_id' => $emailChangeRequest->id,
            'user_id' => $user->id
        ]);

        return redirect()->route('customer.profile.email.confirm', [
            'request_id' => $request->request_id,
            'new_email' => $emailChangeRequest->new_email
        ])->with([
            'success' => true,
            'message' => 'OTP verified successfully. You can now confirm the email change.'
        ]);
    }

    /**
     * Confirm email change after OTP verification.
     */
    public function confirmEmailChange(Request $request)
    {
        $request->validate([
            'request_id' => 'required|integer|exists:email_change_requests,id',
        ]);

        $emailChangeRequest = EmailChangeRequest::findOrFail($request->request_id);
        $user = Auth::user();

        // Verify ownership and verification status
        if ($emailChangeRequest->user_id !== $user->id || !$emailChangeRequest->verified) {
            return back()->withErrors([
                'error' => 'Invalid or unverified request.'
            ]);
        }

        // Check if request is still valid (not expired)
        if ($emailChangeRequest->isExpired()) {
            return back()->withErrors([
                'error' => 'Request has expired. Please start the process again.'
            ]);
        }

        // Update user email
        $user->update([
            'email' => $emailChangeRequest->new_email,
            'email_verified_at' => null, // Require re-verification of new email
        ]);

        // Clean up the request
        $emailChangeRequest->delete();

        return redirect()->route('customer.profile.info')->with([
            'success' => true,
            'message' => 'Email address changed successfully. Please verify your new email address.'
        ]);
    }
}
