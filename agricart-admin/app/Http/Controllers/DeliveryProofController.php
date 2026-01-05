<?php

namespace App\Http\Controllers;

use App\Models\DeliveryProof;
use App\Models\Sales;
use App\Services\FileUploadService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DeliveryProofController extends Controller
{
    /**
     * Store a delivery proof
     */
    public function store(Request $request, FileUploadService $fileService)
    {
        $validationRules = [
            'sales_id' => 'required|exists:sales,id',
            'notes' => 'nullable|string|max:1000',
        ];

        // Add proof image validation rules
        $validationRules['proof_image'] = FileUploadService::getValidationRules('delivery-proofs', true);

        $request->validate($validationRules);

        // Check if proof already exists for this sales order
        $existingProof = DeliveryProof::where('sales_id', $request->sales_id)->first();
        if ($existingProof) {
            return response()->json([
                'success' => false,
                'message' => 'Delivery proof already exists for this order.'
            ], 422);
        }

        // Verify the sales order exists and user has permission
        $sales = Sales::findOrFail($request->sales_id);
        
        // Only logistic users can upload delivery proofs for their assigned orders
        if (Auth::user()->type !== 'logistic' || $sales->logistic_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to upload proof for this order.'
            ], 403);
        }

        try {
            // Upload proof image
            $proofImagePath = $fileService->uploadFile(
                $request->file('proof_image'),
                'delivery-proofs',
                'delivery_proof_' . $request->sales_id
            );

            $deliveryProof = DeliveryProof::create([
                'sales_id' => $request->sales_id,
                'logistic_id' => Auth::id(),
                'proof_image' => $proofImagePath,
                'notes' => $request->notes,
                'uploaded_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Delivery proof uploaded successfully.',
                'data' => $deliveryProof->load(['sales', 'logistic'])
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload delivery proof: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a delivery proof
     */
    public function update(Request $request, DeliveryProof $deliveryProof, FileUploadService $fileService)
    {
        $validationRules = [
            'notes' => 'nullable|string|max:1000',
        ];

        // Add proof image validation rules (optional for updates)
        $validationRules['proof_image'] = FileUploadService::getValidationRules('delivery-proofs', false);

        $request->validate($validationRules);

        // Only the logistic who uploaded it can update
        if (Auth::user()->type !== 'logistic' || $deliveryProof->logistic_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to update this delivery proof.'
            ], 403);
        }

        try {
            // Handle image update if new file is uploaded
            if ($request->hasFile('proof_image')) {
                $newImagePath = $fileService->updateFile(
                    $request->file('proof_image'),
                    'delivery-proofs',
                    $deliveryProof->proof_image,
                    'delivery_proof_' . $deliveryProof->sales_id
                );
                $deliveryProof->proof_image = $newImagePath;
            }

            $deliveryProof->update([
                'notes' => $request->notes,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Delivery proof updated successfully.',
                'data' => $deliveryProof->load(['sales', 'logistic'])
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update delivery proof: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a delivery proof
     */
    public function destroy(DeliveryProof $deliveryProof)
    {
        // Only the logistic who uploaded it or admin can delete
        if (Auth::user()->type === 'logistic' && $deliveryProof->logistic_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to delete this delivery proof.'
            ], 403);
        }

        if (!in_array(Auth::user()->type, ['logistic', 'admin', 'staff'])) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to delete delivery proofs.'
            ], 403);
        }

        try {
            // Delete the file using FileUploadService
            $fileService = new \App\Services\FileUploadService();
            $fileService->deleteFile($deliveryProof->proof_image, 'delivery-proofs');
            
            // Delete the record
            $deliveryProof->delete();

            return response()->json([
                'success' => true,
                'message' => 'Delivery proof deleted successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete delivery proof: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get delivery proof for a sales order
     */
    public function show(Sales $sales)
    {
        $deliveryProof = DeliveryProof::where('sales_id', $sales->id)
            ->with(['logistic'])
            ->first();

        if (!$deliveryProof) {
            return response()->json([
                'success' => false,
                'message' => 'No delivery proof found for this order.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $deliveryProof
        ]);
    }
}