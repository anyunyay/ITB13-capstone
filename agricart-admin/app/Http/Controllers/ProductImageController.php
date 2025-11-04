<?php

namespace App\Http\Controllers;

use App\Models\FileUpload;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ProductImageController extends Controller
{
    public function upload(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120', // 5MB max
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $file = $request->file('image');
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            
            // Store in public disk
            $path = Storage::disk('public')->putFileAs('product-images', $file, $filename);
            
            // Track in database
            $fileUpload = FileUpload::create([
                'path' => $path,
                'type' => 'product-image',
                'original_name' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'size' => $file->getSize(),
                'owner_id' => null, // Product images don't have specific owners
                'uploaded_by' => auth()->id(),
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $fileUpload->id,
                    'url' => Storage::disk('public')->url($path),
                    'filename' => $filename,
                    'original_name' => $file->getClientOriginalName(),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Upload failed: ' . $e->getMessage()
            ], 500);
        }
    }

    public function delete(Request $request, $id)
    {
        try {
            $fileUpload = FileUpload::where('id', $id)
                ->where('type', 'product-image')
                ->firstOrFail();

            // Delete from storage
            Storage::disk('public')->delete($fileUpload->path);
            
            // Delete from database
            $fileUpload->delete();

            return response()->json([
                'success' => true,
                'message' => 'Image deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Delete failed: ' . $e->getMessage()
            ], 500);
        }
    }
}