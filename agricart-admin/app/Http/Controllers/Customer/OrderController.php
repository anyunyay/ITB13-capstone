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

        $orders = $user->sales()
            ->with(['auditTrail.product', 'admin', 'logistic'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($sale) {
                return [
                    'id' => $sale->id,
                    'total_amount' => $sale->total_amount,
                    'status' => $sale->status,
                    'created_at' => $sale->created_at->toISOString(),
                    'admin_notes' => $sale->admin_notes,
                    'logistic' => $sale->logistic ? [
                        'id' => $sale->logistic->id,
                        'name' => $sale->logistic->name,
                        'contact_number' => $sale->logistic->contact_number,
                    ] : null,
                    'auditTrail' => $sale->auditTrail->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'product' => [
                                'name' => $item->product->name ?? 'Unknown',
                                'price' => $item->product->price ?? 0,
                            ],
                            'category' => $item->category,
                            'quantity' => $item->quantity,
                        ];
                    }),
                ];
            });

        return Inertia::render('Customer/Order History/index', compact('orders'));
    }
}
