<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class UserAppearanceController extends Controller
{

    /**
     * Update the user's appearance preference.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function update(Request $request): JsonResponse
    {
        try {
            // Validate the request
            $validator = Validator::make($request->all(), [
                'appearance' => 'required|string|in:light,dark,system',
            ], [
                'appearance.required' => 'Appearance preference is required.',
                'appearance.in' => 'Appearance must be one of: light, dark, system.',
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
            $oldAppearance = $user->appearance;

            // Update the user's appearance preference
            $user->update([
                'appearance' => $request->appearance,
            ]);

            // Log the change
            Log::info('User appearance updated', [
                'user_id' => $user->id,
                'old_appearance' => $oldAppearance,
                'new_appearance' => $request->appearance,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            // Log the change for audit purposes
            Log::info('User appearance preference updated', [
                'user_id' => $user->id,
                'old_appearance' => $oldAppearance,
                'new_appearance' => $request->appearance,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Appearance preference updated successfully.',
                'data' => [
                    'appearance' => $user->appearance,
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to update user appearance', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while updating appearance preference.',
            ], 500);
        }
    }

    /**
     * Get the current user's appearance preference.
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
                    'appearance' => $user->appearance ?? 'light',
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get user appearance', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while retrieving appearance preference.',
            ], 500);
        }
    }
}