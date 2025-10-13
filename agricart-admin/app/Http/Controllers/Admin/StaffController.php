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
    public function index()
    {
        $staff = User::where('type', 'staff')
            ->with('roles', 'permissions')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Admin/Staff/index', [
            'staff' => $staff,
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
            'view membership', 'create members', 'edit members', 'delete members',
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
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'regex:/^\S*$/', Rules\Password::min(8)->letters()->mixedCase()->numbers()->symbols()],
            'permissions' => 'array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'type' => 'staff',
            'is_default' => true, // Default account created by admin
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
            'view membership', 'create members', 'edit members', 'delete members',
            'generate staff report', 'generate membership report'
        ])->get();

        return Inertia::render('Admin/Staff/edit', [
            'staff' => $staff->load('roles', 'permissions'),
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
            'password' => ['nullable', 'confirmed', 'regex:/^\S*$/', Rules\Password::min(8)->letters()->mixedCase()->numbers()->symbols()],
            'permissions' => 'array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        $staff->update([
            'name' => $request->name,
            'email' => $request->email,
        ]);

        if ($request->filled('password')) {
            $staff->update([
                'password' => Hash::make($request->password),
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
        // Get all staff members with their permissions
        $staff = User::where('type', 'staff')
            ->with('permissions')
            ->orderBy('created_at', 'desc')
            ->get();

        // Calculate summary statistics
        $summary = [
            'total_staff' => $staff->count(),
            'total_permissions' => Permission::count(),
            'active_staff' => $staff->where('email_verified_at', '!=', null)->count(),
            'staff_with_permissions' => $staff->filter(function ($member) {
                return $member->permissions->count() > 0;
            })->count(),
        ];

        // Check if format is specified for export
        if ($request->filled('format')) {
            $display = $request->get('display', false);
            if ($request->format === 'pdf') {
                return $this->exportToPdf($staff, $summary, $display);
            } elseif ($request->format === 'csv') {
                return $this->exportToCsv($staff, $summary, $display);
            }
        }

        // Return Inertia page for report view
        return Inertia::render('Admin/Staff/report', [
            'staff' => $staff,
            'summary' => $summary,
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
            'create orders' => 'view orders',
            'edit orders' => 'view orders',
            'delete orders' => 'view orders',
            'create logistics' => 'view logistics',
            'edit logistics' => 'view logistics',
            'delete logistics' => 'view logistics',
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