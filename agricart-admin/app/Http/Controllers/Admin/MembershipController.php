<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Member;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MembershipController extends Controller
{
    public function index()
    {
        $members = Member::all();
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
            'email' => 'required|email|unique:members,email',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'registration_date' => 'nullable|date',
            'document' => 'required|file|mimes:pdf,doc,docx,jpeg,png,jpg,svg|max:2048',
        ]);

        if ($request->file('document')) {
            $image = $request->file('document');
            $imageName = time() . '.' . $image->getClientOriginalExtension();
            $image->move(public_path('images/documents/'), $imageName);
            
            Member::create([
                'name' => $request->input('name'),
                'email' => $request->input('email'),
                'phone' => $request->input('phone'),
                'address' => $request->input('address'),
                'registration_date' => $request->input('registration_date', now()),
                'document' => 'images/documents/' . $imageName,
            ]);
        }

        return redirect()->route('membership.index')->with('message', 'Member added successfully');
    }

    public function edit(Member $member)
    {
        return Inertia::render('Membership/edit', compact('member'));
    }

    public function update(Request $request, Member $member)
    {
        // Validate the request data
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:members,email,' . $member->id,
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'registration_date' => 'nullable|date',
            'document' => ($member->document ? 'nullable' : 'required') . '|file|mimes:pdf,doc,docx,jpeg,png,jpg,svg|max:2048',
        ]);

        if ($member) {
            $member->update([
                'name' => $request->input('name'),
                'email' => $request->input('email'),
                'phone' => $request->input('phone'),
                'address' => $request->input('address'),
                'registration_date' => $request->input('registration_date') ?? now(),
            ]);
        }
        
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

    public function destroy(Member $member)
    {
        // Delete the image file if it exists
        if ($member->document && file_exists(public_path($member->document))) {
            unlink(public_path($member->document));
        }
        
        $member->delete();
        return redirect()->route('membership.index')->with('message', 'Member removed successfully');
    }
}
