<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();
        $request->session()->regenerate();

        $user = $request->user();

        // Generate Token for API access if needed

        // Redirect based on user role
        if ($user->hasRole('admin') || $user->hasRole('staff')) {
            return redirect()->intended(route('admin.dashboard', absolute: false));
        } elseif ($user->hasRole('customer')) {
            return redirect()->intended(route('home', absolute: false));
        } elseif ($user->hasRole('member')) {
            return redirect()->intended(route('membership.index', absolute: false));
        } elseif ($user->hasRole('logistic')) {
            return redirect()->intended(route('logistics.index', absolute: false));
        }

        // Default fallback
        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
