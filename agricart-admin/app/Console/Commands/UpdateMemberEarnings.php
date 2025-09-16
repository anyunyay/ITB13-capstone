<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Stock;
use App\Notifications\EarningsUpdateNotification;

class UpdateMemberEarnings extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'earnings:update {--period=monthly : Period for earnings calculation}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update member earnings and send notifications';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $period = $this->option('period');
        
        // Get all members
        $members = User::where('type', 'member')->get();
        
        $notifiedCount = 0;

        foreach ($members as $member) {
            // Calculate earnings for the period
            $earnings = $this->calculateEarnings($member, $period);
            
            if ($earnings > 0) {
                $member->notify(new EarningsUpdateNotification($earnings, $period, [
                    'total_sales' => $this->getTotalSales($member, $period),
                    'commission_rate' => 0.10, // 10% commission rate
                ]));
                $notifiedCount++;
            }
        }

        $this->info("Sent earnings updates to {$notifiedCount} members for {$period} period.");
        
        return Command::SUCCESS;
    }

    /**
     * Calculate earnings for a member for the specified period
     */
    private function calculateEarnings(User $member, string $period): float
    {
        $startDate = $this->getPeriodStartDate($period);
        
        // Get sold stocks for the member in the period
        $soldStocks = Stock::where('member_id', $member->id)
            ->where('status', 'sold')
            ->where('updated_at', '>=', $startDate)
            ->with('product')
            ->get();

        $totalEarnings = 0;
        $commissionRate = 0.10; // 10% commission

        foreach ($soldStocks as $stock) {
            // Calculate the price based on category
            $price = 0;
            if ($stock->category === 'Kilo' && $stock->product->price_kilo) {
                $price = $stock->product->price_kilo;
            } elseif ($stock->category === 'Pc' && $stock->product->price_pc) {
                $price = $stock->product->price_pc;
            } elseif ($stock->category === 'Tali' && $stock->product->price_tali) {
                $price = $stock->product->price_tali;
            }

            // Calculate earnings (commission on total sales)
            $totalSales = $price * $stock->quantity;
            $earnings = $totalSales * $commissionRate;
            $totalEarnings += $earnings;
        }

        return $totalEarnings;
    }

    /**
     * Get total sales for a member for the specified period
     */
    private function getTotalSales(User $member, string $period): float
    {
        $startDate = $this->getPeriodStartDate($period);
        
        $soldStocks = Stock::where('member_id', $member->id)
            ->where('status', 'sold')
            ->where('updated_at', '>=', $startDate)
            ->with('product')
            ->get();

        $totalSales = 0;

        foreach ($soldStocks as $stock) {
            $price = 0;
            if ($stock->category === 'Kilo' && $stock->product->price_kilo) {
                $price = $stock->product->price_kilo;
            } elseif ($stock->category === 'Pc' && $stock->product->price_pc) {
                $price = $stock->product->price_pc;
            } elseif ($stock->category === 'Tali' && $stock->product->price_tali) {
                $price = $stock->product->price_tali;
            }

            $totalSales += $price * $stock->quantity;
        }

        return $totalSales;
    }

    /**
     * Get the start date for the specified period
     */
    private function getPeriodStartDate(string $period): \Carbon\Carbon
    {
        switch ($period) {
            case 'daily':
                return now()->startOfDay();
            case 'weekly':
                return now()->startOfWeek();
            case 'monthly':
                return now()->startOfMonth();
            case 'yearly':
                return now()->startOfYear();
            default:
                return now()->startOfMonth();
        }
    }
}
