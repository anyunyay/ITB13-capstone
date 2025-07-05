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

}
