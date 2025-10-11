<?php

namespace App\Console\Commands;

use App\Models\SystemSchedule;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DailySystemLockout extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'system:daily-lockout';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Initiate daily system lockout for customers and log out all customer sessions';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting daily system lockout process...');

        try {
            // Get or create today's system schedule record
            $schedule = SystemSchedule::getOrCreateTodayRecord();
            
            // Check if lockout has already been initiated today
            if ($schedule->is_locked) {
                $this->warn('Daily lockout has already been initiated today.');
                return;
            }

            // Initiate the lockout
            $schedule->initiateLockout();
            $this->info('System lockout initiated for ' . now()->format('Y-m-d'));

            // Log out all customer sessions
            $this->logoutAllCustomers();

            // Log the action
            Log::info('Daily system lockout initiated', [
                'date' => now()->format('Y-m-d'),
                'lockout_time' => $schedule->lockout_time,
            ]);

            $this->info('Daily system lockout completed successfully.');
            $this->info('All customers have been logged out and cannot access the system until admin action.');

        } catch (\Exception $e) {
            $this->error('Failed to initiate daily lockout: ' . $e->getMessage());
            Log::error('Daily system lockout failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return 1;
        }

        return 0;
    }

    /**
     * Log out all customer sessions
     */
    private function logoutAllCustomers(): void
    {
        $this->info('Logging out all customer sessions...');

        // Get all customer users
        $customers = User::where('type', 'customer')->get();
        
        $loggedOutCount = 0;
        
        foreach ($customers as $customer) {
            // Clear their current session ID
            $customer->clearCurrentSession();
            
            // Delete all their sessions from the sessions table
            DB::table('sessions')
                ->where('user_id', $customer->id)
                ->delete();
                
            $loggedOutCount++;
        }

        $this->info("Successfully logged out {$loggedOutCount} customer sessions.");
        
        Log::info('Customer sessions logged out', [
            'customer_count' => $loggedOutCount,
            'date' => now()->format('Y-m-d'),
        ]);
    }
}
