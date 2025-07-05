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
            'email' => 'required|email|unique:logistics,email',
            'phone' => 'nullable|string|max:20',
        ]);

        Logistic::create($request->only(['name', 'email', 'phone']));

        return redirect()->route('logistics.index')->with('message', 'Logistic added successfully');
    }

}
