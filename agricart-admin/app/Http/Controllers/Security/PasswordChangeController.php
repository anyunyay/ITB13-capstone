<?php

namespace App\Http\Controllers\Security;

use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class PasswordChangeController extends \App\Http\Controllers\Controller
{
    /**
     * Show the password change form.
     */
    public function show(): Response
    {
        $user = Auth::user();
        
        // Only allow staff and logistics users
        if (!in_array($user->type, ['staff', 'logistic'])) {
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
        if (!in_array($user->type, ['staff', 'logistic'])) {
            abort(403, 'Access denied.');
        }

        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'regex:/^\S*$/', Password::min(8)->letters()->mixedCase()->numbers()->symbols(), 'confirmed'],
        ]);

        $user->update([
            'password' => Hash::make($validated['password']),
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
