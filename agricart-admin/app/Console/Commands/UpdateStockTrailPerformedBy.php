<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\StockTrail;
use App\Models\User;

class UpdateStockTrailPerformedBy extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'stock-trail:update-performed-by';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update existing stock trail records to populate performed_by field with appropriate user information';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting to update stock trail performed_by fields...');

        // Get all stock trails without performed_by
        $trails = StockTrail::whereNull('performed_by')->get();
        
        $this->info("Found {$trails->count()} stock trail records without performed_by information.");

        if ($trails->isEmpty()) {
            $this->info('No records to update.');
            return 0;
        }

        $updated = 0;
        $skipped = 0;

        // Get the first admin user as fallback
        $adminUser = User::where('type', 'admin')->first();

        if (!$adminUser) {
            $this->error('No admin user found in the system. Cannot proceed.');
            return 1;
        }

        foreach ($trails as $trail) {
            try {
                // Determine who performed the action based on action type and context
                $performedBy = null;
                $performedByType = 'system';

                // For created/added actions, use the member who owns the stock
                if (in_array($trail->action_type, ['created', 'added'])) {
                    if ($trail->member_id) {
                        $performedBy = $trail->member_id;
                        $member = User::find($trail->member_id);
                        $performedByType = $member ? $member->type : 'member';
                    }
                }
                
                // For removed/deleted actions, likely performed by admin/staff
                // Use the admin user as default
                if (in_array($trail->action_type, ['removed', 'deleted'])) {
                    $performedBy = $adminUser->id;
                    $performedByType = 'admin';
                }

                // For updated/edited actions, could be member or admin
                // Default to admin for safety
                if (in_array($trail->action_type, ['updated', 'edited'])) {
                    $performedBy = $adminUser->id;
                    $performedByType = 'admin';
                }

                // For sold actions, use admin (since sales are processed by system/admin)
                if (in_array($trail->action_type, ['sold', 'sale'])) {
                    $performedBy = $adminUser->id;
                    $performedByType = 'admin';
                }

                // Update the trail
                if ($performedBy) {
                    $trail->update([
                        'performed_by' => $performedBy,
                        'performed_by_type' => $performedByType,
                    ]);
                    $updated++;
                } else {
                    $skipped++;
                }

            } catch (\Exception $e) {
                $this->error("Error updating trail ID {$trail->id}: {$e->getMessage()}");
                $skipped++;
            }
        }

        $this->info("Update complete!");
        $this->info("Updated: {$updated} records");
        $this->info("Skipped: {$skipped} records");

        return 0;
    }
}

