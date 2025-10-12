<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Response;
use Barryvdh\DomPDF\Facade\Pdf;

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
            'password' => 'required|string|min:8',
            'contact_number' => [
                'required',
                'numeric',
                'unique:users,contact_number',
                'regex:/^(\+639|09)\d{9}$/',
            ],
            'address' => 'nullable|string|max:255',
            'registration_date' => 'nullable|date',
        ]);
            
        User::create([
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'password' => bcrypt($request->input('password')),
            'contact_number' => $request->input('contact_number'),
            'address' => $request->input('address'),
            'registration_date' => $request->input('registration_date', now()),
            'type' => 'logistic',
            'email_verified_at' => now(), // Automatically verify email
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
            'contact_number' => [
                'required',
                'numeric',
                'unique:users,contact_number,' . $id,
                'regex:/^(\+639|09)\d{9}$/',
            ],
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

    public function generateReport(Request $request)
    {
        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');
        $format = $request->get('format', 'view'); // view, csv, pdf
        $display = $request->get('display', false); // true for display mode

        $query = User::where('type', 'logistic');

        // Filter by registration date range
        if ($startDate) {
            $query->whereDate('registration_date', '>=', $startDate);
        }
        if ($endDate) {
            $query->whereDate('registration_date', '<=', $endDate);
        }

        $logistics = $query->orderBy('created_at', 'desc')->get();

        // Calculate summary statistics
        $summary = [
            'total_logistics' => $logistics->count(),
            'active_logistics' => $logistics->where('email_verified_at', '!=', null)->count(),
            'pending_verification' => $logistics->where('email_verified_at', null)->count(),
            'recent_registrations' => $logistics->where('created_at', '>=', now()->subDays(30))->count(),
        ];

        // If export is requested
        if ($format === 'csv') {
            return $this->exportToCsv($logistics, $display);
        } elseif ($format === 'pdf') {
            return $this->exportToPdf($logistics, $display);
        }

        // Return view for display
        return Inertia::render('Admin/Logistics/report', [
            'logistics' => $logistics,
            'summary' => $summary,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    private function exportToCsv($logistics, $display = false)
    {
        $filename = 'logistics_report_' . date('Y-m-d_H-i-s') . '.csv';
        
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

        $callback = function() use ($logistics) {
            $file = fopen('php://output', 'w');
            
            // Write headers
            fputcsv($file, [
                'ID',
                'Name',
                'Email',
                'Contact Number',
                'Address',
                'Registration Date',
                'Email Verified',
                'Created Date'
            ]);

            // Write logistics data
            foreach ($logistics as $logistic) {
                fputcsv($file, [
                    $logistic->id,
                    $logistic->name,
                    $logistic->email,
                    $logistic->contact_number ?? 'N/A',
                    $logistic->address ?? 'N/A',
                    $logistic->registration_date ? $logistic->registration_date->format('Y-m-d') : 'N/A',
                    $logistic->email_verified_at ? 'Yes' : 'No',
                    $logistic->created_at->format('Y-m-d H:i:s')
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function exportToPdf($logistics, $display = false)
    {
        $html = view('reports.logistics-pdf', [
            'logistics' => $logistics,
            'generated_at' => now()->format('Y-m-d H:i:s')
        ])->render();

        $pdf = Pdf::loadHTML($html);
        $pdf->setPaper('A4', 'landscape');
        
        $filename = 'logistics_report_' . date('Y-m-d_H-i-s') . '.pdf';
        
        return $display ? $pdf->stream($filename) : $pdf->download($filename);
    }
}
