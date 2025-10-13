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

        $isMember = $user->type === 'member';
        
        // Different validation rules based on user type
        if ($isMember) {
            // Members only need to update password
            $validated = $request->validate([
                'password' => ['required', 'confirmed', 'regex:/^\S*$/', Password::min(8)->letters()->mixedCase()->numbers()->symbols()],
            ]);
            
            // Update only password for members
            $user->update([
                'password' => Hash::make($validated['password']),
                'is_default' => false, // Mark as non-default after successful update
            ]);
            
            // Redirect to member dashboard
            return redirect()->route($this->getDashboardRouteForType($user->type))
                ->with('success', 'Your password has been updated successfully. You can now access the system.');
        } else {
            // Non-members need to update both email and password
            $validated = $request->validate([
                'email' => [
                    'required', 
                    'string', 
                    'email', 
                    'max:255', 
                    'unique:users,email,' . $user->id,
                ],
                'password' => ['required', 'confirmed', 'regex:/^\S*$/', Password::min(8)->letters()->mixedCase()->numbers()->symbols()],
            ]);
            
            // Custom validation to prevent using the same email as current
            if ($validated['email'] === $user->email) {
                return back()->withErrors([
                    'email' => 'You must provide a different email address from your current one.'
                ]);
            }
            
            // Update email and password for non-members
            $user->update([
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'email_verified_at' => null, // Require email verification for new email
                'is_default' => false, // Mark as non-default after successful update
            ]);
            
            // Send email verification notification
            $user->sendEmailVerificationNotificationForCredentialUpdate();
            
            // Redirect to email verification notice
            return redirect()->route('verification.notice')
                ->with('success', 'Your credentials have been updated successfully. Please verify your new email address to continue.');
        }
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
