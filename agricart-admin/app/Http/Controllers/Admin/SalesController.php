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

        return view('reports.sales-pdf', [
            'sales' => $sales,
            'summary' => $summary,
            'memberSales' => $memberSales,
            'generated_at' => now()->format('M d, Y H:i:s'),
            'filters' => $request->only(['start_date', 'end_date']),
        ]);
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
