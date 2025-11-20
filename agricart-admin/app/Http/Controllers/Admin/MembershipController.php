<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\PasswordChangeRequest;
use App\Notifications\MembershipUpdateNotification;
use App\Helpers\SystemLogger;
use App\Services\FileUploadService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Response;
use Barryvdh\DomPDF\Facade\Pdf;

class MembershipController extends Controller
{
    public function index()
    {
        // Optimize: Load only essential member data (keep as collection for frontend compatibility)
        $fileService = new \App\Services\FileUploadService();

        $members = User::where('type', 'member')
            ->with('defaultAddress:id,user_id,street,barangay,city,province')
            ->select('id', 'name', 'member_id', 'contact_number', 'registration_date', 'document', 'type', 'active', 'created_at')
            ->orderBy('name')
            ->limit(500) // Limit instead of paginate to maintain frontend compatibility
            ->get()
            ->map(function ($member) use ($fileService) {
                // Check if member has active stocks
                $hasActiveStocks = $member->hasActiveStocks();
                $canBeDeactivated = $member->active && !$hasActiveStocks;
                $deactivationReason = null;

                if ($member->active && $hasActiveStocks) {
                    $deactivationReason = 'Cannot deactivate: Member has active stocks in the inventory.';
                }

                // Check if member can be deleted (no linked data)
                $hasLinkedData = false;
                $linkedDataReasons = [];

                // Check for active stocks
                if ($hasActiveStocks) {
                    $hasLinkedData = true;
                    $linkedDataReasons[] = 'has active stocks';
                }

                // Check for any stocks (including sold)
                $totalStocksCount = \DB::table('stocks')
                    ->where('member_id', $member->id)
                    ->count();

                if ($totalStocksCount > 0 && !$hasActiveStocks) {
                    $hasLinkedData = true;
                    $linkedDataReasons[] = "has {$totalStocksCount} stock record(s)";
                }

                // Check for stock trail entries (historical stock changes)
                $stockTrailCount = \DB::table('stock_trails')
                    ->where('member_id', $member->id)
                    ->count();

                if ($stockTrailCount > 0) {
                    $hasLinkedData = true;
                    $linkedDataReasons[] = "has {$stockTrailCount} stock trail record(s)";
                }

                // Check for member earnings records
                $earningsCount = \DB::table('member_earnings')
                    ->where('member_id', $member->id)
                    ->count();

                if ($earningsCount > 0) {
                    $hasLinkedData = true;
                    $linkedDataReasons[] = "has {$earningsCount} earning record(s)";
                }

                $canBeDeleted = !$hasLinkedData;
                $deletionReason = $hasLinkedData
                    ? 'Cannot delete: Member ' . implode(', ', $linkedDataReasons) . '.'
                    : null;

                return [
                    'id' => $member->id,
                    'name' => $member->name,
                    'member_id' => $member->member_id,
                    'contact_number' => $member->contact_number,
                    'registration_date' => $member->registration_date ? $member->registration_date->format('Y-m-d') : null,
                    'document' => $member->document ? $fileService->getFileUrl($member->document, 'documents') : null,
                    'type' => $member->type,
                    'active' => $member->active,
                    'default_address' => $member->defaultAddress ? [
                        'id' => $member->defaultAddress->id,
                        'street' => $member->defaultAddress->street,
                        'barangay' => $member->defaultAddress->barangay,
                        'city' => $member->defaultAddress->city,
                        'province' => $member->defaultAddress->province,
                        'full_address' => $member->defaultAddress->full_address,
                    ] : null,
                    'can_be_deactivated' => $canBeDeactivated,
                    'deactivation_reason' => $deactivationReason,
                    'can_be_deleted' => $canBeDeleted,
                    'deletion_reason' => $deletionReason,
                ];
            });

        // Get pending password change requests (limit to recent ones)
        $pendingPasswordRequests = PasswordChangeRequest::with(['member:id,name,member_id', 'approvedBy:id,name'])
            ->where('status', 'pending')
            ->orderBy('requested_at', 'desc')
            ->limit(20) // Limit to recent requests
            ->get();

        return Inertia::render('Admin/Membership/index', [
            'members' => $members,
            'pendingPasswordRequests' => $pendingPasswordRequests
        ]);
    }

    public function add()
    {
        return Inertia::render('Admin/Membership/add', []);
    }

    public function checkDuplicateName(Request $request)
    {
        $name = $request->input('name');
        $excludeId = $request->input('exclude_id');

        $query = User::where('type', 'member')->where('name', $name);

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        $exists = $query->exists();

        return response()->json(['exists' => $exists]);
    }

    public function checkDuplicateContact(Request $request)
    {
        $contactNumber = $request->input('contact_number');
        $excludeId = $request->input('exclude_id');

        $query = User::where('contact_number', $contactNumber);

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        $exists = $query->exists();

        return response()->json(['exists' => $exists]);
    }

    public function store(Request $request, FileUploadService $fileService)
    {
        // Validate the request data
        $validationRules = [
            'name' => 'required|string|max:255',
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
        ];

        // Add document validation rules
        $validationRules['document'] = FileUploadService::getValidationRules('documents', true);

        $request->validate($validationRules);

        try {
            // Upload document using file service
            $documentPath = null;
            if ($request->hasFile('document')) {
                $documentPath = $fileService->uploadFile(
                    $request->file('document'),
                    'documents',
                    $request->input('name') . '_document'
                );
            }

            $member = User::create([
                'name' => $request->input('name'),
                'email' => null, // Email not required for members - they use member_id for login
                'password' => bcrypt($request->input('password')),
                'contact_number' => $request->input('contact_number'),
                'registration_date' => $request->input('registration_date', now()),
                'document' => $documentPath,
                'type' => 'member',
                // member_id will be auto-generated by the User model's booted() method
                'email_verified_at' => now(), // Automatically verify email
                'is_default' => true, // Require password change on first login
            ]);

            // Create address
            $member->userAddresses()->create([
                'street' => $request->input('street'),
                'barangay' => $request->input('barangay'),
                'city' => $request->input('city'),
                'province' => $request->input('province'),
                'is_active' => true,
            ]);

            // Notify admin and staff about membership update (optimized with caching)
            $adminUsers = cache()->remember('admin_staff_users', 300, function () {
                return \App\Models\User::whereIn('type', ['admin', 'staff'])
                    ->select('id', 'name', 'email')
                    ->get();
            });
            foreach ($adminUsers as $admin) {
                $admin->notify(new MembershipUpdateNotification($member, 'added'));
            }

            return redirect()->route('membership.index')->with('message', 'Member added successfully');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'document' => 'Failed to upload document: ' . $e->getMessage()
            ])->withInput();
        }
    }

    public function edit($id)
    {
        $member = User::where('type', 'member')
            ->with('defaultAddress')
            ->findOrFail($id);

        $fileService = new \App\Services\FileUploadService();

        // Transform document path to URL
        if ($member->document) {
            $member->document = $fileService->getFileUrl($member->document, 'documents');
        }

        return Inertia::render('Admin/Membership/edit', compact('member'));
    }

    public function update(Request $request, $id, FileUploadService $fileService)
    {
        $member = User::where('type', 'member')->findOrFail($id);

        // Validate the request data
        $validationRules = [
            'name' => 'required|string|max:255',
            'contact_number' => [
                'required',
                'numeric',
                'unique:users,contact_number,' . $id,
                'regex:/^(\+639|09)\d{9}$/',
            ],
            'registration_date' => 'nullable|date',
            'member_id' => 'nullable|string|unique:users,member_id,' . $id,
            'street' => 'required|string|max:255',
            'barangay' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'province' => 'required|string|max:255',
        ];

        // Add document validation rules (optional for updates)
        $validationRules['document'] = FileUploadService::getValidationRules('documents', false);

        $request->validate($validationRules);

        // Check if document is marked for deletion but no new file is uploaded
        if ($member->document_marked_for_deletion && !$request->hasFile('document')) {
            return back()->withErrors([
                'document' => 'A new document must be uploaded to replace the one marked for deletion.'
            ]);
        }

        try {
            $member->update([
                'name' => $request->input('name'),
                'contact_number' => $request->input('contact_number'),
                'registration_date' => $request->input('registration_date') ?? now(),
                'member_id' => $request->input('member_id'),
            ]);

            // Update or create address
            $defaultAddress = $member->defaultAddress;
            if ($defaultAddress) {
                $defaultAddress->update([
                    'street' => $request->input('street'),
                    'barangay' => $request->input('barangay'),
                    'city' => $request->input('city'),
                    'province' => $request->input('province'),
                ]);
            } else {
                $member->userAddresses()->create([
                    'street' => $request->input('street'),
                    'barangay' => $request->input('barangay'),
                    'city' => $request->input('city'),
                    'province' => $request->input('province'),
                    'is_active' => true,
                ]);
            }

            // Handle document update if new file is uploaded
            if ($request->hasFile('document')) {
                // Always pass the current document path for deletion when uploading a new one
                $oldDocumentPath = $member->document;

                $newDocumentPath = $fileService->updateFile(
                    $request->file('document'),
                    'documents',
                    $oldDocumentPath, // Always delete the old document
                    $request->input('name') . '_document'
                );
                $member->document = $newDocumentPath;
                $member->document_marked_for_deletion = false; // Reset the flag
            }

            $member->save();

            // Notify admin and staff about membership update (optimized with caching)
            $adminUsers = cache()->remember('admin_staff_users', 300, function () {
                return \App\Models\User::whereIn('type', ['admin', 'staff'])
                    ->select('id', 'name', 'email')
                    ->get();
            });
            foreach ($adminUsers as $admin) {
                $admin->notify(new MembershipUpdateNotification($member, 'updated'));
            }

            return redirect()->route('membership.index')->with('message', 'Member Details updated successfully');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'document' => 'Failed to update document: ' . $e->getMessage()
            ])->withInput();
        }
    }

    public function destroy($id)
    {
        $member = User::where('type', 'member')->findOrFail($id);

        // Check if member has active stocks
        if ($member->hasActiveStocks()) {
            return redirect()->route('membership.index')->with('error', 'Cannot deactivate: member has active stocks.');
        }

        // Deactivate instead of deleting
        $member->update(['active' => false]);

        // Notify admin and staff about membership update (optimized with caching)
        $adminUsers = cache()->remember('admin_staff_users', 300, function () {
            return \App\Models\User::whereIn('type', ['admin', 'staff'])
                ->select('id', 'name', 'email')
                ->get();
        });
        foreach ($adminUsers as $admin) {
            $admin->notify(new MembershipUpdateNotification($member, 'deactivated'));
        }

        return redirect()->route('membership.index')->with('message', 'Member deactivated successfully');
    }

    public function deactivated()
    {
        $fileService = new \App\Services\FileUploadService();

        $deactivatedMembers = User::where('type', 'member')
            ->inactive()
            ->with('defaultAddress')
            ->get()
            ->map(function ($member) use ($fileService) {
                if ($member->document) {
                    $member->document = $fileService->getFileUrl($member->document, 'documents');
                }
                return $member;
            });

        return Inertia::render('Admin/Membership/deactivated', compact('deactivatedMembers'));
    }

    public function reactivate($id)
    {
        $member = User::where('type', 'member')->findOrFail($id);
        $member->update(['active' => true]);

        // Notify admin and staff about membership update (optimized with caching)
        $adminUsers = cache()->remember('admin_staff_users', 300, function () {
            return \App\Models\User::whereIn('type', ['admin', 'staff'])
                ->select('id', 'name', 'email')
                ->get();
        });
        foreach ($adminUsers as $admin) {
            $admin->notify(new MembershipUpdateNotification($member, 'reactivated'));
        }

        return redirect()->route('membership.index')->with('message', 'Member reactivated successfully');
    }

    public function deleteDocument($id)
    {
        $member = User::where('type', 'member')->findOrFail($id);

        // Mark document for deletion instead of deleting immediately
        $member->update(['document_marked_for_deletion' => true]);

        // Notify admin and staff about document marked for deletion (optimized with caching)
        $adminUsers = cache()->remember('admin_staff_users', 300, function () {
            return \App\Models\User::whereIn('type', ['admin', 'staff'])
                ->select('id', 'name', 'email')
                ->get();
        });
        foreach ($adminUsers as $admin) {
            $admin->notify(new MembershipUpdateNotification($member, 'document_marked_for_deletion'));
        }

        return response()->json([
            'success' => true,
            'message' => 'Document marked for deletion. Upload a new file to complete the process.'
        ]);
    }

    public function generateReport(Request $request)
    {
        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');
        $search = $request->get('search');
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $format = $request->get('format', 'view'); // view, csv, pdf
        $display = $request->get('display', false); // true for display mode
        $paperSize = $request->get('paper_size', 'A4'); // A4, Letter, Legal, A3
        $orientation = $request->get('orientation', 'landscape'); // portrait, landscape

        $query = User::where('type', 'member')
            ->with('defaultAddress:id,user_id,street,barangay,city,province');

        // Filter by registration date range
        if ($startDate) {
            $query->whereDate('registration_date', '>=', $startDate);
        }
        if ($endDate) {
            $query->whereDate('registration_date', '<=', $endDate);
        }

        // Search functionality
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                    ->orWhere('id', 'like', '%' . $search . '%')
                    ->orWhere('member_id', 'like', '%' . $search . '%');
            });
        }

        $membersRaw = $query->get();

        // Map members data
        $members = $membersRaw->map(function ($member) {
            return [
                'id' => $member->id,
                'member_id' => $member->member_id,
                'name' => $member->name,
                'contact_number' => $member->contact_number,
                'address' => $member->defaultAddress ? $member->defaultAddress->full_address : 'N/A',
                'registration_date' => $member->registration_date,
                'document' => $member->document,
                'email_verified_at' => $member->email_verified_at,
                'created_at' => $member->created_at,
            ];
        });

        // Apply sorting
        $members = $members->sortBy(function ($member) use ($sortBy) {
            switch ($sortBy) {
                case 'name':
                    return $member['name'];
                case 'member_id':
                    return $member['member_id'] ?? '';
                case 'contact_number':
                    return $member['contact_number'] ?? '';
                case 'registration_date':
                    return $member['registration_date'] ? strtotime($member['registration_date']) : 0;
                case 'created_at':
                    return $member['created_at'] ? strtotime($member['created_at']) : 0;
                default:
                    return $member['id'] ?? 0;
            }
        }, SORT_REGULAR, $sortOrder === 'desc')->values();

        // Calculate summary statistics
        $summary = [
            'total_members' => $members->count(),
            'active_members' => $members->where('email_verified_at', '!=', null)->count(),
            'pending_verification' => $members->where('email_verified_at', null)->count(),
            'recent_registrations' => $members->where('created_at', '>=', now()->subDays(30))->count(),
        ];

        // If export is requested
        if ($format === 'csv') {
            return $this->exportToCsv($members, $display);
        } elseif ($format === 'pdf') {
            return $this->exportToPdf($members, $display, $paperSize, $orientation);
        }

        // Return view for display
        return Inertia::render('Admin/Membership/report', [
            'members' => $members,
            'summary' => $summary,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'search' => $search,
            ],
        ]);
    }

    private function exportToCsv($members, $display = false)
    {
        $filename = 'membership_report_' . date('Y-m-d_H-i-s') . '.csv';

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

        $callback = function () use ($members) {
            $file = fopen('php://output', 'w');

            // Write headers
            fputcsv($file, [
                'ID',
                'Member ID',
                'Name',
                'Contact Number',
                'Address',
                'Registration Date',
                'Created Date'
            ]);

            // Write members data
            foreach ($members as $member) {
                fputcsv($file, [
                    $member['id'],
                    $member['member_id'] ?? 'N/A',
                    $member['name'],
                    $member['contact_number'] ?? 'N/A',
                    $member['address'] ?? 'N/A',
                    $member['registration_date'] ? \Carbon\Carbon::parse($member['registration_date'])->format('Y-m-d') : 'N/A',
                    \Carbon\Carbon::parse($member['created_at'])->format('Y-m-d H:i:s')
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function exportToPdf($members, $display = false, $paperSize = 'A4', $orientation = 'landscape')
    {
        // Encode logo as base64 for PDF embedding
        $logoPath = storage_path('app/public/logo/SMMC Logo-1.png');
        $logoBase64 = '';
        if (file_exists($logoPath)) {
            $imageData = file_get_contents($logoPath);
            $logoBase64 = 'data:image/png;base64,' . base64_encode($imageData);
        }

        $html = view('reports.membership-pdf', [
            'members' => $members,
            'generated_at' => now()->format('Y-m-d H:i:s'),
            'logo_base64' => $logoBase64
        ])->render();

        $pdf = Pdf::loadHTML($html);

        // Set paper size and orientation (supports: A4, Letter, Legal, A3, etc.)
        $pdf->setPaper($paperSize, $orientation);

        $filename = 'membership_report_' . date('Y-m-d_H-i-s') . '.pdf';

        return $display ? $pdf->stream($filename) : $pdf->download($filename);
    }

    /**
     * Approve a password change request
     */
    public function approvePasswordChange(Request $request, $requestId)
    {
        $passwordChangeRequest = PasswordChangeRequest::findOrFail($requestId);

        if ($passwordChangeRequest->status !== 'pending') {
            return back()->with('error', 'This request has already been processed.');
        }

        $passwordChangeRequest->update([
            'status' => 'approved',
            'approved_at' => now(),
            'approved_by' => $request->user()->id,
        ]);

        return back()->with('message', 'Password change request approved successfully. The member can now change their password.');
    }

    /**
     * Reject a password change request
     */
    public function rejectPasswordChange(Request $request, $requestId)
    {
        $passwordChangeRequest = PasswordChangeRequest::findOrFail($requestId);

        if ($passwordChangeRequest->status !== 'pending') {
            return back()->with('error', 'This request has already been processed.');
        }

        $passwordChangeRequest->update([
            'status' => 'rejected',
            'approved_at' => now(),
            'approved_by' => $request->user()->id,
        ]);

        return back()->with('message', 'Password change request rejected.');
    }

    /**
     * Hard delete a member (permanent deletion)
     */
    public function hardDelete($id, FileUploadService $fileService)
    {
        $member = User::where('type', 'member')->findOrFail($id);

        // Check if member has any linked data
        $hasLinkedData = false;
        $linkedDataReasons = [];

        // Check for active stocks
        if ($member->hasActiveStocks()) {
            $hasLinkedData = true;
            $linkedDataReasons[] = 'has active stocks';
        }

        // Check for any stocks (including sold)
        $totalStocksCount = \DB::table('stocks')
            ->where('member_id', $member->id)
            ->count();

        if ($totalStocksCount > 0 && !$member->hasActiveStocks()) {
            $hasLinkedData = true;
            $linkedDataReasons[] = "has {$totalStocksCount} stock record(s)";
        }

        // Check for stock trail entries (historical stock changes)
        $stockTrailCount = \DB::table('stock_trails')
            ->where('member_id', $member->id)
            ->count();

        if ($stockTrailCount > 0) {
            $hasLinkedData = true;
            $linkedDataReasons[] = "has {$stockTrailCount} stock trail record(s)";
        }

        // Check for member earnings records
        $earningsCount = \DB::table('member_earnings')
            ->where('member_id', $member->id)
            ->count();

        if ($earningsCount > 0) {
            $hasLinkedData = true;
            $linkedDataReasons[] = "has {$earningsCount} earning record(s)";
        }

        if ($hasLinkedData) {
            return redirect()->route('membership.index')
                ->with('error', 'Cannot delete member: ' . implode(', ', $linkedDataReasons) . '.');
        }

        // Delete the document file if it exists
        if ($member->document) {
            $fileService->deleteFile($member->document, 'documents');
        }

        // Delete the member
        $member->delete();

        return redirect()->route('membership.index')
            ->with('message', 'Member deleted successfully.');
    }
}
