<?php
/**
 * Debug script to inspect order state
 * 
 * Usage: Add this as a temporary route in web.php:
 * Route::get('/debug-order/{order}', function(SalesAudit $order) {
 *     return response()->json([
 *         'order_id' => $order->id,
 *         'status' => $order->status,
 *         'is_suspicious' => $order->is_suspicious,
 *         'suspicious_reason' => $order->suspicious_reason,
 *         'admin_notes' => $order->admin_notes,
 *         'total_amount' => $order->total_amount,
 *         'created_at' => $order->created_at,
 *         'updated_at' => $order->updated_at,
 *         'admin_id' => $order->admin_id,
 *         'customer_id' => $order->customer_id,
 *         'is_merged_order' => strpos($order->admin_notes ?? '', 'Merged from orders:') !== false,
 *         'audit_trail_count' => $order->auditTrail()->count(),
 *         'audit_trail_items' => $order->auditTrail()->with(['product', 'stock'])->get()->map(function($trail) {
 *             return [
 *                 'id' => $trail->id,
 *                 'sale_id' => $trail->sale_id,
 *                 'product_id' => $trail->product_id,
 *                 'product_name' => $trail->product?->name,
 *                 'stock_id' => $trail->stock_id,
 *                 'has_stock' => $trail->stock ? true : false,
 *                 'stock_quantity' => $trail->stock?->quantity,
 *                 'quantity' => $trail->quantity,
 *                 'category' => $trail->category,
 *             ];
 *         }),
 *         'customer' => [
 *             'id' => $order->customer?->id,
 *             'name' => $order->customer?->name,
 *             'email' => $order->customer?->email,
 *         ],
 *         'can_be_approved' => in_array($order->status, ['pending', 'delayed']),
 *         'has_sufficient_stock' => $order->hasSufficientStock(),
 *     ]);
 * })->middleware(['auth', 'role:admin|staff']);
 * 
 * Then visit: /debug-order/{order_id} to see the order state
 */