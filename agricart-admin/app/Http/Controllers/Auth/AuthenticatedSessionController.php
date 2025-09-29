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
     * Resolve the correct dashboard route name for a given user type
     */
    private function dashboardRouteForType(?string $type): string
    {
        return match ($type) {
            'admin', 'staff' => 'admin.dashboard',
            'member' => 'member.dashboard',
            'logistic' => 'logistic.dashboard',
            default => 'home',
        };
    }

    /**
     * Show the customer login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Show the admin login page.
     */
    public function createAdmin(Request $request): Response
    {
        return Inertia::render('auth/admin-login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Show the member login page.
     */
    public function createMember(Request $request): Response
    {
        return Inertia::render('auth/member-login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Show the logistic login page.
     */
    public function createLogistic(Request $request): Response
    {
        return Inertia::render('auth/logistic-login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request (customer portal entry point).
     * Always redirect to the appropriate dashboard for the authenticated user's type.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();
        $request->session()->regenerate();

        $user = $request->user();

        $user->ensurePermissions();

        // Check if user already has an active session
        if ($user->hasActiveSession() && $user->isSessionValid()) {
            // User already has an active session, redirect to restriction page
            return redirect()->route('single-session.restricted');
        }

        // Set current session as active
        $user->invalidateOtherSessions($request->session()->getId());

        return redirect()->route($this->dashboardRouteForType($user->type));
    }

    /**
     * Handle an incoming admin authentication request (admin portal entry point).
     * Always redirect to the appropriate dashboard for the authenticated user's type.
     */
    public function storeAdmin(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();
        $request->session()->regenerate();

        $user = $request->user();

        $user->ensurePermissions();

        // Check if user already has an active session
        if ($user->hasActiveSession() && $user->isSessionValid()) {
            // User already has an active session, redirect to restriction page
            return redirect()->route('single-session.restricted');
        }

        // Set current session as active
        $user->invalidateOtherSessions($request->session()->getId());

        return redirect()->route($this->dashboardRouteForType($user->type));
    }

    /**
     * Handle an incoming member authentication request (member portal entry point).
     * Always redirect to the appropriate dashboard for the authenticated user's type.
     */
    public function storeMember(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();
        $request->session()->regenerate();

        $user = $request->user();

        $user->ensurePermissions();

        // Check if user already has an active session
        if ($user->hasActiveSession() && $user->isSessionValid()) {
            // User already has an active session, redirect to restriction page
            return redirect()->route('single-session.restricted');
        }

        // Set current session as active
        $user->invalidateOtherSessions($request->session()->getId());

        return redirect()->route($this->dashboardRouteForType($user->type));
    }

    /**
     * Handle an incoming logistic authentication request (logistic portal entry point).
     * Always redirect to the appropriate dashboard for the authenticated user's type.
     */
    public function storeLogistic(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();
        $request->session()->regenerate();

        $user = $request->user();

        $user->ensurePermissions();

        // Check if user already has an active session
        if ($user->hasActiveSession() && $user->isSessionValid()) {
            // User already has an active session, redirect to restriction page
            return redirect()->route('single-session.restricted');
        }

        // Set current session as active
        $user->invalidateOtherSessions($request->session()->getId());

        return redirect()->route($this->dashboardRouteForType($user->type));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $user = Auth::user();
        
        // Clear the current session ID from the user record
        if ($user) {
            $user->clearCurrentSession();
        }

        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
