<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Helpers\SystemLogger;
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
     * Get appropriate error message for user type restrictions
     */
    private function getUserTypeErrorMessage(string $userType, string $targetPortal): string
    {
        $portalNames = [
            'customer' => 'customer portal',
            'admin' => 'admin portal',
            'member' => 'member portal',
            'logistic' => 'logistics portal',
        ];

        $userTypeNames = [
            'customer' => 'Customers',
            'admin' => 'Admins',
            'staff' => 'Staff',
            'member' => 'Members',
            'logistic' => 'Logistics',
        ];

        $targetPortalName = $portalNames[$targetPortal] ?? $targetPortal . ' portal';
        $userTypeName = $userTypeNames[$userType] ?? ucfirst($userType);

        return "{$userTypeName} cannot access the {$targetPortalName}. Please use the appropriate login page for your account type.";
    }

    /**
     * Get the correct login route for a user type
     */
    private function getCorrectLoginRoute(string $userType): string
    {
        return match ($userType) {
            'customer' => 'login',
            'admin', 'staff' => 'admin.login',
            'member' => 'member.login',
            'logistic' => 'logistic.login',
            default => 'login',
        };
    }

    /**
     * Show the customer login page.
     */
    public function create(Request $request): Response
    {
        // Check if user is already authenticated and redirect to appropriate dashboard
        if (Auth::check()) {
            $user = Auth::user();
            if ($user->type === 'customer') {
                return redirect()->route('home');
            } elseif (in_array($user->type, ['admin', 'staff'])) {
                return redirect()->route('admin.dashboard')->with('error', 'Admin/Staff cannot access the customer portal. Please use the admin login page.');
            } elseif ($user->type === 'member') {
                return redirect()->route('member.dashboard')->with('error', 'Members cannot access the customer portal. Please use the member login page.');
            } elseif ($user->type === 'logistic') {
                return redirect()->route('logistic.dashboard')->with('error', 'Logistics cannot access the customer portal. Please use the logistics login page.');
            }
        }

        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
            'restrictionPopup' => $request->session()->get('restrictionPopup'),
        ]);
    }

    /**
     * Show the admin login page.
     */
    public function createAdmin(Request $request): Response
    {
        // Check if user is already authenticated and redirect to appropriate dashboard
        if (Auth::check()) {
            $user = Auth::user();
            if (in_array($user->type, ['admin', 'staff'])) {
                return redirect()->route('admin.dashboard');
            } elseif ($user->type === 'customer') {
                return redirect()->route('home')->with('error', 'Customers cannot access the admin portal. Please use the customer login page.');
            } elseif ($user->type === 'member') {
                return redirect()->route('member.dashboard')->with('error', 'Members cannot access the admin portal. Please use the member login page.');
            } elseif ($user->type === 'logistic') {
                return redirect()->route('logistic.dashboard')->with('error', 'Logistics cannot access the admin portal. Please use the logistics login page.');
            }
        }

        return Inertia::render('auth/admin-login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
            'restrictionPopup' => $request->session()->get('restrictionPopup'),
        ]);
    }

    /**
     * Show the member login page.
     */
    public function createMember(Request $request): Response
    {
        // Check if user is already authenticated and redirect to appropriate dashboard
        if (Auth::check()) {
            $user = Auth::user();
            if ($user->type === 'member') {
                return redirect()->route('member.dashboard');
            } elseif ($user->type === 'customer') {
                return redirect()->route('home')->with('error', 'Customers cannot access the member portal. Please use the customer login page.');
            } elseif (in_array($user->type, ['admin', 'staff'])) {
                return redirect()->route('admin.dashboard')->with('error', 'Admin/Staff cannot access the member portal. Please use the admin login page.');
            } elseif ($user->type === 'logistic') {
                return redirect()->route('logistic.dashboard')->with('error', 'Logistics cannot access the member portal. Please use the logistics login page.');
            }
        }

        return Inertia::render('auth/member-login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
            'restrictionPopup' => $request->session()->get('restrictionPopup'),
        ]);
    }

    /**
     * Show the logistic login page.
     */
    public function createLogistic(Request $request): Response
    {
        // Check if user is already authenticated and redirect to appropriate dashboard
        if (Auth::check()) {
            $user = Auth::user();
            if ($user->type === 'logistic') {
                return redirect()->route('logistic.dashboard');
            } elseif ($user->type === 'customer') {
                return redirect()->route('home')->with('error', 'Customers cannot access the logistics portal. Please use the customer login page.');
            } elseif (in_array($user->type, ['admin', 'staff'])) {
                return redirect()->route('admin.dashboard')->with('error', 'Admin/Staff cannot access the logistics portal. Please use the admin login page.');
            } elseif ($user->type === 'member') {
                return redirect()->route('member.dashboard')->with('error', 'Members cannot access the logistics portal. Please use the member login page.');
            }
        }

        return Inertia::render('auth/logistic-login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
            'restrictionPopup' => $request->session()->get('restrictionPopup'),
        ]);
    }

    /**
     * Handle an incoming authentication request (customer portal entry point).
     * Only allows customers to login through this endpoint.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();
        $request->session()->regenerate();

        $user = $request->user();

        // Block non-customers from using customer login
        if ($user->type !== 'customer') {
            // Log failed login attempt
            SystemLogger::logAuthentication(
                'login_failed_wrong_portal',
                $user->id,
                $user->type,
                [
                    'target_portal' => 'customer',
                    'ip_address' => $request->ip()
                ]
            );
            
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            return redirect()->route($this->getCorrectLoginRoute($user->type))->with([
                'restrictionPopup' => [
                    'userType' => $user->type,
                    'targetPortal' => 'customer'
                ]
            ]);
        }

        $user->ensurePermissions();

        // Log successful customer login
        SystemLogger::logAuthentication(
            'login_success',
            $user->id,
            'customer',
            ['ip_address' => $request->ip()]
        );

        // Check if user already has an active session
        if ($user->hasActiveSession() && $user->isSessionValid()) {
            // User already has an active session, redirect to restriction page
            return redirect()->route('single-session.restricted');
        }

        // Set current session as active
        $user->invalidateOtherSessions($request->session()->getId());

        // Check if user is a default account and needs to update credentials
        if ($user->is_default) {
            return redirect()->route('credentials.update.show');
        }

        return redirect()->route($this->dashboardRouteForType($user->type));
    }

    /**
     * Handle an incoming admin authentication request (admin portal entry point).
     * Only allows admin and staff users to login through this endpoint.
     */
    public function storeAdmin(\App\Http\Requests\Auth\AdminLoginRequest $request): RedirectResponse
    {
        $request->authenticate();
        $request->session()->regenerate();

        $user = $request->user();

        // Block non-admin/staff users from using admin login
        if (!in_array($user->type, ['admin', 'staff'])) {
            // Log failed login attempt
            SystemLogger::logAuthentication(
                'login_failed_wrong_portal',
                $user->id,
                $user->type,
                [
                    'target_portal' => 'admin',
                    'ip_address' => $request->ip()
                ]
            );
            
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            return redirect()->route($this->getCorrectLoginRoute($user->type))->with([
                'restrictionPopup' => [
                    'userType' => $user->type,
                    'targetPortal' => 'admin'
                ]
            ]);
        }

        $user->ensurePermissions();

        // Log successful admin/staff login
        SystemLogger::logAuthentication(
            'login_success',
            $user->id,
            $user->type,
            ['ip_address' => $request->ip()]
        );

        // Check if user already has an active session
        if ($user->hasActiveSession() && $user->isSessionValid()) {
            // User already has an active session, redirect to restriction page
            return redirect()->route('single-session.restricted');
        }

        // Set current session as active
        $user->invalidateOtherSessions($request->session()->getId());

        // Check if user is a default account and needs to update credentials
        if ($user->is_default) {
            return redirect()->route('credentials.update.show');
        }

        return redirect()->route($this->dashboardRouteForType($user->type));
    }

    /**
     * Handle an incoming member authentication request (member portal entry point).
     * Only allows member users to login through this endpoint.
     */
    public function storeMember(\App\Http\Requests\Auth\MemberLoginRequest $request): RedirectResponse
    {
        $request->authenticate();
        $request->session()->regenerate();

        $user = $request->user();

        // Block non-members from using member login
        if ($user->type !== 'member') {
            // Log failed login attempt
            SystemLogger::logAuthentication(
                'login_failed_wrong_portal',
                $user->id,
                $user->type,
                [
                    'target_portal' => 'member',
                    'ip_address' => $request->ip()
                ]
            );
            
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            return redirect()->route($this->getCorrectLoginRoute($user->type))->with([
                'restrictionPopup' => [
                    'userType' => $user->type,
                    'targetPortal' => 'member'
                ]
            ]);
        }

        $user->ensurePermissions();

        // Log successful member login
        SystemLogger::logAuthentication(
            'login_success',
            $user->id,
            'member',
            ['ip_address' => $request->ip()]
        );

        // Check if user already has an active session
        if ($user->hasActiveSession() && $user->isSessionValid()) {
            // User already has an active session, redirect to restriction page
            return redirect()->route('single-session.restricted');
        }

        // Set current session as active
        $user->invalidateOtherSessions($request->session()->getId());

        // Check if user is a default account and needs to update credentials
        if ($user->is_default) {
            return redirect()->route('credentials.update.show');
        }

        return redirect()->route($this->dashboardRouteForType($user->type));
    }

    /**
     * Handle an incoming logistic authentication request (logistic portal entry point).
     * Only allows logistic users to login through this endpoint.
     */
    public function storeLogistic(\App\Http\Requests\Auth\LogisticLoginRequest $request): RedirectResponse
    {
        $request->authenticate();
        $request->session()->regenerate();

        $user = $request->user();

        // Block non-logistics from using logistics login
        if ($user->type !== 'logistic') {
            // Log failed login attempt
            SystemLogger::logAuthentication(
                'login_failed_wrong_portal',
                $user->id,
                $user->type,
                [
                    'target_portal' => 'logistic',
                    'ip_address' => $request->ip()
                ]
            );
            
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            return redirect()->route($this->getCorrectLoginRoute($user->type))->with([
                'restrictionPopup' => [
                    'userType' => $user->type,
                    'targetPortal' => 'logistic'
                ]
            ]);
        }

        $user->ensurePermissions();

        // Log successful logistic login
        SystemLogger::logAuthentication(
            'login_success',
            $user->id,
            'logistic',
            ['ip_address' => $request->ip()]
        );

        // Check if user already has an active session
        if ($user->hasActiveSession() && $user->isSessionValid()) {
            // User already has an active session, redirect to restriction page
            return redirect()->route('single-session.restricted');
        }

        // Set current session as active
        $user->invalidateOtherSessions($request->session()->getId());

        // Check if user is a default account and needs to update credentials
        if ($user->is_default) {
            return redirect()->route('credentials.update.show');
        }

        return redirect()->route($this->dashboardRouteForType($user->type));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $user = Auth::user();
        
        // Log logout event
        if ($user) {
            SystemLogger::logAuthentication(
                'logout',
                $user->id,
                $user->type,
                ['ip_address' => $request->ip()]
            );
            
            // Clear the current session ID from the user record
            $user->clearCurrentSession();
        }

        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
