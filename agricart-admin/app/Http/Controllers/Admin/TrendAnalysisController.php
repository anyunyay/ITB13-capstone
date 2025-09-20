<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\PriceTrend;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class TrendAnalysisController extends Controller
{
    public function index(Request $request)
    {
        // Get unique products with their available pricing units from price_trends table
        $products = PriceTrend::select('product_name', 'unit_type')
            ->distinct()
            ->orderBy('product_name')
            ->get()
            ->groupBy('product_name')
            ->map(function ($items, $productName) {
                $unitTypes = $items->pluck('unit_type')->unique()->toArray();
                
                // Map unit types to price categories
                $priceCategories = [];
                if (in_array('kg', $unitTypes)) {
                    $priceCategories[] = 'per_kilo';
                }
                if (in_array('tali', $unitTypes)) {
                    $priceCategories[] = 'per_tali';
                }
                if (in_array('pc', $unitTypes)) {
                    $priceCategories[] = 'per_pc';
                }
                
                return [
                    'name' => $productName,
                    'price_categories' => $priceCategories,
                    'unit_types' => $unitTypes
                ];
            })
            ->values();

        // Get date range from price_trends
        $dateRange = PriceTrend::selectRaw('MIN(date) as min_date, MAX(date) as max_date')->first();

        return Inertia::render('Admin/Trends/index', [
            'products' => $products,
            'dateRange' => $dateRange,
        ]);
    }

    public function getPriceCategories(Request $request)
    {
        $validated = $request->validate([
            'product_name' => 'required|string',
        ]);

        $productName = $validated['product_name'];
        
        // Get available unit types for this product
        $unitTypes = PriceTrend::where('product_name', $productName)
            ->select('unit_type')
            ->distinct()
            ->pluck('unit_type')
            ->toArray();

        // Map unit types to price categories
        $priceCategories = [];
        if (in_array('kg', $unitTypes)) {
            $priceCategories[] = 'per_kilo';
        }
        if (in_array('tali', $unitTypes)) {
            $priceCategories[] = 'per_tali';
        }
        if (in_array('pc', $unitTypes)) {
            $priceCategories[] = 'per_pc';
        }

        return response()->json([
            'product_name' => $productName,
            'price_categories' => $priceCategories,
        ]);
    }

    public function data(Request $request)
    {
        $validated = $request->validate([
            'product_names' => 'nullable|array',
            'product_names.*' => 'string',
            'category' => 'nullable|in:all,fruit,vegetable',
            'price_categories' => 'nullable|array',
            'price_categories.*' => 'in:per_kilo,per_tali,per_pc',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
        ]);

        $query = PriceTrend::query()->orderBy('date');

        // Filter by product names
        if (!empty($validated['product_names'])) {
            $query->whereIn('product_name', $validated['product_names']);
        }

        // Filter by category
        if (!empty($validated['category']) && $validated['category'] !== 'all') {
            $fruitProducts = ['Pakwan', 'Mais'];
            $vegetableProducts = ['Ampalaya', 'Kalabasa', 'Sitaw', 'Talong', 'Pipino', 'Pechay', 'Siling Labuyo', 'Siling Haba', 'Kamatis', 'Tanglad', 'Talbos ng Kamote', 'Alugbati', 'Kangkong'];
            
            if ($validated['category'] === 'fruit') {
                $query->whereIn('product_name', $fruitProducts);
            } elseif ($validated['category'] === 'vegetable') {
                $query->whereIn('product_name', $vegetableProducts);
            }
        }

        // Filter by price categories
        if (!empty($validated['price_categories'])) {
            $unitTypes = [];
            foreach ($validated['price_categories'] as $category) {
                if ($category === 'per_kilo') {
                    $unitTypes[] = 'kg';
                } elseif ($category === 'per_tali') {
                    $unitTypes[] = 'tali';
                } elseif ($category === 'per_pc') {
                    $unitTypes[] = 'pc';
                }
            }
            if (!empty($unitTypes)) {
                $query->whereIn('unit_type', $unitTypes);
            }
        }

        // Filter by date range - include data before start_date for proper interpolation
        if (!empty($validated['start_date'])) {
            // Get data from 90 days before start_date to ensure we have historical data for interpolation
            $extendedStartDate = Carbon::parse($validated['start_date'])->subDays(90)->toDateString();
            $query->where('date', '>=', $extendedStartDate);
        }
        if (!empty($validated['end_date'])) {
            $query->where('date', '<=', $validated['end_date']);
        }

        $trends = $query->get(['product_name', 'date', 'price_per_kg', 'price_per_tali', 'price_per_pc', 'unit_type']);

        // Group by product and map to simplified series
        $grouped = $trends->groupBy('product_name')->map(function ($items) {
            return [
                'product' => $items->first()->product_name,
                'series' => $items->map(function ($item) {
                    return [
                        'timestamp' => $item->date->toIso8601String(),
                        'price_kilo' => $item->price_per_kg,
                        'price_tali' => $item->price_per_tali,
                        'price_pc' => $item->price_per_pc,
                        'unit_type' => $item->unit_type,
                        'price' => $item->unit_type === 'kg' ? $item->price_per_kg : 
                                 ($item->unit_type === 'tali' ? $item->price_per_tali : $item->price_per_pc),
                    ];
                })->values(),
            ];
        })->values();

        return response()->json([
            'range' => [
                'from' => $validated['start_date'] ?? $trends->min('date')?->toIso8601String(),
                'to' => $validated['end_date'] ?? $trends->max('date')?->toIso8601String(),
            ],
            'data' => $grouped,
        ]);
    }

    public function getLatestData(Request $request)
    {
        $validated = $request->validate([
            'product_names' => 'required|array',
            'product_names.*' => 'string',
        ]);

        $latestData = [];

        foreach ($validated['product_names'] as $productName) {
            // Get the latest data for each unit type separately
            $latestKg = PriceTrend::where('product_name', $productName)
                ->where('unit_type', 'kg')
                ->orderBy('date', 'desc')
                ->first();

            $latestTali = PriceTrend::where('product_name', $productName)
                ->where('unit_type', 'tali')
                ->orderBy('date', 'desc')
                ->first();

            $latestPc = PriceTrend::where('product_name', $productName)
                ->where('unit_type', 'pc')
                ->orderBy('date', 'desc')
                ->first();

            $latestData[$productName] = [
                'product_name' => $productName,
                'price_per_kg' => $latestKg ? $latestKg->price_per_kg : null,
                'price_per_tali' => $latestTali ? $latestTali->price_per_tali : null,
                'price_per_pc' => $latestPc ? $latestPc->price_per_pc : null,
                'latest_date_kg' => $latestKg ? $latestKg->date->toIso8601String() : null,
                'latest_date_tali' => $latestTali ? $latestTali->date->toIso8601String() : null,
                'latest_date_pc' => $latestPc ? $latestPc->date->toIso8601String() : null,
            ];
        }

        return response()->json([
            'data' => $latestData,
        ]);
    }
}


