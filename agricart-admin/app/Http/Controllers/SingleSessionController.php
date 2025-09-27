<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SingleSessionController extends Controller
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
