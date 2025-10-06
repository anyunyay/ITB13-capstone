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
            'password' => ['required', 'confirmed', Password::min(8)->letters()->mixedCase()->numbers()->symbols()],
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
}
