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
     * Show the auth portal selection page.
     */
    public function index(Request $request): Response
    {
        return Inertia::render('auth/index');
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
     * Handle an incoming customer authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();
        $request->session()->regenerate();

        $user = $request->user();

        // Ensure user has proper permissions for their type
        $user->ensurePermissions();

        // Redirect based on user type (consistent with middleware)
        if ($user->type === 'admin' || $user->type === 'staff') {
            return redirect()->intended(route('admin.dashboard', absolute: false));
        } elseif ($user->type === 'customer') {
            return redirect()->intended(route('home', absolute: false));
        } elseif ($user->type === 'member') {
            return redirect()->intended(route('member.dashboard', absolute: false));
        } elseif ($user->type === 'logistic') {
            return redirect()->intended(route('logistic.dashboard', absolute: false));
        }

        // Default fallback
        return redirect()->intended(route('home', absolute: false));
    }

    /**
     * Handle an incoming admin authentication request.
     */
    public function storeAdmin(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();
        $request->session()->regenerate();

        $user = $request->user();

        // Ensure user has proper permissions for their type
        $user->ensurePermissions();

        // Verify user is admin or staff
        if ($user->type !== 'admin' && $user->type !== 'staff') {
            Auth::guard('web')->logout();
            return back()->withErrors(['email' => 'Access denied. Admin credentials required.']);
        }

        return redirect()->intended(route('admin.dashboard', absolute: false));
    }

    /**
     * Handle an incoming member authentication request.
     */
    public function storeMember(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();
        $request->session()->regenerate();

        $user = $request->user();

        // Ensure user has proper permissions for their type
        $user->ensurePermissions();

        // Verify user is a member
        if ($user->type !== 'member') {
            Auth::guard('web')->logout();
            return back()->withErrors(['email' => 'Access denied. Member credentials required.']);
        }

        return redirect()->intended(route('member.dashboard', absolute: false));
    }

    /**
     * Handle an incoming logistic authentication request.
     */
    public function storeLogistic(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();
        $request->session()->regenerate();

        $user = $request->user();

        // Ensure user has proper permissions for their type
        $user->ensurePermissions();

        // Verify user is logistic
        if ($user->type !== 'logistic') {
            Auth::guard('web')->logout();
            return back()->withErrors(['email' => 'Access denied. Logistics credentials required.']);
        }

        return redirect()->intended(route('logistic.dashboard', absolute: false));
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
