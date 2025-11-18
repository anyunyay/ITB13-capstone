<?php

namespace App\Http\Controllers\Security;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SingleSessionController extends \App\Http\Controllers\Controller
{
    /**
     * Show the single session restricted page
     */
    public function showRestricted(Request $request): Response
    {
        $user = Auth::user();
        
        return Inertia::render('auth/single-session-restricted', [
            'userEmail' => $user->email,
            'logoutUrl' => route('single-session.logout'),
            'cancelUrl' => route('single-session.cancel'),
        ]);
    }

    /**
     * Force logout from other sessions and login with current session
     */
    public function forceLogoutAndLogin(Request $request)
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        // Get current session ID
        $currentSessionId = $request->session()->getId();

        // Mark all other sessions as expired (set last_activity to 0)
        // This allows other sessions to detect they've been terminated
        DB::table('sessions')
            ->where('user_id', $user->id)
            ->where('id', '!=', $currentSessionId)
            ->update(['last_activity' => 0]);

        // Small delay to allow other sessions to detect the change
        usleep(100000); // 100ms

        // Delete all other sessions for this user (except current one)
        DB::table('sessions')
            ->where('user_id', $user->id)
            ->where('id', '!=', $currentSessionId)
            ->delete();

        // Set current session as the active session
        $user->update(['current_session_id' => $currentSessionId]);

        // Redirect to appropriate dashboard based on user type
        return $this->redirectToDashboard($user);
    }

    /**
     * Cancel and logout from current (new) session attempt
     * This does NOT affect the previous active session
     */
    public function cancelAndLogout(Request $request)
    {
        $user = Auth::user();
        
        // DO NOT clear current_session_id - we want to keep the previous session active
        // Just logout this new session attempt
        
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        // Redirect to appropriate login page based on user type
        if ($user) {
            return $this->redirectToLogin($user);
        }

        return redirect()->route('login');
    }

    /**
     * Redirect user to appropriate login page based on their type
     */
    private function redirectToLogin($user)
    {
        switch ($user->type) {
            case 'admin':
            case 'staff':
                return redirect()->route('admin.login');
            case 'member':
                return redirect()->route('member.login');
            case 'logistic':
                return redirect()->route('logistic.login');
            case 'customer':
            default:
                return redirect()->route('login');
        }
    }

    /**
     * Redirect user to appropriate dashboard based on their type
     */
    private function redirectToDashboard($user)
    {
        switch ($user->type) {
            case 'admin':
            case 'staff':
                return redirect()->route('admin.dashboard');
            case 'member':
                return redirect()->route('member.dashboard');
            case 'logistic':
                return redirect()->route('logistic.dashboard');
            case 'customer':
            default:
                return redirect()->route('home');
        }
    }
}
