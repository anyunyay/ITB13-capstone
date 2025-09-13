<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Sales;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class OperationalExpenseController extends Controller
{
    public function index(Request $request)
    {
        $query = Sales::with(['customer', 'admin'])
            ->where('status', 'approved')
            ->where('operational_expense', '>', 0);

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
            'total_operational_expenses' => $sales->sum('operational_expense'),
            'total_orders' => $sales->count(),
            'average_operational_expense' => $sales->count() > 0 ? $sales->avg('operational_expense') : 0,
            'total_revenue' => $sales->sum('total_amount'),
        ];

        // Get monthly operational expenses for chart
        $monthlyExpenses = Sales::where('status', 'approved')
            ->where('operational_expense', '>', 0)
            ->select(
                DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
                DB::raw('SUM(operational_expense) as total_expense'),
                DB::raw('COUNT(*) as order_count')
            )
            ->groupBy('month')
            ->orderBy('month', 'desc')
            ->limit(12)
            ->get();

        return Inertia::render('Admin/OperationalExpenses/index', [
            'sales' => $sales,
            'summary' => $summary,
            'monthlyExpenses' => $monthlyExpenses,
            'filters' => $request->only(['start_date', 'end_date']),
        ]);
    }

    public function generateReport(Request $request)
    {
        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');
        $format = $request->get('format', 'view'); // view, csv, pdf

        $query = Sales::with(['customer', 'admin'])
            ->where('status', 'approved')
            ->where('operational_expense', '>', 0);

        // Filter by date range
        if ($startDate) {
            $query->whereDate('created_at', '>=', $startDate);
        }
        if ($endDate) {
            $query->whereDate('created_at', '<=', $endDate);
        }

        $sales = $query->orderBy('created_at', 'desc')->get();

        // Calculate summary statistics
        $summary = [
            'total_operational_expenses' => $sales->sum('operational_expense'),
            'total_orders' => $sales->count(),
            'average_operational_expense' => $sales->count() > 0 ? $sales->avg('operational_expense') : 0,
            'total_revenue' => $sales->sum('total_amount'),
            'expense_percentage' => $sales->sum('total_amount') > 0 ? 
                ($sales->sum('operational_expense') / $sales->sum('total_amount')) * 100 : 0,
        ];

        // If export is requested
        if ($format === 'csv') {
            return $this->exportToCsv($sales, $summary);
        } elseif ($format === 'pdf') {
            return $this->exportToPdf($sales, $summary);
        }

        // Return view for display
        return Inertia::render('Admin/OperationalExpenses/report', [
            'sales' => $sales,
            'summary' => $summary,
            'filters' => $request->only(['start_date', 'end_date']),
        ]);
    }

    private function exportToCsv($sales, $summary)
    {
        $filename = 'operational_expenses_' . date('Y-m-d_H-i-s') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($sales, $summary) {
            $file = fopen('php://output', 'w');
            
            // Add summary row
            fputcsv($file, ['OPERATIONAL EXPENSES REPORT']);
            fputcsv($file, ['Total Operational Expenses', 'Php ' . number_format($summary['total_operational_expenses'], 2)]);
            fputcsv($file, ['Total Orders', $summary['total_orders']]);
            fputcsv($file, ['Average Expense per Order', 'Php ' . number_format($summary['average_operational_expense'], 2)]);
            fputcsv($file, ['Total Revenue', 'Php ' . number_format($summary['total_revenue'], 2)]);
            fputcsv($file, ['Expense Percentage', number_format($summary['expense_percentage'], 2) . '%']);
            fputcsv($file, []); // Empty row
            
            // Add headers
            fputcsv($file, ['Order ID', 'Customer', 'Date', 'Total Amount', 'Operational Expense', 'Percentage']);
            
            // Add data rows
            foreach ($sales as $sale) {
                $percentage = $sale->total_amount > 0 ? ($sale->operational_expense / $sale->total_amount) * 100 : 0;
                fputcsv($file, [
                    $sale->id,
                    $sale->customer->name,
                    $sale->created_at->format('Y-m-d H:i:s'),
                    'Php ' . number_format($sale->total_amount, 2),
                    'Php ' . number_format($sale->operational_expense, 2),
                    number_format($percentage, 2) . '%'
                ]);
            }
            
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function exportToPdf($sales, $summary)
    {
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('admin.operational-expenses.pdf', [
            'sales' => $sales,
            'summary' => $summary,
        ]);

        return $pdf->download('operational_expenses_' . date('Y-m-d_H-i-s') . '.pdf');
    }
}