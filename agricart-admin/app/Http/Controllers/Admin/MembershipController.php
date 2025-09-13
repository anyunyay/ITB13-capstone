<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\MembershipUpdateNotification;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Response;
use Barryvdh\DomPDF\Facade\Pdf;

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
            'contact_number' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'registration_date' => 'nullable|date',
            'document' => 'required|file|mimes:pdf,doc,docx,jpeg,png,jpg,svg|max:2048',
        ]);

        if ($request->file('document')) {
            $image = $request->file('document');
            $imageName = time() . '.' . $image->getClientOriginalExtension();
            $image->move(public_path('images/documents/'), $imageName);
            
            $member = User::create([
                'name' => $request->input('name'),
                'email' => $request->input('email'),
                'contact_number' => $request->input('contact_number'),
                'address' => $request->input('address'),
                'registration_date' => $request->input('registration_date', now()),
                'document' => 'images/documents/' . $imageName,
                'type' => 'member',
                'password' => bcrypt('password'), // Default password
                'email_verified_at' => now(), // Automatically verify email
            ]);

            // Notify admin and staff about membership update
            $adminUsers = \App\Models\User::whereIn('type', ['admin', 'staff'])->get();
            foreach ($adminUsers as $admin) {
                $admin->notify(new MembershipUpdateNotification($member, 'added'));
            }
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
            'contact_number' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'registration_date' => 'nullable|date',
            'document' => 'nullable|file|mimes:pdf,doc,docx,jpeg,png,jpg,svg|max:2048',
        ]);

        $member = User::where('type', 'member')->findOrFail($id);
        $member->update([
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'contact_number' => $request->input('contact_number'),
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

        // Notify admin and staff about membership update
        $adminUsers = \App\Models\User::whereIn('type', ['admin', 'staff'])->get();
        foreach ($adminUsers as $admin) {
            $admin->notify(new MembershipUpdateNotification($member, 'updated'));
        }

        return redirect()->route('membership.index')->with('message', 'Member Details updated successfully');
    }

    public function destroy($id)
    {
        // Delete the image file if it exists
        $member = User::where('type', 'member')->findOrFail($id);
        if ($member->document && file_exists(public_path($member->document))) {
            unlink(public_path($member->document));
        }

        // Notify admin and staff about membership update
        $adminUsers = \App\Models\User::whereIn('type', ['admin', 'staff'])->get();
        foreach ($adminUsers as $admin) {
            $admin->notify(new MembershipUpdateNotification($member, 'removed'));
        }
        
        $member->delete();
        return redirect()->route('membership.index')->with('message', 'Member removed successfully');
    }

    public function generateReport(Request $request)
    {
        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');
        $format = $request->get('format', 'view'); // view, csv, pdf

        $query = User::where('type', 'member');

        // Filter by registration date range
        if ($startDate) {
            $query->whereDate('registration_date', '>=', $startDate);
        }
        if ($endDate) {
            $query->whereDate('registration_date', '<=', $endDate);
        }

        $members = $query->orderBy('created_at', 'desc')->get();

        // Calculate summary statistics
        $summary = [
            'total_members' => $members->count(),
            'active_members' => $members->where('email_verified_at', '!=', null)->count(),
            'pending_verification' => $members->where('email_verified_at', null)->count(),
            'recent_registrations' => $members->where('created_at', '>=', now()->subDays(30))->count(),
        ];

        // If export is requested
        if ($format === 'csv') {
            return $this->exportToCsv($members, $summary);
        } elseif ($format === 'pdf') {
            return $this->exportToPdf($members, $summary);
        }

        // Return view for display
        return Inertia::render('Admin/Membership/report', [
            'members' => $members,
            'summary' => $summary,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    private function exportToCsv($members, $summary)
    {
        $filename = 'membership_report_' . date('Y-m-d_H-i-s') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($members, $summary) {
            $file = fopen('php://output', 'w');
            
            // Write summary
            fputcsv($file, ['Membership Report Summary']);
            fputcsv($file, ['']);
            fputcsv($file, ['Total Members', $summary['total_members']]);
            fputcsv($file, ['Active Members', $summary['active_members']]);
            fputcsv($file, ['Pending Verification', $summary['pending_verification']]);
            fputcsv($file, ['Recent Registrations (30 days)', $summary['recent_registrations']]);
            fputcsv($file, ['']);
            
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

            // Write members data
            foreach ($members as $member) {
                fputcsv($file, [
                    $member->id,
                    $member->name,
                    $member->email,
                    $member->contact_number ?? 'N/A',
                    $member->address ?? 'N/A',
                    $member->registration_date ? $member->registration_date->format('Y-m-d') : 'N/A',
                    $member->email_verified_at ? 'Yes' : 'No',
                    $member->created_at->format('Y-m-d H:i:s')
                ]);
            }

            fclose($file);
        };

        return Response::stream($callback, 200, $headers);
    }

    private function exportToPdf($members, $summary)
    {
        $html = view('reports.membership-pdf', [
            'members' => $members,
            'summary' => $summary,
            'generated_at' => now()->format('Y-m-d H:i:s')
        ])->render();

        $pdf = Pdf::loadHTML($html);
        
        $filename = 'membership_report_' . date('Y-m-d_H-i-s') . '.pdf';
        
        return $pdf->download($filename);
    }
}
