<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Sales;
use App\Models\SalesAudit;
use App\Models\AuditTrail;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class SalesController extends Controller
{
    public function index(Request $request)
    {
        $query = Sales::with(['customer', 'admin', 'logistic', 'salesAudit'])
            ->whereNotNull('delivered_at'); // Only show delivered orders

        // Filter by date range if provided
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('delivered_at', [
                $request->start_date . ' 00:00:00',
                $request->end_date . ' 23:59:59'
            ]);
        }

        // Optimize: Load only essential fields for pagination
        $salesRaw = $query->select('id', 'customer_id', 'admin_id', 'logistic_id', 'total_amount', 'subtotal', 'coop_share', 'member_share', 'delivered_at')
            ->orderBy('delivered_at', 'desc')
            ->get();

        // Calculate summary statistics from delivered orders only
        $totalMemberShare = $salesRaw->sum('member_share');
        $totalCogs = ($totalMemberShare / 1.3) * 0.7;
        $totalGrossProfit = $totalMemberShare - $totalCogs;

        $summary = [
            'total_revenue' => $salesRaw->sum('total_amount'),
            'total_subtotal' => $salesRaw->sum('subtotal'),
            'total_coop_share' => $salesRaw->sum('coop_share'),
            'total_member_share' => $totalMemberShare,
            'total_cogs' => $totalCogs,
            'total_gross_profit' => $totalGrossProfit,
            'total_orders' => $salesRaw->count(),
            'average_order_value' => $salesRaw->count() > 0 ?
                $salesRaw->sum('total_amount') / $salesRaw->count() : 0,
            'average_coop_share' => $salesRaw->count() > 0 ?
                $salesRaw->sum('coop_share') / $salesRaw->count() : 0,
            'total_customers' => $salesRaw->unique('customer_id')->count(),
        ];

        // Map sales with customer confirmation data
        $sales = $salesRaw->map(function ($sale) {
            $cogs = ($sale->member_share / 1.3) * 0.7;
            $grossProfit = $sale->member_share - $cogs;

            return [
                'id' => $sale->id,
                'customer' => [
                    'id' => $sale->customer->id,
                    'name' => $sale->customer->name,
                    'email' => $sale->customer->email,
                    'contact_number' => $sale->customer->contact_number,
                ],
                'total_amount' => $sale->total_amount,
                'subtotal' => $sale->subtotal,
                'coop_share' => $sale->coop_share,
                'member_share' => $sale->member_share,
                'cogs' => $cogs,
                'gross_profit' => $grossProfit,
                'delivery_address' => $sale->delivery_address,
                'admin' => $sale->admin ? [
                    'id' => $sale->admin->id,
                    'name' => $sale->admin->name,
                ] : null,
                'logistic' => $sale->logistic ? [
                    'id' => $sale->logistic->id,
                    'name' => $sale->logistic->name,
                    'contact_number' => $sale->logistic->contact_number,
                ] : null,
                'delivered_at' => $sale->delivered_at?->toISOString(),
                'customer_received' => $sale->customer_received,
                'customer_rate' => $sale->customer_rate,
                'customer_feedback' => $sale->customer_feedback,
                'customer_confirmed_at' => $sale->customer_confirmed_at?->toISOString(),
                'sales_audit_id' => $sale->sales_audit_id,
            ];
        });

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
        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');
        $search = $request->get('search');
        $minAmount = $request->get('min_amount');
        $maxAmount = $request->get('max_amount');
        $sortBy = $request->get('sort_by', 'id');
        $sortOrder = $request->get('sort_order', 'desc');
        $format = $request->get('format', 'view'); // view, csv, pdf
        $display = $request->get('display', false); // true for display mode

        $query = Sales::with(['customer', 'admin', 'logistic', 'salesAudit'])
            ->whereNotNull('delivered_at'); // Only show delivered orders

        // Filter by date range with timezone (Asia/Manila)
        if ($startDate) {
            $startDateTime = \Carbon\Carbon::parse($startDate, 'Asia/Manila')->startOfDay();
            $query->where('delivered_at', '>=', $startDateTime);
        }
        if ($endDate) {
            $endDateTime = \Carbon\Carbon::parse($endDate, 'Asia/Manila')->endOfDay();
            $query->where('delivered_at', '<=', $endDateTime);
        }

        // Filter by amount range
        if ($minAmount !== null && $minAmount !== '') {
            $query->where('total_amount', '>=', $minAmount);
        }
        if ($maxAmount !== null && $maxAmount !== '') {
            $query->where('total_amount', '<=', $maxAmount);
        }

        // Search functionality
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('customer', function ($customerQuery) use ($search) {
                    $customerQuery->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                })->orWhere('id', 'like', "%{$search}%");
            });
        }

        // Optimize: Load only essential fields for reporting
        $salesRaw = $query->select('id', 'customer_id', 'admin_id', 'logistic_id', 'total_amount', 'subtotal', 'coop_share', 'member_share', 'delivered_at')
            ->get();

        // Calculate summary statistics from filtered results only
        $totalMemberShare = $salesRaw->sum('member_share');
        $totalCogs = ($totalMemberShare / 1.3) * 0.7;
        $totalGrossProfit = $totalMemberShare - $totalCogs;

        $summary = [
            'total_revenue' => $salesRaw->sum('total_amount'),
            'total_subtotal' => $salesRaw->sum('subtotal'),
            'total_coop_share' => $salesRaw->sum('coop_share'),
            'total_member_share' => $totalMemberShare,
            'total_cogs' => $totalCogs,
            'total_gross_profit' => $totalGrossProfit,
            'total_orders' => $salesRaw->count(),
            'average_order_value' => $salesRaw->count() > 0 ?
                $salesRaw->sum('total_amount') / $salesRaw->count() : 0,
            'average_coop_share' => $salesRaw->count() > 0 ?
                $salesRaw->sum('coop_share') / $salesRaw->count() : 0,
            'total_customers' => $salesRaw->unique('customer_id')->count(),
        ];

        // Map sales with COGS and gross profit calculations
        $sales = $salesRaw->map(function ($sale) {
            $cogs = ($sale->member_share / 1.3) * 0.7;
            $grossProfit = $sale->member_share - $cogs;

            return [
                'id' => $sale->id,
                'customer' => [
                    'name' => $sale->customer->name ?? 'N/A',
                    'email' => $sale->customer->email ?? 'N/A',
                ],
                'total_amount' => $sale->total_amount,
                'subtotal' => $sale->subtotal,
                'coop_share' => $sale->coop_share,
                'member_share' => $sale->member_share,
                'cogs' => $cogs,
                'gross_profit' => $grossProfit,
                'delivered_at' => $sale->delivered_at,
                'admin' => $sale->admin ? [
                    'name' => $sale->admin->name,
                ] : null,
                'logistic' => $sale->logistic ? [
                    'name' => $sale->logistic->name,
                ] : null,
            ];
        });

        // Apply sorting
        $sales = $sales->sortBy(function ($sale) use ($sortBy) {
            switch ($sortBy) {
                case 'customer':
                    return $sale['customer']['name'];
                case 'delivered_at':
                    return $sale['delivered_at'] ? $sale['delivered_at']->timestamp : 0;
                default:
                    return $sale[$sortBy] ?? 0;
            }
        }, SORT_REGULAR, $sortOrder === 'desc')->values();

        // If export is requested - same pattern as Orders Report
        if ($format === 'csv') {
            return $this->exportToCsv($sales, $summary, $display);
        } elseif ($format === 'pdf') {
            return $this->exportToPdf($sales, $summary, $display);
        }

        // Return Inertia page for report view
        return Inertia::render('Admin/Sales/report', [
            'sales' => $sales,
            'summary' => $summary,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'min_amount' => $minAmount,
                'max_amount' => $maxAmount,
                'search' => $search,
            ],
        ]);
    }

    private function exportToCsv($salesRaw, $summary, $display = false)
    {
        $filename = 'sales_report_' . now()->format('Y-m-d_H-i-s') . '.csv';

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

        $callback = function () use ($salesRaw, $summary) {
            $file = fopen('php://output', 'w');

            // Add summary header
            fputcsv($file, ['Sales Report Summary - Delivered Orders Only']);
            fputcsv($file, ['Total Orders', $summary['total_orders']]);
            fputcsv($file, ['Total Revenue', number_format($summary['total_revenue'], 2)]);
            fputcsv($file, ['Total Coop Share', number_format($summary['total_coop_share'], 2)]);
            fputcsv($file, ['Total Member Share', number_format($summary['total_member_share'], 2)]);
            fputcsv($file, ['Total COGS', number_format($summary['total_cogs'], 2)]);
            fputcsv($file, ['Total Gross Profit', number_format($summary['total_gross_profit'], 2)]);
            fputcsv($file, ['Average Order Value', number_format($summary['average_order_value'], 2)]);
            fputcsv($file, []); // Empty row

            // Sales data
            fputcsv($file, ['Sale ID', 'Customer', 'Email', 'Total Amount', 'Coop Share', 'Member Share', 'COGS', 'Gross Profit', 'Delivered Date']);

            foreach ($salesRaw as $sale) {
                fputcsv($file, [
                    $sale['id'],
                    $sale['customer']['name'] ?? 'N/A',
                    $sale['customer']['email'] ?? 'N/A',
                    number_format($sale['total_amount'], 2),
                    number_format($sale['coop_share'], 2),
                    number_format($sale['member_share'], 2),
                    number_format($sale['cogs'], 2),
                    number_format($sale['gross_profit'], 2),
                    $sale['delivered_at'] ? $sale['delivered_at']->format('Y-m-d H:i:s') : 'N/A'
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function exportToPdf($salesRaw, $summary, $display = false)
    {
        $html = view('reports.sales-pdf', [
            'sales' => $salesRaw,
            'summary' => $summary,
            'generated_at' => now()->format('Y-m-d H:i:s')
        ])->render();

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadHTML($html);
        $pdf->setPaper('A4', 'landscape');

        $filename = 'sales_report_' . date('Y-m-d_H-i-s') . '.pdf';

        return $display ? $pdf->stream($filename) : $pdf->download($filename);
    }

    private function getMemberSales(Request $request)
    {
        // Base query to get member sales data from delivered sales and audit trails
        $query = DB::table('sales')
            ->join('sales_audit', 'sales.sales_audit_id', '=', 'sales_audit.id')
            ->join('audit_trails', 'sales_audit.id', '=', 'audit_trails.sale_id')
            ->join('stocks', 'audit_trails.stock_id', '=', 'stocks.id')
            ->join('users as members', 'stocks.member_id', '=', 'members.id')
            ->join('products', 'audit_trails.product_id', '=', 'products.id')
            ->where('members.type', 'member')
            ->whereNotNull('sales.delivered_at') // Only include delivered orders
            ->select(
                'members.id as member_id',
                'members.name as member_name',
                'members.email as member_email',
                DB::raw('COUNT(DISTINCT sales.id) as total_orders'),
                DB::raw('SUM(
                    CASE 
                        WHEN audit_trails.category = "Kilo" AND audit_trails.price_kilo IS NOT NULL 
                        THEN audit_trails.quantity * audit_trails.price_kilo
                        WHEN audit_trails.category = "Pc" AND audit_trails.price_pc IS NOT NULL 
                        THEN audit_trails.quantity * audit_trails.price_pc
                        WHEN audit_trails.category = "Tali" AND audit_trails.price_tali IS NOT NULL 
                        THEN audit_trails.quantity * audit_trails.price_tali
                        WHEN audit_trails.category = "order" AND audit_trails.price_kilo IS NOT NULL 
                        THEN audit_trails.quantity * audit_trails.price_kilo
                        ELSE 0
                    END
                ) as total_revenue'),
                DB::raw('SUM(
                    CASE 
                        WHEN audit_trails.category = "Kilo" AND audit_trails.price_kilo IS NOT NULL 
                        THEN audit_trails.quantity * audit_trails.price_kilo * 0.10
                        WHEN audit_trails.category = "Pc" AND audit_trails.price_pc IS NOT NULL 
                        THEN audit_trails.quantity * audit_trails.price_pc * 0.10
                        WHEN audit_trails.category = "Tali" AND audit_trails.price_tali IS NOT NULL 
                        THEN audit_trails.quantity * audit_trails.price_tali * 0.10
                        WHEN audit_trails.category = "order" AND audit_trails.price_kilo IS NOT NULL 
                        THEN audit_trails.quantity * audit_trails.price_kilo * 0.10
                        ELSE 0
                    END
                ) as total_coop_share'),
                DB::raw('SUM(
                    CASE 
                        WHEN audit_trails.category = "Kilo" AND audit_trails.price_kilo IS NOT NULL 
                        THEN audit_trails.quantity * audit_trails.price_kilo
                        WHEN audit_trails.category = "Pc" AND audit_trails.price_pc IS NOT NULL 
                        THEN audit_trails.quantity * audit_trails.price_pc
                        WHEN audit_trails.category = "Tali" AND audit_trails.price_tali IS NOT NULL 
                        THEN audit_trails.quantity * audit_trails.price_tali
                        WHEN audit_trails.category = "order" AND audit_trails.price_kilo IS NOT NULL 
                        THEN audit_trails.quantity * audit_trails.price_kilo
                        ELSE 0
                    END
                ) as total_member_share'),
                DB::raw('SUM(
                    CASE 
                        WHEN audit_trails.category = "Kilo" AND audit_trails.price_kilo IS NOT NULL 
                        THEN (audit_trails.quantity * audit_trails.price_kilo / 1.3) * 0.7
                        WHEN audit_trails.category = "Pc" AND audit_trails.price_pc IS NOT NULL 
                        THEN (audit_trails.quantity * audit_trails.price_pc / 1.3) * 0.7
                        WHEN audit_trails.category = "Tali" AND audit_trails.price_tali IS NOT NULL 
                        THEN (audit_trails.quantity * audit_trails.price_tali / 1.3) * 0.7
                        WHEN audit_trails.category = "order" AND audit_trails.price_kilo IS NOT NULL 
                        THEN (audit_trails.quantity * audit_trails.price_kilo / 1.3) * 0.7
                        ELSE 0
                    END
                ) as total_cogs'),
                DB::raw('SUM(
                    CASE 
                        WHEN audit_trails.category = "Kilo" AND audit_trails.price_kilo IS NOT NULL 
                        THEN audit_trails.quantity * audit_trails.price_kilo - ((audit_trails.quantity * audit_trails.price_kilo / 1.3) * 0.7)
                        WHEN audit_trails.category = "Pc" AND audit_trails.price_pc IS NOT NULL 
                        THEN audit_trails.quantity * audit_trails.price_pc - ((audit_trails.quantity * audit_trails.price_pc / 1.3) * 0.7)
                        WHEN audit_trails.category = "Tali" AND audit_trails.price_tali IS NOT NULL 
                        THEN audit_trails.quantity * audit_trails.price_tali - ((audit_trails.quantity * audit_trails.price_tali / 1.3) * 0.7)
                        WHEN audit_trails.category = "order" AND audit_trails.price_kilo IS NOT NULL 
                        THEN audit_trails.quantity * audit_trails.price_kilo - ((audit_trails.quantity * audit_trails.price_kilo / 1.3) * 0.7)
                        ELSE 0
                    END
                ) as total_gross_profit'),
                DB::raw('SUM(audit_trails.quantity) as total_quantity_sold')
            )
            ->groupBy('members.id', 'members.name', 'members.email');

        // Filter by date range if provided
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('sales.delivered_at', [
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

    /**
     * Display audit trail entries for stock changes
     */
    public function auditTrail(Request $request)
    {
        $query = AuditTrail::with(['member', 'product', 'stock', 'order', 'sale']);

        // Filter by date range if provided
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('created_at', [
                $request->start_date . ' 00:00:00',
                $request->end_date . ' 23:59:59'
            ]);
        }

        // Filter by member if provided
        if ($request->filled('member_id')) {
            $query->where('member_id', $request->member_id);
        }

        // Filter by order if provided
        if ($request->filled('order_id')) {
            $query->where('order_id', $request->order_id);
        }

        $auditTrails = $query->orderBy('created_at', 'desc')->get();

        // Get members for filter dropdown
        $members = User::where('type', 'member')
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        // Calculate summary statistics
        $summary = [
            'total_entries' => $auditTrails->count(),
            'total_quantity_sold' => $auditTrails->sum('quantity'),
            'unique_members' => $auditTrails->pluck('member_id')->unique()->count(),
            'unique_orders' => $auditTrails->pluck('order_id')->unique()->count(),
            'total_revenue' => $auditTrails->sum(function ($trail) {
                return $trail->quantity * $trail->getSalePrice();
            }),
        ];

        return Inertia::render('Admin/Sales/auditTrail', [
            'auditTrails' => $auditTrails,
            'members' => $members,
            'summary' => $summary,
            'filters' => $request->only(['start_date', 'end_date', 'member_id', 'order_id']),
        ]);
    }

    /**
     * Export audit trail data to CSV
     */
    public function exportAuditTrail(Request $request)
    {
        $query = AuditTrail::with(['member', 'product', 'stock', 'order', 'sale']);

        // Apply same filters as auditTrail method
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('created_at', [
                $request->start_date . ' 00:00:00',
                $request->end_date . ' 23:59:59'
            ]);
        }

        if ($request->filled('member_id')) {
            $query->where('member_id', $request->member_id);
        }

        if ($request->filled('order_id')) {
            $query->where('order_id', $request->order_id);
        }

        $auditTrails = $query->orderBy('created_at', 'desc')->get();

        $filename = 'audit_trail_' . date('Y-m-d_H-i-s') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function () use ($auditTrails) {
            $file = fopen('php://output', 'w');

            // CSV headers
            fputcsv($file, [
                'Timestamp',
                'Order ID',
                'Member ID',
                'Member Name',
                'Stock ID',
                'Product Name',
                'Category',
                'Quantity Sold',
                'Available Stock After Sale',
                'Unit Price',
                'Total Amount',
                'Order Status'
            ]);

            foreach ($auditTrails as $trail) {
                fputcsv($file, [
                    $trail->created_at->format('Y-m-d H:i:s'),
                    $trail->order_id,
                    $trail->member_id,
                    $trail->member ? $trail->member->name : 'N/A',
                    $trail->stock_id,
                    $trail->product_name,
                    $trail->category,
                    $trail->quantity,
                    $trail->available_stock_after_sale,
                    $trail->getSalePrice(),
                    $trail->getTotalAmount(),
                    $trail->order ? $trail->order->status : 'N/A'
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
