<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\AppearanceSettings;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AppearanceController extends Controller
{
    /**
     * Display the appearance settings page.
     */
    public function index()
    {
        $user = Auth::user();
        $appearanceSettings = AppearanceSettings::getForUser($user->id);

        return Inertia::render('Customer/Profile/appearance', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'theme' => $appearanceSettings->theme,
                'language' => $appearanceSettings->language,
                'notifications' => $appearanceSettings->notifications ?? AppearanceSettings::getDefaultNotifications(),
            ],
        ]);
    }

    /**
     * Update the user's appearance settings.
     */
    public function update(Request $request)
    {
        $request->validate([
            'theme' => 'required|in:light,dark,system',
            'language' => 'required|in:en,fil',
            'notifications' => 'required|array',
            'notifications.email' => 'boolean',
            'notifications.push' => 'boolean',
            'notifications.sms' => 'boolean',
        ]);

        $user = Auth::user();
        $appearanceSettings = AppearanceSettings::getForUser($user->id);

        $appearanceSettings->update([
            'theme' => $request->theme,
            'language' => $request->language,
            'notifications' => $request->notifications,
        ]);

        return redirect()->back()->with('success', 'Appearance settings updated successfully!');
    }

    /**
     * Get the current user's appearance settings as JSON.
     */
    public function getSettings()
    {
        $user = Auth::user();
        $appearanceSettings = AppearanceSettings::getForUser($user->id);

        return response()->json([
            'theme' => $appearanceSettings->theme,
            'language' => $appearanceSettings->language,
            'notifications' => $appearanceSettings->notifications ?? AppearanceSettings::getDefaultNotifications(),
        ]);
    }
}
