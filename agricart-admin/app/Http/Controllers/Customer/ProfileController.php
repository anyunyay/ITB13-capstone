<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Services\FileUploadService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Illuminate\Support\Facades\File;

class ProfileController extends Controller
{
    /**
     * Display the profile information page.
     */
    public function profile()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        
        // Load the user with default address relationship
        $user->load('defaultAddress');
        
        // Convert user to array and add default address data
        $userData = $user->toArray();
        if ($user->defaultAddress) {
            $userData['default_address'] = [
                'id' => $user->defaultAddress->id,
                'street' => $user->defaultAddress->street,
                'barangay' => $user->defaultAddress->barangay,
                'city' => $user->defaultAddress->city,
                'province' => $user->defaultAddress->province,
                'is_active' => $user->defaultAddress->is_active,
            ];
        }
        
        return Inertia::render('Profile/profile', [
            'user' => $userData
        ]);
    }


    /**
     * Display the password change page.
     */
    public function password()
    {
        $user = Auth::user();
        
        return Inertia::render('Profile/password', [
            'user' => $user
        ]);
    }

    /**
     * Display the appearance settings page.
     */
    public function appearance()
    {
        $user = Auth::user();
        
        return Inertia::render('Profile/appearance', [
            'user' => $user
        ]);
    }

    /**
     * Display the help and support page.
     */
    public function help()
    {
        $user = Auth::user();
        
        return Inertia::render('Profile/help', [
            'user' => $user
        ]);
    }

    /**
     * Display the logout page.
     */
    public function logoutPage()
    {
        $user = Auth::user();
        
        return Inertia::render('Profile/logout', [
            'user' => $user
        ]);
    }

    /**
     * Update the customer's profile information.
     */
    public function update(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        
        // Base validation rules
        $validationRules = [
            'name' => 'required|string|max:255',
            'phone' => ['nullable', 'numeric', 'unique:users,contact_number,' . $user->id],
            'address' => 'nullable|string|max:500',
            'barangay' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'province' => 'nullable|string|max:255',
        ];

        // Only require email validation for non-member users
        if ($user->type !== 'member') {
            $validationRules['email'] = 'required|string|email|max:255|unique:users,email,' . $user->id;
        }
        
        $validated = $request->validate($validationRules);

        // Map phone to contact_number for database
        if (isset($validated['phone'])) {
            $validated['contact_number'] = $validated['phone'];
            unset($validated['phone']);
        }

        $user->update($validated);

        return redirect()->back()->with('success', 'Profile updated successfully.');
    }

    /**
     * Update only the customer's name.
     */
    public function updateName(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $user->update(['name' => $validated['name']]);

        return redirect()->back()->with('success', 'Name updated successfully.');
    }

    /**
     * Change the customer's password.
     */
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'password' => ['required', 'confirmed', 'regex:/^\S*$/', Password::min(8)->letters()->mixedCase()->numbers()->symbols()],
        ]);

        /** @var \App\Models\User $user */
        $user = Auth::user();

        if (!Hash::check($request->current_password, $user->password)) {
            return back()->withErrors([
                'current_password' => 'The provided password does not match your current password.',
            ]);
        }

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        return redirect()->back()->with('success', 'Password changed successfully.');
    }

    /**
     * Logout the customer.
     */
    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }

    /**
     * Upload or update the customer's avatar.
     */
    public function uploadAvatar(Request $request, FileUploadService $fileService)
    {
        // Use FileUploadService validation rules
        $validationRules = [
            'avatar' => FileUploadService::getValidationRules('avatars', true),
        ];
        
        $request->validate($validationRules);

        /** @var \App\Models\User $user */
        $user = Auth::user();

        try {
            // Upload new avatar using FileUploadService (this will handle old file deletion)
            if ($request->hasFile('avatar')) {
                $newAvatarPath = $fileService->updateFile(
                    $request->file('avatar'),
                    'avatars',
                    $user->avatar,
                    'avatar_' . $user->id . '_' . time()
                );
                
                $user->update([
                    'avatar' => $newAvatarPath,
                ]);
            }

            return redirect()->back()->with('success', 'Profile picture updated successfully.');
            
        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'avatar' => 'Failed to upload avatar: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Delete the customer's avatar.
     */
    public function deleteAvatar(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if ($user->avatar) {
            // Use the model's delete method which uses FileUploadService
            $user->deleteAvatarFile();
        }

        return redirect()->back()->with('success', 'Profile picture removed successfully.');
    }


}
