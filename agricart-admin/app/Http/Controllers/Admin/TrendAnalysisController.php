<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductPriceHistory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TrendAnalysisController extends Controller
{
    public function index(Request $request)
    {
        $products = Product::active()->orderBy('name')->get(['id', 'name']);
        return Inertia::render('Admin/Trends/index', [
            'products' => $products,
            'defaultDays' => 30,
        ]);
    }

    public function data(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'nullable|exists:products,id',
            'days' => 'nullable|integer|min:1|max:90',
        ]);

        $days = $validated['days'] ?? 30;
        $fromDate = now()->subDays($days);

        $query = ProductPriceHistory::query()
            ->with('product:id,name')
            ->where('created_at', '>=', $fromDate)
            ->orderBy('created_at');

        if (!empty($validated['product_id'])) {
            $query->where('product_id', $validated['product_id']);
        }

        $histories = $query->get(['id','product_id','price_kilo','price_pc','price_tali','created_at']);

        // Group by product and map to simplified series
        $grouped = $histories->groupBy('product_id')->map(function ($items) {
            /** @var \Illuminate\Support\Collection $items */
            $productName = optional($items->first()->product)->name;
            return [
                'product' => $productName,
                'series' => $items->map(function ($h) {
                    return [
                        'timestamp' => $h->created_at->toIso8601String(),
                        'price_kilo' => $h->price_kilo !== null ? (float)$h->price_kilo : null,
                        'price_pc' => $h->price_pc !== null ? (float)$h->price_pc : null,
                        'price_tali' => $h->price_tali !== null ? (float)$h->price_tali : null,
                    ];
                })->values(),
            ];
        })->values();

        return response()->json([
            'range' => [
                'from' => $fromDate->toIso8601String(),
                'to' => now()->toIso8601String(),
                'days' => $days,
            ],
            'data' => $grouped,
        ]);
    }
}


