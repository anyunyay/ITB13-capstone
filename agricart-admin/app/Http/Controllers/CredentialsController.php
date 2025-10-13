<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class CredentialsController extends Controller
{
    /**
     * Show the update credentials page for default users.
     */
    public function show(): Response|RedirectResponse
    {
        $user = Auth::user();
        
        // Only allow access if user is a default account
        if (!$user->is_default) {
            return redirect()->route($this->getDashboardRouteForType($user->type));
        }
        
        return Inertia::render('auth/update-credentials', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'type' => $user->type,
            ]
        ]);
    }

    /**
     * Update the user's credentials and mark as non-default.
     */
    public function update(Request $request)
    {
        $user = Auth::user();
        
        // Only allow access if user is a default account
        if (!$user->is_default) {
            return redirect()->route($this->getDashboardRouteForType($user->type));
        }

        // All users only need to update password
        $validated = $request->validate([
            'password' => ['required', 'confirmed', 'regex:/^\S*$/', Password::min(8)->letters()->mixedCase()->numbers()->symbols()],
        ]);
        
        // Update only password for all users
        $user->update([
            'password' => Hash::make($validated['password']),
            'email_verified_at' => now(), // Automatically verify email for all users
            'is_default' => false, // Mark as non-default after successful update
        ]);
        
        // Redirect to appropriate dashboard
        return redirect()->route($this->getDashboardRouteForType($user->type))
            ->with('success', 'Your password has been updated successfully. You can now access the system.');
    }

    /**
     * Get the dashboard route for the user type.
     */
    private function getDashboardRouteForType(string $type): string
    {
        return match ($type) {
            'admin', 'staff' => 'admin.dashboard',
            'customer' => 'home',
            'member' => 'member.dashboard',
            'logistic' => 'logistic.dashboard',
            default => 'home',
        };
    }
}
