<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

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
        $addresses = $user->addresses ?? collect(); // Assuming addresses relationship
        
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
}
