<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\FileUploadService;
use App\Http\Requests\FileUploadRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class FileManagementController extends Controller
{
    protected FileUploadService $fileService;

    public function __construct(FileUploadService $fileService)
    {
        $this->fileService = $fileService;
    }

    /**
     * Upload a file
     */
    public function upload(FileUploadRequest $request): JsonResponse
    {
        try {
            $filePath = $this->fileService->uploadFile(
                $request->file('file'),
                $request->input('category'),
                $request->input('custom_name')
            );

            return response()->json([
                'success' => true,
                'message' => 'File uploaded successfully.',
                'data' => [
                    'file_path' => $filePath,
                    'file_url' => $this->fileService->getFileUrl($filePath),
                    'category' => $request->input('category'),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload file: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a file
     */
    public function delete(Request $request): JsonResponse
    {
        $request->validate([
            'file_path' => 'required|string'
        ]);

        try {
            $deleted = $this->fileService->deleteFile($request->input('file_path'));

            if ($deleted) {
                return response()->json([
                    'success' => true,
                    'message' => 'File deleted successfully.'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'File not found or could not be deleted.'
                ], 404);
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete file: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get file information
     */
    public function info(Request $request): JsonResponse
    {
        $request->validate([
            'file_path' => 'required|string'
        ]);

        $filePath = $request->input('file_path');
        $fullPath = public_path($filePath);

        if (!file_exists($fullPath)) {
            return response()->json([
                'success' => false,
                'message' => 'File not found.'
            ], 404);
        }

        try {
            $fileInfo = [
                'file_path' => $filePath,
                'file_url' => $this->fileService->getFileUrl($filePath),
                'file_size' => filesize($fullPath),
                'file_size_human' => $this->formatBytes(filesize($fullPath)),
                'mime_type' => mime_content_type($fullPath),
                'last_modified' => date('Y-m-d H:i:s', filemtime($fullPath)),
                'exists' => true,
            ];

            return response()->json([
                'success' => true,
                'data' => $fileInfo
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get file information: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get validation rules for a category
     */
    public function validationRules(Request $request): JsonResponse
    {
        $request->validate([
            'category' => 'required|string|in:products,documents,delivery-proofs,avatars',
            'required' => 'nullable|boolean'
        ]);

        try {
            $rules = FileUploadService::getValidationRules(
                $request->input('category'),
                $request->boolean('required', true)
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'category' => $request->input('category'),
                    'validation_rules' => $rules,
                    'rules_string' => implode('|', $rules)
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid category: ' . $e->getMessage()
            ], 400);
        }
    }

    /**
     * Format bytes to human readable format
     */
    private function formatBytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, $precision) . ' ' . $units[$i];
    }
}