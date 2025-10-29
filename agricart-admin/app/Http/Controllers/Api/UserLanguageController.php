<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class UserLanguageController extends Controller
{
    /**
     * Update the user's language preference.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function update(Request $request): JsonResponse
    {
        try {
            // Validate the request
            $validator = Validator::make($request->all(), [
                'language' => 'required|string|in:en,tl',
            ], [
                'language.required' => __('ui.required'),
                'language.in' => 'Language must be either English (en) or Tagalog (tl).',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed.',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated.',
                ], 401);
            }

            // Store the old value for audit trail
            $oldLanguage = $user->language;

            // Update the user's language preference
            $user->update([
                'language' => $request->language,
            ]);

            // Set the locale immediately
            app()->setLocale($request->language);

            // Log the change
            Log::info('User language preference updated', [
                'user_id' => $user->id,
                'old_language' => $oldLanguage,
                'new_language' => $request->language,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Language preference updated successfully.',
                'data' => [
                    'language' => $user->language,
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to update user language', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while updating language preference.',
            ], 500);
        }
    }

    /**
     * Get the current user's language preference.
     *
     * @return JsonResponse
     */
    public function show(): JsonResponse
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated.',
                ], 401);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'language' => $user->language ?? 'en',
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get user language', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while retrieving language preference.',
            ], 500);
        }
    }
}
