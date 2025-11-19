<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FileUpload;
use Illuminate\Http\Request;

class FileController extends Controller
{
    public function getFileUrl(Request $request, $id)
    {
        try {
            $fileUpload = FileUpload::findOrFail($id);
            $user = auth()->user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Authentication required'
                ], 401);
            }

            // Check authorization for private files
            if ($fileUpload->type !== 'product-image') {
                $this->authorizeFileAccess($user, $fileUpload);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $fileUpload->id,
                    'url' => $fileUpload->secure_url,
                    'type' => $fileUpload->type,
                    'original_name' => $fileUpload->original_name,
                    'mime_type' => $fileUpload->mime_type,
                    'size' => $fileUpload->size
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'File access denied: ' . $e->getMessage()
            ], 403);
        }
    }

    public function getFallbackImage()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'url' => asset('storage/fallback-photo.png')
            ]
        ]);
    }

    public function showPrivate($folder, $filename)
    {
        $user = auth()->user();
        
        if (!$user) {
            return response()->json(['error' => 'Authentication required'], 401);
        }

        // Validate folder
        if (!in_array($folder, ['documents', 'delivery-proofs'])) {
            return response()->json(['error' => 'Invalid folder'], 404);
        }

        // Check authorization based on folder type
        try {
            $this->authorizePrivateFileAccess($user, $folder, $filename);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $path = storage_path("app/private/{$folder}/{$filename}");

        if (!file_exists($path)) {
            return abort(404, "File not found: $path");
        }

        return response()->file($path, [
            'Content-Type' => mime_content_type($path),
            'Content-Disposition' => 'inline'
        ]);
    }

    private function authorizeFileAccess($user, $fileUpload)
    {
        switch ($fileUpload->type) {
            case 'document':
                if ($user->type !== 'admin') {
                    throw new \Exception('Unauthorized to access documents');
                }
                break;

            case 'delivery-proof':
                if ($user->type === 'admin') {
                    return;
                } elseif ($user->type === 'logistic' && $fileUpload->owner_id === $user->id) {
                    return;
                } elseif ($user->type === 'staff' && $user->can_view_delivery_proofs) {
                    return;
                } else {
                    throw new \Exception('Unauthorized to access this delivery proof');
                }
                break;

            default:
                throw new \Exception('Invalid file type');
        }
    }

    private function authorizePrivateFileAccess($user, $folder, $filename = null)
    {
        switch ($folder) {
            case 'documents':
                // Check if this is an avatar file (avatars are stored in documents folder)
                // Avatar files typically start with 'avatar_' or match user's avatar filename
                if ($filename && $this->isUserAvatar($user, $filename)) {
                    // Users can access their own avatars
                    return;
                }
                
                // For other documents, only admin and staff can access
                if (!in_array($user->type, ['admin', 'staff'])) {
                    abort(403, 'Unauthorized to access documents');
                }
                break;

            case 'delivery-proofs':
                if (!in_array($user->type, ['admin', 'staff', 'logistic'])) {
                    abort(403, 'Unauthorized to access delivery proofs');
                }
                break;

            default:
                abort(403, 'Invalid folder access');
        }
    }

    /**
     * Check if the requested file is the user's own avatar
     */
    private function isUserAvatar($user, $filename)
    {
        // Get the user's avatar path
        $userAvatarPath = $user->avatar;
        
        if (!$userAvatarPath) {
            return false;
        }
        
        // Extract filename from the avatar path
        $avatarFilename = basename($userAvatarPath);
        
        // Check if the requested filename matches the user's avatar
        return $avatarFilename === $filename;
    }
}