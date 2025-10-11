<?php

namespace App\Console\Commands;

use App\Models\SystemTracking;
use Illuminate\Console\Command;
use Carbon\Carbon;

class ScheduleSystemLockout extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'system:schedule-lockout 
                            {--minutes=1 : Number of minutes from now to schedule the lockout}
                            {--description= : Description for the scheduled lockout}
                            {--admin-id= : Admin user ID who scheduled this lockout}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Schedule a system lockout for a specific time in the future';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $minutes = (int) $this->option('minutes');
        $description = $this->option('description');
        $adminId = $this->option('admin-id');

        if ($minutes < 1) {
            $this->error('Minutes must be at least 1.');
            return 1;
        }

        $scheduledAt = Carbon::now()->addMinutes($minutes);
        
        // Default description if not provided
        if (!$description) {
            $description = "System lockout scheduled for {$minutes} minute" . ($minutes > 1 ? 's' : '') . " from now";
        }

        // Prepare metadata
        $metadata = [];
        if ($adminId) {
            $metadata['admin_user_id'] = $adminId;
        }
        $metadata['scheduled_by_command'] = true;
        $metadata['scheduled_at_time'] = now()->toISOString();

        try {
            // Check if there's already a scheduled lockout
            $existingLockout = SystemTracking::getNextScheduledLockout();
            if ($existingLockout) {
                $this->warn("There's already a scheduled lockout at: " . $existingLockout->scheduled_at->format('Y-m-d H:i:s'));
                
                if (!$this->confirm('Do you want to proceed anyway?')) {
                    $this->info('Operation cancelled.');
                    return 0;
                }
            }

            // Create the scheduled lockout
            $lockout = SystemTracking::scheduleLockout(
                $scheduledAt,
                $description,
                $metadata
            );

            $this->info("System lockout scheduled successfully!");
            $this->info("ID: {$lockout->id}");
            $this->info("Scheduled for: " . $scheduledAt->format('Y-m-d H:i:s'));
            $this->info("Description: {$description}");
            $this->info("Status: {$lockout->status}");

            $this->line('');
            $this->info("The system will automatically enforce the lockout at the scheduled time.");
            $this->info("All customer sessions will be logged out and access will be blocked.");
            $this->info("Admins can manage the lockout via the admin panel.");

            // Log the action
            \Log::info('System lockout scheduled via command', [
                'lockout_id' => $lockout->id,
                'scheduled_at' => $scheduledAt,
                'minutes_from_now' => $minutes,
                'description' => $description,
                'admin_id' => $adminId,
            ]);

        } catch (\Exception $e) {
            $this->error('Failed to schedule system lockout: ' . $e->getMessage());
            \Log::error('Failed to schedule system lockout', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'minutes' => $minutes,
                'description' => $description,
            ]);
            return 1;
        }

        return 0;
    }
}
