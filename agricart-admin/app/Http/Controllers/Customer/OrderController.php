<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $sales = $user->sales()
            ->with(['auditTrail.product'])
            ->oldest()
            ->get()
            ->map(function ($sale) {
                return [
                    'id' => $sale->id,
                    'date' => $sale->created_at->format('Y-m-d H:i'),
                    'total_price' => $sale->total_amount,
                    'items' => $sale->auditTrail->map(function ($item) {
                        return [
                            'product_name' => $item->product->name ?? 'Unknown',
                            'produce_type' => $item->product->produce_type ?? 'Unknown', // fruit/vegetable
                            'category' => $item->category, // Kilo/Pc/Tali
                            'quantity' => $item->quantity,
                            'unit_price' => $item->product->price ?? 0,
                            'subtotal' => $item->quantity * ($item->product->price ?? 0),
                        ];
                    }),
                ];
            });

        return Inertia::render('Customer/Order History/index', compact('sales'));
    }
}
