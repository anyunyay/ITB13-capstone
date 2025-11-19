<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Response;
use Barryvdh\DomPDF\Facade\Pdf;

class LogisticController extends Controller
{
    public function index()
    {
        // Optimize: Load only essential logistic data (keep as collection for frontend compatibility)
        $logistics = User::where('type', 'logistic')
            ->with('defaultAddress:id,user_id,street,barangay,city,province')
            ->select('id', 'name', 'email', 'contact_number', 'registration_date', 'type', 'active', 'created_at')
            ->orderBy('name')
            ->limit(200) // Limit instead of paginate to maintain frontend compatibility
            ->get()
            ->map(function ($logistic) {
                // Check if logistic has pending orders
                $hasPendingOrders = $logistic->hasPendingOrders();
                $canBeDeactivated = $logistic->active && !$hasPendingOrders;
                $deactivationReason = null;
                
                if ($logistic->active && $hasPendingOrders) {
                    $deactivationReason = 'Cannot deactivate: Logistic has active deliveries (pending or out for delivery).';
                }

                // Check if logistic can be deleted (no linked data)
                $hasLinkedData = false;
                $linkedDataReasons = [];

                // Check for pending orders
                if ($hasPendingOrders) {
                    $hasLinkedData = true;
                    $linkedDataReasons[] = 'has active deliveries';
                }

                // Check for any assigned orders (including completed)
                $totalOrdersCount = \DB::table('orders')
                    ->where('logistic_id', $logistic->id)
                    ->count();
                
                if ($totalOrdersCount > 0 && !$hasPendingOrders) {
                    $hasLinkedData = true;
                    $linkedDataReasons[] = "has {$totalOrdersCount} order record(s)";
                }

                // Check for delivery proofs
                $deliveryProofsCount = \DB::table('delivery_proofs')
                    ->where('logistic_id', $logistic->id)
                    ->count();
                
                if ($deliveryProofsCount > 0) {
                    $hasLinkedData = true;
                    $linkedDataReasons[] = "has {$deliveryProofsCount} delivery proof(s)";
                }
                
                $canBeDeleted = !$hasLinkedData;
                $deletionReason = $hasLinkedData 
                    ? 'Cannot delete: Logistic ' . implode(', ', $linkedDataReasons) . '.'
                    : null;
                
                return [
                    'id' => $logistic->id,
                    'name' => $logistic->name,
                    'email' => $logistic->email,
                    'contact_number' => $logistic->contact_number,
                    'registration_date' => $logistic->registration_date,
                    'type' => $logistic->type,
                    'active' => $logistic->active,
                    'default_address' => $logistic->defaultAddress ? [
                        'id' => $logistic->defaultAddress->id,
                        'street' => $logistic->defaultAddress->street,
                        'barangay' => $logistic->defaultAddress->barangay,
                        'city' => $logistic->defaultAddress->city,
                        'province' => $logistic->defaultAddress->province,
                        'full_address' => $logistic->defaultAddress->full_address,
                    ] : null,
                    'can_be_deactivated' => $canBeDeactivated,
                    'deactivation_reason' => $deactivationReason,
                    'can_be_deleted' => $canBeDeleted,
                    'deletion_reason' => $deletionReason,
                ];
            });
        return Inertia::render('Logistics/index', compact('logistics'));
    }

    public function add()
    {
        return Inertia::render('Logistics/add', []);
    }

    public function store(Request $request)
    {
        // Validate the request data
        $request->validate([
            'name' => 'required|string|max:255|regex:/^[A-Za-z\s]+$/',
            'email' => 'required|email|unique:users,email',
            'password' => ['required', 'string', 'min:8', 'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/'],
            'contact_number' => [
                'required',
                'numeric',
                'unique:users,contact_number',
                'regex:/^(\+639|09)\d{9}$/',
            ],
            'registration_date' => 'nullable|date',
            'street' => 'required|string|max:255',
            'barangay' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'province' => 'required|string|max:255',
        ]);

        $user = User::create([
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'password' => bcrypt($request->input('password')),
            'contact_number' => $request->input('contact_number'),
            'registration_date' => $request->input('registration_date', now()),
            'type' => 'logistic',
            'email_verified_at' => now(), // Automatically verify email
        ]);

        // Create address
        $user->userAddresses()->create([
            'street' => $request->input('street'),
            'barangay' => $request->input('barangay'),
            'city' => $request->input('city'),
            'province' => $request->input('province'),
            'is_active' => true,
        ]);

        return redirect()->route('logistics.index')->with('message', 'Logistic added successfully');
    }

    public function edit($id)
    {
        $logistic = User::where('type', 'logistic')
            ->with('defaultAddress')
            ->findOrFail($id);
        return Inertia::render('Logistics/edit', compact('logistic'));
    }

    public function update(Request $request, $id)
    {
        // Validate the request data
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $id,
            'contact_number' => [
                'required',
                'numeric',
                'unique:users,contact_number,' . $id,
                'regex:/^(\+639|09)\d{9}$/',
            ],
            'registration_date' => 'nullable|date',
            'street' => 'required|string|max:255',
            'barangay' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'province' => 'required|string|max:255',
        ]);

        $logistic = User::where('type', 'logistic')->findOrFail($id);
        if ($logistic) {
            $logistic->update([
                'name' => $request->input('name'),
                'email' => $request->input('email'),
                'contact_number' => $request->input('contact_number'),
                'registration_date' => $request->input('registration_date') ?? now(),
            ]);

            // Update or create address
            $defaultAddress = $logistic->defaultAddress;
            if ($defaultAddress) {
                $defaultAddress->update([
                    'street' => $request->input('street'),
                    'barangay' => $request->input('barangay'),
                    'city' => $request->input('city'),
                    'province' => $request->input('province'),
                ]);
            } else {
                $logistic->userAddresses()->create([
                    'street' => $request->input('street'),
                    'barangay' => $request->input('barangay'),
                    'city' => $request->input('city'),
                    'province' => $request->input('province'),
                    'is_active' => true,
                ]);
            }
        }

        $logistic->save();
        return redirect()->route('logistics.index')->with('message', 'Logistic Details updated successfully');
    }

    public function destroy($id)
    {
        $logistic = User::where('type', 'logistic')->findOrFail($id);

        // Check if logistic has pending assigned orders
        if ($logistic->hasPendingOrders()) {
            return redirect()->route('logistics.index')->with('error', 'Cannot deactivate: logistic has pending assigned orders.');
        }

        // Deactivate instead of deleting
        $logistic->update(['active' => false]);
        return redirect()->route('logistics.index')->with('message', 'Logistic deactivated successfully');
    }

    public function deactivated()
    {
        $deactivatedLogistics = User::where('type', 'logistic')
            ->inactive()
            ->with('defaultAddress')
            ->get();
        return Inertia::render('Logistics/deactivated', compact('deactivatedLogistics'));
    }

    public function reactivate($id)
    {
        $logistic = User::where('type', 'logistic')->findOrFail($id);
        $logistic->update(['active' => true]);
        return redirect()->route('logistics.index')->with('message', 'Logistic reactivated successfully');
    }

    public function generateReport(Request $request)
    {
        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');
        $verificationStatus = $request->get('verification_status', 'all');
        $search = $request->get('search');
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $format = $request->get('format', 'view'); // view, csv, pdf
        $display = $request->get('display', false); // true for display mode
        $paperSize = $request->get('paper_size', 'A4'); // A4, Letter, Legal, A3
        $orientation = $request->get('orientation', 'landscape'); // portrait, landscape

        // Validate sort parameters
        $allowedSortFields = ['id', 'name', 'status', 'registration_date', 'email_verified_at'];
        if (!in_array($sortBy, $allowedSortFields)) {
            $sortBy = 'created_at';
        }
        if (!in_array($sortOrder, ['asc', 'desc'])) {
            $sortOrder = 'desc';
        }

        $query = User::where('type', 'logistic')
            ->with('defaultAddress:id,user_id,street,barangay,city,province');

        // Filter by registration date range
        if ($startDate) {
            $query->whereDate('registration_date', '>=', $startDate);
        }
        if ($endDate) {
            $query->whereDate('registration_date', '<=', $endDate);
        }

        // Filter by verification status
        if ($verificationStatus !== 'all') {
            if ($verificationStatus === 'verified') {
                $query->whereNotNull('email_verified_at');
            } elseif ($verificationStatus === 'pending') {
                $query->whereNull('email_verified_at');
            }
        }

        // Search filter
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('contact_number', 'like', "%{$search}%")
                    ->orWhere('id', 'like', "%{$search}%");
            });
        }

        $logistics = $query->get()->map(function ($logistic) {
            // Add formatted address to the model
            $logistic->formatted_address = $logistic->defaultAddress 
                ? $logistic->defaultAddress->full_address 
                : 'N/A';
            return $logistic;
        });

        // Apply sorting using collection methods (same pattern as sales report)
        $logistics = $logistics->sortBy(function ($logistic) use ($sortBy) {
            switch ($sortBy) {
                case 'name':
                    return $logistic->name;
                case 'status':
                    return $logistic->email_verified_at ? 'verified' : 'pending';
                case 'registration_date':
                    return $logistic->registration_date ? $logistic->registration_date->timestamp : 0;
                case 'email_verified_at':
                    return $logistic->email_verified_at ? $logistic->email_verified_at->timestamp : 0;
                default:
                    return $logistic->{$sortBy} ?? 0;
            }
        }, SORT_REGULAR, $sortOrder === 'desc')->values();

        // Calculate summary statistics
        $summary = [
            'total_logistics' => $logistics->count(),
            'active_logistics' => $logistics->where('email_verified_at', '!=', null)->count(),
            'pending_verification' => $logistics->where('email_verified_at', null)->count(),
            'recent_registrations' => $logistics->where('created_at', '>=', now()->subDays(30))->count(),
        ];

        // If export is requested
        if ($format === 'csv') {
            return $this->exportToCsv($logistics, $display);
        } elseif ($format === 'pdf') {
            return $this->exportToPdf($logistics, $display, $paperSize, $orientation);
        }

        // Return view for display
        return Inertia::render('Admin/Logistics/report', [
            'logistics' => $logistics,
            'summary' => $summary,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'verification_status' => $verificationStatus,
                'search' => $search,
            ],
        ]);
    }

    private function exportToCsv($logistics, $display = false)
    {
        $filename = 'logistics_report_' . date('Y-m-d_H-i-s') . '.csv';

        if ($display) {
            // For display mode, return as plain text to show in browser
            $headers = [
                'Content-Type' => 'text/plain',
                'Content-Disposition' => 'inline; filename="' . $filename . '"',
            ];
        } else {
            // For download mode, return as CSV attachment
            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            ];
        }

        $callback = function () use ($logistics) {
            $file = fopen('php://output', 'w');

            // Write headers
            fputcsv($file, [
                'ID',
                'Name',
                'Email',
                'Contact Number',
                'Address',
                'Registration Date',
                'Created Date'
            ]);

            // Write logistics data
            foreach ($logistics as $logistic) {
                fputcsv($file, [
                    $logistic->id,
                    $logistic->name,
                    $logistic->email,
                    $logistic->contact_number ?? 'N/A',
                    $logistic->formatted_address ?? 'N/A',
                    $logistic->registration_date ? $logistic->registration_date->format('Y-m-d') : 'N/A',
                    $logistic->created_at->format('Y-m-d H:i:s')
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function exportToPdf($logistics, $display = false, $paperSize = 'A4', $orientation = 'landscape')
    {
        // Encode logo as base64 for PDF embedding
        $logoPath = storage_path('app/public/logo/SMMC Logo-1.png');
        $logoBase64 = '';
        if (file_exists($logoPath)) {
            $imageData = file_get_contents($logoPath);
            $logoBase64 = 'data:image/png;base64,' . base64_encode($imageData);
        }

        $html = view('reports.logistics-pdf', [
            'logistics' => $logistics,
            'generated_at' => now()->format('Y-m-d H:i:s'),
            'logo_base64' => $logoBase64
        ])->render();

        $pdf = Pdf::loadHTML($html);
        
        // Set paper size and orientation (supports: A4, Letter, Legal, A3, etc.)
        $pdf->setPaper($paperSize, $orientation);

        $filename = 'logistics_report_' . date('Y-m-d_H-i-s') . '.pdf';

        return $display ? $pdf->stream($filename) : $pdf->download($filename);
    }

    /**
     * Hard delete a logistic (permanent deletion)
     */
    public function hardDelete($id)
    {
        $logistic = User::where('type', 'logistic')->findOrFail($id);

        // Check if logistic has any linked data
        $hasLinkedData = false;
        $linkedDataReasons = [];

        // Check for pending orders
        if ($logistic->hasPendingOrders()) {
            $hasLinkedData = true;
            $linkedDataReasons[] = 'has active deliveries';
        }

        // Check for any assigned orders (including completed)
        $totalOrdersCount = \DB::table('orders')
            ->where('logistic_id', $logistic->id)
            ->count();
        
        if ($totalOrdersCount > 0 && !$logistic->hasPendingOrders()) {
            $hasLinkedData = true;
            $linkedDataReasons[] = "has {$totalOrdersCount} order record(s)";
        }

        // Check for delivery proofs
        $deliveryProofsCount = \DB::table('delivery_proofs')
            ->where('logistic_id', $logistic->id)
            ->count();
        
        if ($deliveryProofsCount > 0) {
            $hasLinkedData = true;
            $linkedDataReasons[] = "has {$deliveryProofsCount} delivery proof(s)";
        }

        if ($hasLinkedData) {
            return redirect()->route('logistics.index')
                ->with('error', 'Cannot delete logistic: ' . implode(', ', $linkedDataReasons) . '.');
        }

        // Delete the logistic
        $logistic->delete();

        return redirect()->route('logistics.index')
            ->with('message', 'Logistic deleted successfully.');
    }
}
