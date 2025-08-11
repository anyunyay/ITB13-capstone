<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

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
            'view membership', 'create members', 'edit members', 'delete members'
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
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'permissions' => 'array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'type' => 'staff',
        ]);

        // Assign staff role
        $staffRole = Role::where('name', 'staff')->first();
        $user->assignRole($staffRole);

        // Assign selected permissions
        if ($request->has('permissions')) {
            $user->syncPermissions($request->permissions);
        }

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
            'view membership', 'create members', 'edit members', 'delete members'
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
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
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

        // Sync permissions
        if ($request->has('permissions')) {
            $staff->syncPermissions($request->permissions);
        } else {
            $staff->syncPermissions([]);
        }

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

        $staff->delete();

        return redirect()->route('staff.index')
            ->with('message', 'Staff member deleted successfully.');
    }
} 