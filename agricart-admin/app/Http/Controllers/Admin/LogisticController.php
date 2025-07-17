<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LogisticController extends Controller
{
    public function index()
    {
        $logistics = User::where('type', 'logistic')->get();
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
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'contact_number' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'registration_date' => 'nullable|date',
        ]);
            
        User::create([
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'contact_number' => $request->input('contact_number'),
            'address' => $request->input('address'),
            'registration_date' => $request->input('registration_date', now()),
            'type' => 'logistic',
            'password' => bcrypt('password'), // Default password
        ]);

        return redirect()->route('logistics.index')->with('message', 'Logistic added successfully');
    }

    public function edit($id)
    {
        $logistic = User::where('type', 'logistic')->findOrFail($id);
        return Inertia::render('Logistics/edit', compact('logistic'));
    }

    public function update(Request $request, $id)
    {
        // Validate the request data
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $id,
            'contact_number' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'registration_date' => 'nullable|date',
        ]);

        $logistic = User::where('type', 'logistic')->findOrFail($id);
        if ($logistic) {
            $logistic->update([
                'name' => $request->input('name'),
                'email' => $request->input('email'),
                'contact_number' => $request->input('contact_number'),
                'address' => $request->input('address'),
                'registration_date' => $request->input('registration_date') ?? now(),
            ]);
        }
        
        $logistic->save();
        return redirect()->route('logistics.index')->with('message', 'Logistic Details updated successfully');
    }

    public function destroy($id)
    {
        $logistic = User::where('type', 'logistic')->findOrFail($id);
        $logistic->delete();
        return redirect()->route('logistics.index')->with('message', 'Logistic removed successfully');
    }
}
