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
}