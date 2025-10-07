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
        $query = Sales::with(['customer.defaultAddress', 'admin', 'logistic'])
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
        $query = Sales::with(['customer.defaultAddress', 'admin', 'logistic'])
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
            $display = $request->get('display', false);
            $exportType = $request->get('export_type', 'sales'); // 'sales' or 'members'
            
            if ($request->format === 'pdf') {
                return $this->exportToPdf($sales, $memberSales, $request, $display, $exportType);
            } elseif ($request->format === 'csv') {
                return $this->exportCsv($sales, $memberSales, $request, $display, $exportType);
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

    private function exportCsv($sales, $memberSales, $request, $display = false, $exportType = 'sales')
    {
        $filename = $exportType === 'members' ? 'member_sales_report_' : 'sales_report_';
        $filename .= now()->format('Y-m-d_H-i-s') . '.csv';
        
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

        $callback = function() use ($sales, $memberSales, $request, $exportType) {
            $file = fopen('php://output', 'w');
            
            if ($exportType === 'sales') {
                // Sales data only
                fputcsv($file, ['Sale ID', 'Total Amount', 'Created Date', 'Processed By', 'Logistic']);
                
                foreach ($sales as $sale) {
                    fputcsv($file, [
                        $sale->id,
                        number_format($sale->total_amount, 2),
                        $sale->created_at->format('Y-m-d H:i:s'),
                        $sale->admin->name ?? 'N/A',
                        $sale->logistic->name ?? 'N/A'
                    ]);
                }
            } else {
                // Member sales data only
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

    private function exportToPdf($sales, $memberSales, $request, $display = false, $exportType = 'sales')
    {
        $filename = $exportType === 'members' ? 'member_sales_report_' : 'sales_report_';
        $filename .= date('Y-m-d_H-i-s') . '.pdf';
        
        $html = view('reports.sales-pdf', [
            'sales' => $sales,
            'memberSales' => $memberSales,
            'exportType' => $exportType,
            'generated_at' => now()->format('Y-m-d H:i:s'),
            'filters' => $request->only(['start_date', 'end_date']),
        ])->render();

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadHTML($html);
        $pdf->setPaper('A4', 'landscape');
        
        return $display ? $pdf->stream($filename) : $pdf->download($filename);
    }

    private function getMemberSales(Request $request)
    {
        // Base query to get member sales data from sales and audit trails
        $query = DB::table('sales')
            ->join('audit_trails', 'sales.id', '=', 'audit_trails.sale_id')
            ->join('stocks', 'audit_trails.stock_id', '=', 'stocks.id')
            ->join('users as members', 'stocks.member_id', '=', 'members.id')
            ->join('products', 'audit_trails.product_id', '=', 'products.id')
            ->where('sales.status', 'approved')
            ->where('members.type', 'member')
            ->select(
                'members.id as member_id',
                'members.name as member_name',
                'members.email as member_email',
                DB::raw('COUNT(DISTINCT sales.id) as total_orders'),
                DB::raw('SUM(
                    CASE 
                        WHEN audit_trails.category = "Kilo" AND products.price_kilo IS NOT NULL 
                        THEN audit_trails.quantity * products.price_kilo
                        WHEN audit_trails.category = "Pc" AND products.price_pc IS NOT NULL 
                        THEN audit_trails.quantity * products.price_pc
                        WHEN audit_trails.category = "Tali" AND products.price_tali IS NOT NULL 
                        THEN audit_trails.quantity * products.price_tali
                        ELSE 0
                    END
                ) as total_revenue'),
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
