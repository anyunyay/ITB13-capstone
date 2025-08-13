<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Sales;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class SalesController extends Controller
{
    public function index(Request $request)
    {
        $query = Sales::with(['customer', 'admin', 'logistic'])
            ->where('status', 'approved');

        // Filter by date range if provided
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('created_at', [
                $request->start_date . ' 00:00:00',
                $request->end_date . ' 23:59:59'
            ]);
        }

        $sales = $query->orderBy('created_at', 'desc')->get();

        // Calculate summary statistics
        $summary = [
            'total_revenue' => $sales->sum('total_amount'),
            'total_orders' => $sales->count(),
            'average_order_value' => $sales->count() > 0 ? $sales->avg('total_amount') : 0,
            'total_customers' => $sales->unique('customer_id')->count(),
        ];

        // Get member sales data
        $memberSales = $this->getMemberSales($request);

        return Inertia::render('Admin/Sales/index', [
            'sales' => $sales,
            'summary' => $summary,
            'memberSales' => $memberSales,
            'filters' => $request->only(['start_date', 'end_date']),
        ]);
    }

    public function memberSales(Request $request)
    {
        $memberSales = $this->getMemberSales($request);

        return Inertia::render('Admin/Sales/memberSales', [
            'memberSales' => $memberSales,
            'filters' => $request->only(['start_date', 'end_date', 'member_id']),
        ]);
    }

    public function generateReport(Request $request)
    {
        $query = Sales::with(['customer', 'admin', 'logistic'])
            ->where('status', 'approved');

        // Filter by date range if provided
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('created_at', [
                $request->start_date . ' 00:00:00',
                $request->end_date . ' 23:59:59'
            ]);
        }

        $sales = $query->orderBy('created_at', 'desc')->get();

        // Calculate summary statistics
        $summary = [
            'total_revenue' => $sales->sum('total_amount'),
            'total_orders' => $sales->count(),
            'average_order_value' => $sales->count() > 0 ? $sales->avg('total_amount') : 0,
            'total_customers' => $sales->unique('customer_id')->count(),
        ];

        // Get member sales data
        $memberSales = $this->getMemberSales($request);

        // Check if format is specified for export
        if ($request->filled('format')) {
            if ($request->format === 'pdf') {
                return view('reports.sales-pdf', [
                    'sales' => $sales,
                    'summary' => $summary,
                    'memberSales' => $memberSales,
                    'generated_at' => now()->format('M d, Y H:i:s'),
                    'filters' => $request->only(['start_date', 'end_date']),
                ]);
            } elseif ($request->format === 'csv') {
                return $this->exportCsv($sales, $memberSales, $summary, $request);
            }
        }

        // Return Inertia page for report view
        return Inertia::render('Admin/Sales/report', [
            'sales' => $sales,
            'summary' => $summary,
            'memberSales' => $memberSales,
            'filters' => $request->only(['start_date', 'end_date']),
        ]);
    }

    private function exportCsv($sales, $memberSales, $summary, $request)
    {
        $filename = 'sales_report_' . now()->format('Y-m-d_H-i-s') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($sales, $memberSales, $summary, $request) {
            $file = fopen('php://output', 'w');
            
            // Summary section
            fputcsv($file, ['SALES REPORT SUMMARY']);
            fputcsv($file, ['']);
            fputcsv($file, ['Total Revenue', 'Total Orders', 'Average Order Value', 'Total Customers']);
            fputcsv($file, [
                number_format($summary['total_revenue'], 2),
                $summary['total_orders'],
                number_format($summary['average_order_value'], 2),
                $summary['total_customers']
            ]);
            fputcsv($file, ['']);
            
            // Date range if specified
            if ($request->filled('start_date') && $request->filled('end_date')) {
                fputcsv($file, ['Period', $request->start_date . ' to ' . $request->end_date]);
                fputcsv($file, ['']);
            }
            
            // Sales data
            fputcsv($file, ['SALES DATA']);
            fputcsv($file, ['Sale ID', 'Customer Name', 'Customer Email', 'Total Amount', 'Created Date', 'Processed By', 'Logistic']);
            
            foreach ($sales as $sale) {
                fputcsv($file, [
                    $sale->id,
                    $sale->customer->name,
                    $sale->customer->email,
                    number_format($sale->total_amount, 2),
                    $sale->created_at->format('Y-m-d H:i:s'),
                    $sale->admin->name ?? 'N/A',
                    $sale->logistic->name ?? 'N/A'
                ]);
            }
            
            fputcsv($file, ['']);
            
            // Member sales data
            if ($memberSales->count() > 0) {
                fputcsv($file, ['MEMBER SALES PERFORMANCE']);
                fputcsv($file, ['Rank', 'Member Name', 'Member Email', 'Total Orders', 'Total Revenue', 'Quantity Sold', 'Average Revenue']);
                
                foreach ($memberSales as $index => $member) {
                    $averageRevenue = $member->total_orders > 0 ? $member->total_revenue / $member->total_orders : 0;
                    fputcsv($file, [
                        $index + 1,
                        $member->member_name,
                        $member->member_email,
                        $member->total_orders,
                        number_format($member->total_revenue, 2),
                        $member->total_quantity_sold,
                        number_format($averageRevenue, 2)
                    ]);
                }
            }
            
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function getMemberSales(Request $request)
    {
        $query = DB::table('sales')
            ->join('audit_trails', 'sales.id', '=', 'audit_trails.sale_id')
            ->join('stocks', 'audit_trails.stock_id', '=', 'stocks.id')
            ->join('users as members', 'stocks.member_id', '=', 'members.id')
            ->where('sales.status', 'approved')
            ->where('members.type', 'member')
            ->select(
                'members.id as member_id',
                'members.name as member_name',
                'members.email as member_email',
                DB::raw('COUNT(DISTINCT sales.id) as total_orders'),
                DB::raw('SUM(sales.total_amount) as total_revenue'),
                DB::raw('SUM(audit_trails.quantity) as total_quantity_sold')
            )
            ->groupBy('members.id', 'members.name', 'members.email');

        // Filter by date range if provided
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('sales.created_at', [
                $request->start_date . ' 00:00:00',
                $request->end_date . ' 23:59:59'
            ]);
        }

        // Filter by specific member if provided
        if ($request->filled('member_id')) {
            $query->where('members.id', $request->member_id);
        }

        return $query->orderBy('total_revenue', 'desc')->get();
    }
}
