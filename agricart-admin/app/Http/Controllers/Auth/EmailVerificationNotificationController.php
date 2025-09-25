<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class EmailVerificationNotificationController extends Controller
{
    /**
     * Send a new email verification notification.
     * Staff, member, and logistics users are automatically redirected to their dashboard.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        
        // Staff, member, and logistics don't need email verification
        if (in_array($user->type, ['staff', 'member', 'logistic'])) {
            return redirect()->intended($this->getRedirectUrl($user));
        }
        
        if ($user->hasVerifiedEmail()) {
            return redirect()->intended($this->getRedirectUrl($user));
        }

        $user->sendEmailVerificationNotification();

        return back()->with('status', 'verification-link-sent');
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
