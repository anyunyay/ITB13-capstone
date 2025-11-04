<?php

namespace App\Http\Controllers;

use App\Models\FileUpload;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PrivateFileController extends Controller
{
    public function uploadDocument(Request $request)
    {
        // Only Admin can upload documents
        if (auth()->user()->type !== 'admin') {
            abort(403, 'Unauthorized to upload documents');
        }

        $validator = Validator::make($request->all(), [
            'document' => 'required|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240', // 10MB max
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        return $this->handlePrivateUpload($request->file('document'), 'documents', 'document');
    }

    public function uploadDeliveryProof(Request $request)
    {
        // Only Logistics can upload delivery proofs
        if (auth()->user()->type !== 'logistic') {
            abort(403, 'Unauthorized to upload delivery proofs');
        }

        $validator = Validator::make($request->all(), [
            'proof' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120', // 5MB max
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        return $this->handlePrivateUpload($request->file('proof'), 'delivery-proofs', 'delivery-proof', auth()->id());
    }

    private function handlePrivateUpload($file, $folder, $type, $ownerId = null)
    {
        try {
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            
            // Store in private disk
            $path = Storage::disk('private')->putFileAs($folder, $file, $filename);
            
            // Track in database
            $fileUpload = FileUpload::create([
                'path' => $path,
                'type' => $type,
                'original_name' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'size' => $file->getSize(),
                'owner_id' => $ownerId,
                'uploaded_by' => auth()->id(),
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $fileUpload->id,
                    'filename' => $filename,
                    'original_name' => $file->getClientOriginalName(),
                    'url' => route('private.file.serve', ['type' => $type, 'filename' => $filename])
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Upload failed: ' . $e->getMessage()
            ], 500);
        }
    }

    public function serve(Request $request, $type, $filename)
    {
        // Prevent path traversal
        if (str_contains($filename, '..') || str_contains($filename, '/') || str_contains($filename, '\\')) {
            abort(404);
        }

        // Find file record
        $fileUpload = FileUpload::where('type', $type)
            ->where('path', 'like', '%' . $filename)
            ->firstOrFail();

        // Authorization checks
        $user = auth()->user();
        if (!$user) {
            abort(401, 'Authentication required');
        }

        $this->authorizeFileAccess($user, $fileUpload);

        // Serve file
        $filePath = $fileUpload->path;
        
        if (!Storage::disk('private')->exists($filePath)) {
            abort(404, 'File not found');
        }

        $stream = Storage::disk('private')->readStream($filePath);
        
        return new StreamedResponse(function () use ($stream) {
            fpassthru($stream);
            fclose($stream);
        }, 200, [
            'Content-Type' => $fileUpload->mime_type,
            'Content-Disposition' => 'inline; filename="' . $fileUpload->original_name . '"',
            'Cache-Control' => 'no-cache, must-revalidate',
        ]);
    }

    private function authorizeFileAccess(User $user, FileUpload $fileUpload)
    {
        switch ($fileUpload->type) {
            case 'document':
                // Only Admin can view documents
                if ($user->type !== 'admin') {
                    abort(403, 'Unauthorized to view documents');
                }
                break;

            case 'delivery-proof':
                // Logistics can view their own proofs, Admin can view all, Staff with permission can view
                if ($user->type === 'admin') {
                    // Admin can view all
                    return;
                } elseif ($user->type === 'logistic' && $fileUpload->owner_id === $user->id) {
                    // Logistics can view their own
                    return;
                } elseif ($user->type === 'staff' && $user->can_view_delivery_proofs) {
                    // Staff with permission can view
                    return;
                } else {
                    abort(403, 'Unauthorized to view this delivery proof');
                }
                break;

            default:
                abort(403, 'Invalid file type');
        }
    }

    public function delete(Request $request, $id)
    {
        try {
            $fileUpload = FileUpload::findOrFail($id);
            $user = auth()->user();

            // Authorization for deletion
            if ($fileUpload->type === 'document' && $user->type !== 'admin') {
                abort(403, 'Unauthorized to delete documents');
            }

            if ($fileUpload->type === 'delivery-proof') {
                if ($user->type !== 'admin' && $fileUpload->owner_id !== $user->id) {
                    abort(403, 'Unauthorized to delete this delivery proof');
                }
            }

            // Delete from storage
            Storage::disk('private')->delete($fileUpload->path);
            
            // Delete from database
            $fileUpload->delete();

            return response()->json([
                'success' => true,
                'message' => 'File deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Delete failed: ' . $e->getMessage()
            ], 500);
        }
    }

    public function list(Request $request, $type)
    {
        $user = auth()->user();
        
        $query = FileUpload::where('type', $type);

        // Apply access filters
        switch ($type) {
            case 'document':
                if ($user->type !== 'admin') {
                    abort(403, 'Unauthorized to list documents');
                }
                break;

            case 'delivery-proof':
                if ($user->type === 'logistic') {
                    $query->where('owner_id', $user->id);
                } elseif ($user->type === 'staff' && !$user->can_view_delivery_proofs) {
                    abort(403, 'Unauthorized to list delivery proofs');
                } elseif ($user->type !== 'admin' && $user->type !== 'staff') {
                    abort(403, 'Unauthorized to list delivery proofs');
                }
                break;

            default:
                abort(404, 'Invalid file type');
        }

        $files = $query->with(['owner', 'uploader'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $files
        ]);
    }
}