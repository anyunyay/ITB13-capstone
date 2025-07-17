<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MembershipController extends Controller
{
    public function index()
    {
        $members = User::where('type', 'member')->get();
        return Inertia::render('Membership/index', compact('members'));
    }

    public function add()
    {
        return Inertia::render('Membership/add', []);
    }

    public function store(Request $request)
    {
        // Validate the request data
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'registration_date' => 'nullable|date',
            'document' => 'required|file|mimes:pdf,doc,docx,jpeg,png,jpg,svg|max:2048',
        ]);

        if ($request->file('document')) {
            $image = $request->file('document');
            $imageName = time() . '.' . $image->getClientOriginalExtension();
            $image->move(public_path('images/documents/'), $imageName);
            
            User::create([
                'name' => $request->input('name'),
                'email' => $request->input('email'),
                'phone' => $request->input('phone'),
                'address' => $request->input('address'),
                'registration_date' => $request->input('registration_date', now()),
                'document' => 'images/documents/' . $imageName,
                'type' => 'member',
                'password' => bcrypt('password'), // Default password
            ]);
        }

        return redirect()->route('membership.index')->with('message', 'Member added successfully');
    }

    public function edit($id)
    {
        $member = User::where('type', 'member')->findOrFail($id);
        return Inertia::render('Membership/edit', compact('member'));
    }

    public function update(Request $request, $id)
    {
        // Validate the request data
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $id,
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'registration_date' => 'nullable|date',
            'document' => 'nullable|file|mimes:pdf,doc,docx,jpeg,png,jpg,svg|max:2048',
        ]);

        $member = User::where('type', 'member')->findOrFail($id);
        $member->update([
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'phone' => $request->input('phone'),
            'address' => $request->input('address'),
            'registration_date' => $request->input('registration_date') ?? now(),
        ]);
        
        if ($request->file('document')) {
            // Optionally delete old file
            if ($member->document && file_exists(public_path($member->document))) {
                unlink(public_path($member->document));
            }
            $image = $request->file('document');
            $imageName = time() . '.' . $image->getClientOriginalExtension();
            $image->move(public_path('images/documents'), $imageName);
            $member->document = 'images/documents/' . $imageName;
        }

        $member->save();
        return redirect()->route('membership.index')->with('message', 'Member Details updated successfully');
    }

    public function destroy($id)
    {
        // Delete the image file if it exists
        $member = User::where('type', 'member')->findOrFail($id);
        if ($member->document && file_exists(public_path($member->document))) {
            unlink(public_path($member->document));
        }
        
        $member->delete();
        return redirect()->route('membership.index')->with('message', 'Member removed successfully');
    }
}
