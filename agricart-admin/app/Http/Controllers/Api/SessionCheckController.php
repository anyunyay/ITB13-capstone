<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class SessionCheckController extends Controller
{
    /**
     * Check if the current session is still valid
     */
    public function check(Request $request)
    {
        if (!Auth::check()) {
            return response()->json([
                'valid' => false,
                'reason' => 'not_authenticated'
            ]);
        }

        $user = Auth::user();
        $currentSessionId = $request->session()->getId();

        // Check if this is still the user's active session
        if (!$user->isCurrentSession($currentSessionId)) {
            return response()->json([
                'valid' => false,
                'reason' => 'logged_in_elsewhere',
                'message' => 'Your account was accessed from another device or browser.'
            ]);
        }

        // Check if the session still exists in the database
        $sessionExists = DB::table('sessions')
            ->where('id', $currentSessionId)
            ->where('user_id', $user->id)
            ->exists();

        if (!$sessionExists) {
            return response()->json([
                'valid' => false,
                'reason' => 'session_expired',
                'message' => 'Your session has expired.'
            ]);
        }

        // Check if session was marked as expired (last_activity = 0)
        $session = DB::table('sessions')
            ->where('id', $currentSessionId)
            ->where('user_id', $user->id)
            ->first();

        if ($session && $session->last_activity == 0) {
            return response()->json([
                'valid' => false,
                'reason' => 'logged_in_elsewhere',
                'message' => 'Your account was accessed from another device or browser.'
            ]);
        }

        return response()->json([
            'valid' => true
        ]);
    }
}
