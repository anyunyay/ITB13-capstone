<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Auth;

class LanguageController extends Controller
{
    /**
     * Switch the application language
     */
    public function switch(Request $request)
    {
        $request->validate([
            'language' => 'required|in:en,fil'
        ]);

        $language = $request->input('language');
        
        // Set the application locale
        App::setLocale($language);
        
        // Store in session for non-authenticated users
        Session::put('locale', $language);
        
        // Store in user preferences if authenticated
        if (Auth::check()) {
            $user = Auth::user();
            $user->language = $language;
            $user->save();
        }

        return response()->json([
            'success' => true,
            'message' => __('appearance.language_updated'),
            'language' => $language
        ]);
    }

    /**
     * Get current language
     */
    public function current()
    {
        $language = 'en'; // Default to English for non-members
        
        if (Auth::check()) {
            $user = Auth::user();
            // For members, always default to English unless they have a preference
            if ($user->type === 'member') {
                $language = $user->language ?? 'en';
            } else {
                // For other user types, use their preference or session
                $language = $user->language ?? Session::get('locale', 'en');
            }
        } elseif (Session::has('locale')) {
            $language = Session::get('locale');
        }

        return response()->json([
            'language' => $language
        ]);
    }
}