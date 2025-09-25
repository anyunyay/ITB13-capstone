<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\RedirectResponse;

class VerifyEmailController extends Controller
{
    /**
     * Mark the authenticated user's email address as verified.
     * Staff, member, and logistics users are automatically redirected to their dashboard.
     */
    public function __invoke(EmailVerificationRequest $request): RedirectResponse
    {
        $user = $request->user();
        
        // Staff, member, and logistics don't need email verification
        if (in_array($user->type, ['staff', 'member', 'logistic'])) {
            return redirect($this->getRedirectUrl($user).'?verified=1');
        }
        
        if ($user->hasVerifiedEmail()) {
            return redirect($this->getRedirectUrl($user).'?verified=1');
        }

        if ($user->markEmailAsVerified()) {
            /** @var \Illuminate\Contracts\Auth\MustVerifyEmail $user */
            event(new Verified($user));
        }

        return redirect()->intended($this->getRedirectUrl($user).'?verified=1');
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
