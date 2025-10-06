<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::min(8)->letters()->mixedCase()->numbers()->symbols()],
            'contact_number' => [
                'required',
                'string',
                'regex:/^9\d{9}$/',
            ],
            'address' => 'required|string|max:500',
            'barangay' => 'required|string|in:Sala',
            'city' => 'required|string|in:Cabuyao',
            'province' => 'required|string|in:Laguna',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'contact_number' => '+63' . $request->contact_number,
            'address' => $request->address,
            'barangay' => $request->barangay,
            'city' => $request->city,
            'province' => $request->province,
            'type' => 'customer', // Ensure type is set to customer
        ]);

        // Explicitly assign the 'customer' role
        if (!$user->hasRole('customer')) {
            $user->assignRole('customer');
        }

        event(new Registered($user));

        Auth::login($user);

        // Set current session as active to prevent single-session conflicts
        $user->invalidateOtherSessions(request()->session()->getId());

        // Ensure permissions are set for the user
        $user->ensurePermissions();

        // Send email verification notification
        $user->sendEmailVerificationNotification();

        // Redirect to verification notice for customers
        return redirect()->intended(route('verification.notice', absolute: false));
    }
}
