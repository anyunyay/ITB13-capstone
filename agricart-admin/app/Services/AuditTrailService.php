<?php

namespace App\Services;

use App\Models\AuditTrail;
use App\Models\SalesAudit;
use App\Models\Stock;
use App\Models\Product;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AuditTrailService
{
    /**
     * Create comprehensive audit trail entries for a multi-member order
     * 
     * @param SalesAudit $order The sales audit order
     * @param Collection $stockTransactions Collection of stock transactions with member details
     * @return Collection Created audit trail entries
     */
    public static function createMultiMemberAuditTrails(
        SalesAudit $order, 
        Collection $stockTransactions
    ): Collection {
        $auditTrails = collect();
        
        DB::transaction(function () use ($order, $stockTransactions, &$auditTrails) {
            foreach ($stockTransactions as $transaction) {
                $auditTrail = self::createSingleMemberAuditTrail(
                    $order,
                    $transaction['stock'],
                    $transaction['product'],
                    $transaction['quantity_sold'],
                    $transaction['available_stock_after_sale']
                );
                
                $auditTrails->push($auditTrail);
                
                // Log the creation for debugging
                Log::info('Audit trail created for multi-member order', [
                    'order_id' => $order->id,
                    'member_id' => $transaction['stock']->member_id,
                    'stock_id' => $transaction['stock']->id,
                    'product_name' => $transaction['product']->name,
                    'quantity_sold' => $transaction['quantity_sold'],
                    'available_stock_after_sale' => $transaction['available_stock_after_sale']
                ]);
            }
        });
        
        return $auditTrails;
    }

    /**
     * Create a single audit trail entry for a member's stock
     * 
     * @param SalesAudit $order
     * @param Stock $stock
     * @param Product $product
     * @param float $quantitySold
     * @param float $availableStockAfterSale
     * @return AuditTrail
     */
    public static function createSingleMemberAuditTrail(
        SalesAudit $order,
        Stock $stock,
        Product $product,
        float $quantitySold,
        float $availableStockAfterSale
    ): AuditTrail {
        return AuditTrail::create([
            'sale_id' => $order->id,
            'order_id' => $order->id,
            'stock_id' => $stock->id,
            'member_id' => $stock->member_id,
            'product_id' => $product->id,
            'product_name' => $product->name,
            'category' => $stock->category,
            'quantity' => $quantitySold,
            'available_stock_after_sale' => $availableStockAfterSale,
            'price_kilo' => $product->price_kilo,
            'price_pc' => $product->price_pc,
            'price_tali' => $product->price_tali,
            'unit_price' => self::getUnitPrice($product, $stock->category),
        ]);
    }

    /**
     * Validate audit trail completeness for a multi-member order
     * 
     * @param SalesAudit $order
     * @param Collection $expectedMembers Collection of expected member IDs
     * @return array Validation results
     */
    public static function validateMultiMemberAuditTrails(
        SalesAudit $order, 
        Collection $expectedMembers
    ): array {
        $auditTrails = $order->auditTrail()->with(['member', 'stock'])->get();
        
        $validation = [
            'is_complete' => true,
            'missing_members' => [],
            'duplicate_entries' => [],
            'total_entries' => $auditTrails->count(),
            'member_breakdown' => []
        ];
        
        // Check for missing members
        $auditedMembers = $auditTrails->pluck('member_id')->unique();
        $missingMembers = $expectedMembers->diff($auditedMembers);
        
        if ($missingMembers->isNotEmpty()) {
            $validation['is_complete'] = false;
            $validation['missing_members'] = $missingMembers->toArray();
        }
        
        // Check for duplicate entries (same member + stock combination)
        $memberStockCombinations = $auditTrails->map(function ($trail) {
            return $trail->member_id . '_' . $trail->stock_id;
        });
        
        $duplicates = $memberStockCombinations->duplicates();
        if ($duplicates->isNotEmpty()) {
            $validation['is_complete'] = false;
            $validation['duplicate_entries'] = $duplicates->toArray();
        }
        
        // Create member breakdown
        foreach ($auditTrails->groupBy('member_id') as $memberId => $memberTrails) {
            $validation['member_breakdown'][$memberId] = [
                'member_name' => $memberTrails->first()->member->name ?? 'Unknown',
                'total_quantity_sold' => $memberTrails->sum('quantity'),
                'total_revenue' => $memberTrails->sum(function ($trail) {
                    return $trail->quantity * $trail->getSalePrice();
                }),
                'products_involved' => $memberTrails->pluck('product_name')->unique()->toArray(),
                'stock_entries' => $memberTrails->count()
            ];
        }
        
        return $validation;
    }

    /**
     * Get audit trail summary for a multi-member order
     * 
     * @param SalesAudit $order
     * @return array Summary data
     */
    public static function getMultiMemberOrderSummary(SalesAudit $order): array
    {
        $auditTrails = $order->auditTrail()->with(['member', 'stock', 'product'])->get();
        
        return [
            'order_id' => $order->id,
            'total_members_involved' => $auditTrails->pluck('member_id')->unique()->count(),
            'total_stock_entries' => $auditTrails->count(),
            'total_quantity_sold' => $auditTrails->sum('quantity'),
            'total_revenue' => $auditTrails->sum(function ($trail) {
                return $trail->quantity * $trail->getSalePrice();
            }),
            'members' => $auditTrails->groupBy('member_id')->map(function ($memberTrails, $memberId) {
                $member = $memberTrails->first()->member;
                return [
                    'member_id' => $memberId,
                    'member_name' => $member->name ?? 'Unknown',
                    'quantity_sold' => $memberTrails->sum('quantity'),
                    'revenue' => $memberTrails->sum(function ($trail) {
                        return $trail->quantity * $trail->getSalePrice();
                    }),
                    'products' => $memberTrails->map(function ($trail) {
                        return [
                            'product_name' => $trail->product_name,
                            'stock_id' => $trail->stock_id,
                            'quantity_sold' => $trail->quantity,
                            'available_after_sale' => $trail->available_stock_after_sale
                        ];
                    })->toArray()
                ];
            })->toArray()
        ];
    }

    /**
     * Get unit price for a product based on category
     * 
     * @param Product $product
     * @param string $category
     * @return float
     */
    private static function getUnitPrice(Product $product, string $category): float
    {
        switch ($category) {
            case 'Kilo':
                return $product->price_kilo ?? 0;
            case 'Pc':
                return $product->price_pc ?? 0;
            case 'Tali':
                return $product->price_tali ?? 0;
            default:
                return 0;
        }
    }
}
