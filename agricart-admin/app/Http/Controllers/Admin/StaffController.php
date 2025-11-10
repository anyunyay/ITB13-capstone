<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Helpers\SystemLogger;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Barryvdh\DomPDF\Facade\Pdf;

class StaffController extends Controller
{
    /**
     * Display a listing of staff members.
     */
    public function index(Request $request)
    {
        $query = User::where('type', 'staff')
            ->with('roles', 'permissions', 'defaultAddress');

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('contact_number', 'like', "%{$search}%");
            });
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        
        $allowedSortFields = ['id', 'name', 'email', 'created_at'];
        if (in_array($sortBy, $allowedSortFields)) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        // Pagination
        $perPage = $request->get('per_page', 10);
        $staff = $query->paginate($perPage);

        // Calculate stats
        $totalStaff = User::where('type', 'staff')->count();
        $activeStaff = User::where('type', 'staff')->whereNotNull('email_verified_at')->count();
        $inactiveStaff = $totalStaff - $activeStaff;
        $totalPermissions = Permission::count();
        $recentStaff = User::where('type', 'staff')
            ->where('created_at', '>=', now()->subDays(30))
            ->count();

        $staffStats = [
            'totalStaff' => $totalStaff,
            'activeStaff' => $activeStaff,
            'inactiveStaff' => $inactiveStaff,
            'totalPermissions' => $totalPermissions,
            'recentStaff' => $recentStaff,
        ];

        return Inertia::render('Admin/Staff/index', [
            'staff' => $staff,
            'staffStats' => $staffStats,
            'filters' => [
                'search' => $request->get('search', ''),
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
                'per_page' => $perPage,
            ],
        ]);
    }

    /**
     * Show the form for creating a new staff member.
     */
    public function create()
    {
        // Get all permissions except staff and member management
        $availablePermissions = Permission::whereNotIn('name', [
            'view staffs', 'create staffs', 'edit staffs', 'delete staffs',
            'view membership', 'create members', 'edit members', 'deactivate members', 'reactivate members',
            'generate staff report', 'generate membership report'
        ])->get();

        return Inertia::render('Admin/Staff/create', [
            'availablePermissions' => $availablePermissions,
        ]);
    }

    /**
     * Store a newly created staff member.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|regex:/^[A-Za-z\s]+$/',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'string', 'min:8', 'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/'],
            'contact_number' => [
                'required',
                'numeric',
                'unique:users,contact_number',
                'regex:/^(\+639|09)\d{9}$/',
            ],
            'permissions' => 'array',
            'permissions.*' => 'string|exists:permissions,name',
            'street' => 'required|string|max:255',
            'barangay' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'province' => 'required|string|max:255',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'contact_number' => $request->contact_number,
            'type' => 'staff',
            'email_verified_at' => now(), // Automatically verify email for staff
        ]);

        // Create address
        $user->userAddresses()->create([
            'street' => $request->input('street'),
            'barangay' => $request->input('barangay'),
            'city' => $request->input('city'),
            'province' => $request->input('province'),
            'is_active' => true,
        ]);

        // Assign staff role
        $staffRole = Role::where('name', 'staff')->first();
        $user->assignRole($staffRole);

        // Assign selected permissions with default view permissions
        if ($request->has('permissions')) {
            $permissions = $this->addDefaultViewPermissions($request->permissions);
            $user->syncPermissions($permissions);
        }

        // Log staff creation
        SystemLogger::logUserManagement(
            'create_staff',
            $user->id,
            $request->user()->id,
            'admin',
            [
                'staff_name' => $user->name,
                'staff_email' => $user->email,
                'permissions_count' => count($request->permissions ?? []),
                'permissions' => $request->permissions
            ]
        );

        return redirect()->route('staff.index')
            ->with('message', 'Staff member created successfully.');
    }

    /**
     * Show the form for editing the specified staff member.
     */
    public function edit(User $staff)
    {
        if ($staff->type !== 'staff') {
            abort(404);
        }

        // Get all permissions except staff and member management
        $availablePermissions = Permission::whereNotIn('name', [
            'view staffs', 'create staffs', 'edit staffs', 'delete staffs',
            'view membership', 'create members', 'edit members', 'deactivate members', 'reactivate members',
            'generate staff report', 'generate membership report'
        ])->get();

        return Inertia::render('Admin/Staff/edit', [
            'staff' => $staff->load('roles', 'permissions', 'defaultAddress'),
            'availablePermissions' => $availablePermissions,
        ]);
    }

    /**
     * Update the specified staff member.
     */
    public function update(Request $request, User $staff)
    {
        if ($staff->type !== 'staff') {
            abort(404);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $staff->id,
            'password' => ['nullable', 'confirmed', 'string', 'min:8', 'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/'],
            'contact_number' => [
                'required',
                'numeric',
                'unique:users,contact_number,' . $staff->id,
                'regex:/^(\+639|09)\d{9}$/',
            ],
            'permissions' => 'array',
            'permissions.*' => 'string|exists:permissions,name',
            'street' => 'required|string|max:255',
            'barangay' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'province' => 'required|string|max:255',
        ]);

        $staff->update([
            'name' => $request->name,
            'email' => $request->email,
            'contact_number' => $request->contact_number,
        ]);

        if ($request->filled('password')) {
            $staff->update([
                'password' => Hash::make($request->password),
            ]);
        }

        // Update or create address
        $defaultAddress = $staff->defaultAddress;
        if ($defaultAddress) {
            $defaultAddress->update([
                'street' => $request->input('street'),
                'barangay' => $request->input('barangay'),
                'city' => $request->input('city'),
                'province' => $request->input('province'),
            ]);
        } else {
            $staff->userAddresses()->create([
                'street' => $request->input('street'),
                'barangay' => $request->input('barangay'),
                'city' => $request->input('city'),
                'province' => $request->input('province'),
                'is_active' => true,
            ]);
        }

        // Sync permissions with default view permissions
        if ($request->has('permissions')) {
            $permissions = $this->addDefaultViewPermissions($request->permissions);
            $staff->syncPermissions($permissions);
        } else {
            $staff->syncPermissions([]);
        }

        // Log staff update
        SystemLogger::logUserManagement(
            'update_staff',
            $staff->id,
            $request->user()->id,
            'admin',
            [
                'staff_name' => $staff->name,
                'staff_email' => $staff->email,
                'permissions_count' => count($request->permissions ?? []),
                'permissions' => $request->permissions,
                'password_changed' => $request->filled('password')
            ]
        );

        return redirect()->route('staff.index')
            ->with('message', 'Staff member updated successfully.');
    }

    /**
     * Remove the specified staff member.
     */
    public function destroy(User $staff)
    {
        if ($staff->type !== 'staff') {
            abort(404);
        }

        // Log staff deletion
        SystemLogger::logUserManagement(
            'delete_staff',
            $staff->id,
            request()->user()->id,
            'admin',
            [
                'staff_name' => $staff->name,
                'staff_email' => $staff->email
            ]
        );

        $staff->delete();

        return redirect()->route('staff.index')
            ->with('message', 'Staff member deleted successfully.');
    }

    /**
     * Generate staff report
     */
    public function generateReport(Request $request)
    {
        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');
        $status = $request->get('status', 'all');
        $search = $request->get('search');
        $sortBy = $request->get('sort_by', 'id');
        $sortOrder = $request->get('sort_order', 'desc');
        $format = $request->get('format', 'view'); // view, csv, pdf
        $display = $request->get('display', false); // true for display mode

        $query = User::where('type', 'staff')->with('permissions');

        // Filter by date range (based on staff creation date)
        if ($startDate) {
            $query->whereDate('created_at', '>=', $startDate);
        }
        if ($endDate) {
            $query->whereDate('created_at', '<=', $endDate);
        }

        // Filter by status
        if ($status !== 'all') {
            if ($status === 'active') {
                $query->whereNotNull('email_verified_at');
            } elseif ($status === 'inactive') {
                $query->whereNull('email_verified_at');
            }
        }

        // Search functionality
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('contact_number', 'like', "%{$search}%")
                  ->orWhereHas('permissions', function($permQuery) use ($search) {
                      $permQuery->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Get all staff for summary calculations
        $allStaff = $query->get();

        // Calculate summary statistics from filtered results
        $summary = [
            'total_staff' => $allStaff->count(),
            'total_permissions' => Permission::count(),
            'active_staff' => $allStaff->where('email_verified_at', '!=', null)->count(),
            'staff_with_permissions' => $allStaff->filter(function ($member) {
                return $member->permissions->count() > 0;
            })->count(),
        ];

        // Apply sorting
        $staff = $allStaff->sortBy(function ($member) use ($sortBy) {
            switch ($sortBy) {
                case 'name':
                    return $member->name;
                case 'email':
                    return $member->email;
                case 'contact_number':
                    return $member->contact_number ?? '';
                case 'permissions':
                    return $member->permissions->count();
                case 'created_at':
                    return $member->created_at->timestamp;
                default:
                    return $member->id;
            }
        }, SORT_REGULAR, $sortOrder === 'desc')->values();

        // If export is requested
        if ($format === 'csv') {
            return $this->exportToCsv($staff, $summary, $display);
        } elseif ($format === 'pdf') {
            return $this->exportToPdf($staff, $summary, $display);
        }

        // Return Inertia page for report view
        return Inertia::render('Admin/Staff/report', [
            'staff' => $staff,
            'summary' => $summary,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'status' => $status,
                'search' => $search,
            ],
        ]);
    }

    /**
     * Export staff report to CSV
     */
    private function exportToCsv($staff, $summary, $display = false)
    {
        $filename = 'staff_report_' . now()->format('Y-m-d_H-i-s') . '.csv';
        
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

        $callback = function() use ($staff, $summary) {
            $file = fopen('php://output', 'w');
            
            // Write headers
            fputcsv($file, [
                'Staff ID',
                'Name',
                'Email',
                'Permissions',
                'Created At',
                'Email Verified'
            ]);
            
            foreach ($staff as $member) {
                $permissions = $member->permissions->pluck('name')->join(', ');
                fputcsv($file, [
                    $member->id,
                    $member->name,
                    $member->email,
                    $permissions ?: 'No permissions',
                    $member->created_at->format('Y-m-d H:i:s'),
                    $member->email_verified_at ? 'Yes' : 'No'
                ]);
            }
            
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Export staff report to PDF
     */
    private function exportToPdf($staff, $summary, $display = false)
    {
        $html = view('reports.staff-pdf', [
            'staff' => $staff,
            'summary' => $summary,
            'generated_at' => now()->format('Y-m-d H:i:s'),
        ])->render();

        $pdf = Pdf::loadHTML($html);
        $pdf->setPaper('A4', 'landscape');
        
        $filename = 'staff_report_' . date('Y-m-d_H-i-s') . '.pdf';
        
        return $display ? $pdf->stream($filename) : $pdf->download($filename);
    }

    /**
     * Add default view permissions when create/edit/delete permissions are assigned
     */
    private function addDefaultViewPermissions(array $permissions): array
    {
        $permissionMappings = [
            'create products' => 'view inventory',
            'edit products' => 'view inventory',
            'delete products' => 'view inventory',
            'archive products' => 'view archive',
            'unarchive products' => 'view archive',
            'delete archived products' => 'view archive',
            'create stocks' => 'view stocks',
            'edit stocks' => 'view stocks',
            'delete stocks' => 'view stocks',
            'manage orders' => 'view orders',
            'create logistics' => 'view logistics',
            'edit logistics' => 'view logistics',
            'deactivate logistics' => 'view logistics',
            'reactivate logistics' => 'view logistics',
        ];

        $finalPermissions = $permissions;

        foreach ($permissions as $permission) {
            if (isset($permissionMappings[$permission])) {
                $viewPermission = $permissionMappings[$permission];
                if (!in_array($viewPermission, $finalPermissions)) {
                    $finalPermissions[] = $viewPermission;
                }
            }
        }

        return array_unique($finalPermissions);
    }
} 