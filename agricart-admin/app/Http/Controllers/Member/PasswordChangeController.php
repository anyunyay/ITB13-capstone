<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\PasswordChangeRequest;
use App\Models\User;
use App\Notifications\PasswordChangeRequestNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class PasswordChangeController extends Controller
{
    /**
     * Show the forgot password form
     */
    public function showForgotPassword()
    {
        return Inertia::render('auth/member-forgot-password');
    }

    /**
     * Handle member forgot password request
     */
    public function requestPasswordChange(Request $request)
    {
        $request->validate([
            'member_id' => 'required|string|exists:users,member_id',
        ]);

        // Find the member
        $member = User::where('member_id', $request->member_id)
            ->where('type', 'member')
            ->first();

        if (!$member) {
            return back()->withErrors([
                'member_id' => 'Member ID not found.'
            ]);
        }

        // Check if there's already a pending request
        $existingRequest = PasswordChangeRequest::where('member_id', $member->id)
            ->where('status', 'pending')
            ->first();

        if ($existingRequest) {
            // Redirect to the existing pending request page
            return redirect()->route('member.password.pending', $existingRequest->id);
        }

        // Create new password change request
        $passwordChangeRequest = PasswordChangeRequest::createForMember($member);

        // Notify admin and staff users
        $adminUsers = User::whereIn('type', ['admin', 'staff'])->get();
        foreach ($adminUsers as $admin) {
            $admin->notify(new PasswordChangeRequestNotification($passwordChangeRequest));
        }

        // Redirect to the request pending page
        return redirect()->route('member.password.pending', $passwordChangeRequest->id);
    }

    /**
     * Show the password change form for approved requests
     */
    public function showChangeForm(Request $request, $requestId)
    {
        $passwordChangeRequest = PasswordChangeRequest::find($requestId);

        if (!$passwordChangeRequest) {
            return redirect()->route('member.login')->with('error', 'Invalid password change request.');
        }

        if (!$passwordChangeRequest->isValid()) {
            return redirect()->route('member.login')->with('error', 'Password change request is not approved yet.');
        }

        return Inertia::render('Member/change-password', [
            'requestId' => $requestId,
            'member' => $passwordChangeRequest->member,
        ]);
    }

    /**
     * Handle the password change
     */
    public function changePassword(Request $request, $requestId)
    {
        $request->validate([
            'password' => ['required', 'confirmed', 'regex:/^\S*$/', Password::min(8)->letters()->mixedCase()->numbers()->symbols()],
        ]);

        $passwordChangeRequest = PasswordChangeRequest::find($requestId);

        if (!$passwordChangeRequest) {
            return back()->withErrors(['password' => 'Invalid password change request.']);
        }

        if (!$passwordChangeRequest->isValid()) {
            return back()->withErrors(['password' => 'Password change request is not approved yet.']);
        }

        // Update the member's password
        $member = $passwordChangeRequest->member;
        $member->update([
            'password' => Hash::make($request->password)
        ]);

        // Mark the request as completed (we'll use 'rejected' status to indicate completion since 'completed' is not in the enum)
        $passwordChangeRequest->update([
            'status' => 'rejected', // Using rejected to indicate the request has been processed
            'admin_notes' => 'Password changed successfully by member'
        ]);

        // Log in the member automatically after password change
        Auth::login($member);

        return redirect()->route('member.dashboard')->with('status', 'Password changed successfully! Welcome to your dashboard.');
    }

    /**
     * Show the request pending page
     */
    public function showRequestPending(Request $request, $requestId)
    {
        $passwordChangeRequest = PasswordChangeRequest::with('member')->find($requestId);

        if (!$passwordChangeRequest) {
            return redirect()->route('member.login')->with('error', 'Password change request not found.');
        }

        // If approved, redirect to password change page
        if ($passwordChangeRequest->status === 'approved') {
            return redirect()->route('member.password.change', $requestId);
        }

        // If rejected, show the pending page with rejection status
        if ($passwordChangeRequest->status === 'rejected') {
            return Inertia::render('auth/member-request-pending', [
                'request' => $passwordChangeRequest,
            ]);
        }

        // If still pending, show the pending page
        if ($passwordChangeRequest->status === 'pending') {
            return Inertia::render('auth/member-request-pending', [
                'request' => $passwordChangeRequest,
            ]);
        }

        return redirect()->route('member.login')->with('error', 'This request has already been processed.');
    }

    /**
     * Cancel a password change request
     */
    public function cancelRequest(Request $request, $requestId)
    {
        $passwordChangeRequest = PasswordChangeRequest::find($requestId);

        if (!$passwordChangeRequest) {
            return redirect()->route('member.login')->with('error', 'Password change request not found.');
        }

        if ($passwordChangeRequest->status !== 'pending') {
            return redirect()->route('member.login')->with('error', 'This request has already been processed and cannot be cancelled.');
        }

        // Store member relation and set status for notification, then notify before deletion
        $member = $passwordChangeRequest->member;
        $passwordChangeRequest->setRelation('member', $member);
        $passwordChangeRequest->status = 'cancelled';

        // Notify admin and staff users about the cancellation
        $adminUsers = User::whereIn('type', ['admin', 'staff'])->get();
        foreach ($adminUsers as $admin) {
            $admin->notify(new \App\Notifications\PasswordChangeRequestNotification($passwordChangeRequest));
        }

        // Delete the request after notifications are sent
        $passwordChangeRequest->delete();

        return redirect()->route('member.login')->with('status', 'Password change request has been cancelled successfully.');
    }

    /**
     * Check the status of a password change request (API endpoint)
     */
    public function checkRequestStatus(Request $request, $requestId)
    {
        $passwordChangeRequest = PasswordChangeRequest::with('member')->find($requestId);

        if (!$passwordChangeRequest) {
            return response()->json([
                'status' => 'not_found',
                'message' => 'Password change request not found.'
            ], 404);
        }

        return response()->json([
            'status' => $passwordChangeRequest->status,
            'request_id' => $passwordChangeRequest->id,
            'member' => [
                'id' => $passwordChangeRequest->member->id,
                'name' => $passwordChangeRequest->member->name,
                'member_id' => $passwordChangeRequest->member->member_id,
            ],
            'requested_at' => $passwordChangeRequest->requested_at->toISOString(),
            'approved_at' => $passwordChangeRequest->approved_at ? $passwordChangeRequest->approved_at->toISOString() : null,
        ]);
    }
}