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
                    'commission_rate' => 0.90, // 90% member earnings rate
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
        
        // Get member earnings from the new system
        $memberEarnings = \App\Models\MemberEarning::where('member_id', $member->id)
            ->whereHas('sale', function($query) use ($startDate) {
                $query->where('status', 'approved')
                      ->where('created_at', '>=', $startDate);
            })
            ->sum('amount');

        return $memberEarnings;
    }

    /**
     * Get total sales for a member for the specified period
     */
    private function getTotalSales(User $member, string $period): float
    {
        $startDate = $this->getPeriodStartDate($period);
        
        // Get total sales from member earnings
        $totalSales = \App\Models\MemberEarning::where('member_id', $member->id)
            ->whereHas('sale', function($query) use ($startDate) {
                $query->where('status', 'approved')
                      ->where('created_at', '>=', $startDate);
            })
            ->join('sales', 'member_earnings.sale_id', '=', 'sales.id')
            ->sum('sales.total_amount');

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
