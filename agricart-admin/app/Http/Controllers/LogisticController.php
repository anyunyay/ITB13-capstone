<?php

namespace App\Http\Controllers;

use App\Models\Logistic;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LogisticController extends Controller
{
    public function index()
    {
        $logistics = Logistic::all();
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
            'email' => 'required|email|unique:members,email',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'registration_date' => 'nullable|date',
        ]);
            
        Logistic::create([
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'phone' => $request->input('phone'),
            'address' => $request->input('address'),
            'registration_date' => $request->input('registration_date', now()),
        ]);

        return redirect()->route('logistics.index')->with('message', 'Logistic added successfully');
    }

    public function edit(Logistic $logistic)
    {
        return Inertia::render('Logistics/edit', compact('logistic'));
    }

    public function update(Request $request, Logistic $logistic)
    {
        // Validate the request data
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:members,email,' . $logistic->id,
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'registration_date' => 'nullable|date',
        ]);

        if ($logistic) {
            $logistic->update([
                'name' => $request->input('name'),
                'email' => $request->input('email'),
                'phone' => $request->input('phone'),
                'address' => $request->input('address'),
                'registration_date' => $request->input('registration_date') ?? now(),
            ]);
        }
        
        $logistic->save();
        return redirect()->route('logistics.index')->with('message', 'Logistic Details updated successfully');
    }

    public function destroy(Logistic $logistic)
    {
        $logistic->delete();
        return redirect()->route('logistics.index')->with('message', 'Logistic removed successfully');
    }
}
