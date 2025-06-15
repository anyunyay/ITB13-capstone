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
}
