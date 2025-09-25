<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmailVerificationPromptController extends Controller
{
    /**
     * Show the email verification prompt page.
     * Staff, member, and logistics users are automatically redirected to their dashboard.
     */
    public function __invoke(Request $request): Response|RedirectResponse
    {
        $user = $request->user();
        
        // Staff, member, and logistics don't need email verification
        if (in_array($user->type, ['staff', 'member', 'logistic'])) {
            return redirect()->intended($this->getRedirectUrl($user));
        }
        
        return $user->hasVerifiedEmail()
                    ? redirect()->intended($this->getRedirectUrl($user))
                    : Inertia::render('auth/verify-email', ['status' => $request->session()->get('status')]);
    }

    /**
     * Get the appropriate redirect URL based on user role.
     */
    private function getRedirectUrl($user): string
    {
        if ($user->hasRole('admin') || $user->hasRole('staff')) {
            return route('admin.dashboard', absolute: false);
        } elseif ($user->hasRole('customer')) {
            return route('home', absolute: false);
        } elseif ($user->hasRole('member')) {
            return route('member.dashboard', absolute: false);
        } elseif ($user->hasRole('logistic')) {
            return route('logistic.dashboard', absolute: false);
        }

        // Default fallback
        return route('home', absolute: false);
    }
}
