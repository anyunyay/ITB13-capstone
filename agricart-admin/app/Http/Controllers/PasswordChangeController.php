<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class PasswordChangeController extends Controller
{
    /**
     * Show the password change form.
     */
    public function show(): Response
    {
        $user = Auth::user();
        
        // Only allow staff and logistics users
        if (!in_array($user->type, ['staff', 'logistic']) || !$user->password_change_required) {
            abort(403, 'Access denied.');
        }

        return Inertia::render('PasswordChange');
    }

    /**
     * Update the user's password.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        
        // Only allow staff and logistics users
        if (!in_array($user->type, ['staff', 'logistic']) || !$user->password_change_required) {
            abort(403, 'Access denied.');
        }

        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', Password::defaults(), 'confirmed'],
        ]);

        $user->update([
            'password' => Hash::make($validated['password']),
            'password_change_required' => false,
        ]);

        // Redirect based on user type
        if ($user->type === 'staff') {
            return redirect()->route('admin.dashboard')->with('message', 'Password changed successfully. You can now access all features.');
        } elseif ($user->type === 'logistic') {
            return redirect()->route('logistic.dashboard')->with('message', 'Password changed successfully. You can now access all features.');
        }

        return redirect()->route('home');
    }
}
