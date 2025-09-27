<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Sales;
use App\Models\Product;
use App\Models\Stock;
use App\Models\User;
use Carbon\Carbon;

class SubsystemController extends Controller
{
    /**
     * Check for changes in specified subsystems
     */
    public function checkChanges(Request $request): JsonResponse
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['has_changes' => false]);
        }

        $lastCheck = $request->input('last_check');
        $subsystems = $request->input('subsystems', []);
        
        if (!$lastCheck) {
            return response()->json(['has_changes' => false]);
        }

        $lastCheckTime = Carbon::createFromTimestamp($lastCheck / 1000);
        $hasChanges = false;

        foreach ($subsystems as $subsystem) {
            switch ($subsystem) {
                case 'orders':
                    if ($this->checkOrdersChanges($lastCheckTime)) {
                        $hasChanges = true;
                        break 2; // Break out of both loops
                    }
                    break;
                    
                case 'sales':
                    if ($this->checkSalesChanges($lastCheckTime)) {
                        $hasChanges = true;
                        break 2; // Break out of both loops
                    }
                    break;
                    
                case 'inventory':
                    if ($this->checkInventoryChanges($lastCheckTime)) {
                        $hasChanges = true;
                        break 2; // Break out of both loops
                    }
                    break;
                    
                case 'logistics':
                    if ($this->checkLogisticsChanges($lastCheckTime)) {
                        $hasChanges = true;
                        break 2; // Break out of both loops
                    }
                    break;
                    
                case 'membership':
                    if ($this->checkMembershipChanges($lastCheckTime)) {
                        $hasChanges = true;
                        break 2; // Break out of both loops
                    }
                    break;
                    
                case 'staff':
                    if ($this->checkStaffChanges($lastCheckTime)) {
                        $hasChanges = true;
                        break 2; // Break out of both loops
                    }
                    break;
                    
                case 'stocks':
                    if ($this->checkStocksChanges($lastCheckTime)) {
                        $hasChanges = true;
                        break 2; // Break out of both loops
                    }
                    break;
            }
        }

        return response()->json([
            'has_changes' => $hasChanges,
            'checked_at' => now()->timestamp * 1000,
            'subsystems_checked' => $subsystems
        ]);
    }

    /**
     * Check for changes in orders (using Sales model)
     */
    private function checkOrdersChanges(Carbon $lastCheckTime): bool
    {
        return Sales::where('updated_at', '>', $lastCheckTime)
            ->orWhere('created_at', '>', $lastCheckTime)
            ->exists();
    }

    /**
     * Check for changes in sales
     */
    private function checkSalesChanges(Carbon $lastCheckTime): bool
    {
        return Sales::where('updated_at', '>', $lastCheckTime)
            ->orWhere('created_at', '>', $lastCheckTime)
            ->exists();
    }

    /**
     * Check for changes in inventory (products)
     */
    private function checkInventoryChanges(Carbon $lastCheckTime): bool
    {
        return Product::where('updated_at', '>', $lastCheckTime)
            ->orWhere('created_at', '>', $lastCheckTime)
            ->exists();
    }

    /**
     * Check for changes in logistics (orders with logistics data)
     */
    private function checkLogisticsChanges(Carbon $lastCheckTime): bool
    {
        return Sales::where('updated_at', '>', $lastCheckTime)
            ->whereNotNull('logistic_id')
            ->exists();
    }

    /**
     * Check for changes in membership (member users)
     */
    private function checkMembershipChanges(Carbon $lastCheckTime): bool
    {
        return User::where('type', 'member')
            ->where(function($query) use ($lastCheckTime) {
                $query->where('updated_at', '>', $lastCheckTime)
                      ->orWhere('created_at', '>', $lastCheckTime);
            })
            ->exists();
    }

    /**
     * Check for changes in staff (staff users)
     */
    private function checkStaffChanges(Carbon $lastCheckTime): bool
    {
        return User::where('type', 'staff')
            ->where(function($query) use ($lastCheckTime) {
                $query->where('updated_at', '>', $lastCheckTime)
                      ->orWhere('created_at', '>', $lastCheckTime);
            })
            ->exists();
    }

    /**
     * Check for changes in stocks
     */
    private function checkStocksChanges(Carbon $lastCheckTime): bool
    {
        return Stock::where('updated_at', '>', $lastCheckTime)
            ->orWhere('created_at', '>', $lastCheckTime)
            ->exists();
    }
}
