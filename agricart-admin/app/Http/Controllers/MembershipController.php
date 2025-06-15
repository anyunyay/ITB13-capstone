<?php

namespace App\Http\Controllers;

use App\Models\Member;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MembershipController extends Controller
{
    public function index()
    {
        return Inertia::render('Membership/index', []);
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
}
