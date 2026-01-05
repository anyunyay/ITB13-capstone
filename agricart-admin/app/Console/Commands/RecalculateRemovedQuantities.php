<?php

namespace App\Console\Commands;

use App\Models\Stock;
use App\Models\StockTrail;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class RecalculateRemovedQuantities extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'stock:recalculate-removed
                            {--dry-run : Run without making changes}
                            {--member= : Only process stocks for specific member ID}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Recalculate removed_quantity for all stocks based on stock trail history';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $dryRun = $this->option('dry-run');
        $memberId = $this->option('member');

        $this->info('Starting removed quantity recalculation...');
        
        if ($dryRun) {
            $this->warn('DRY RUN MODE - No changes will be made');
        }

        // Get stocks to process
        $query = Stock::query();
        
        if ($memberId) {
            $query->where('member_id', $memberId);
            $this->info("Processing stocks for member ID: {$memberId}");
        }

        $stocks = $query->get();
        $this->info("Found {$stocks->count()} stocks to process");

        $updated = 0;
        $skipped = 0;
        $errors = 0;

        $progressBar = $this->output->createProgressBar($stocks->count());
        $progressBar->start();

        foreach ($stocks as $stock) {
            try {
                // Calculate total removed quantity from stock trails
                $totalRemoved = StockTrail::where('stock_id', $stock->id)
                    ->where('action_type', 'removed')
                    ->get()
                    ->sum(function ($trail) {
                        return ($trail->old_quantity ?? 0) - ($trail->new_quantity ?? 0);
                    });

                // Check if update is needed
                $currentRemoved = $stock->removed_quantity ?? 0;
                
                if ($totalRemoved != $currentRemoved) {
                    if (!$dryRun) {
                        $stock->update(['removed_quantity' => $totalRemoved]);
                    }
                    
                    $this->newLine();
                    $this->line("Stock ID {$stock->id}: Updated removed_quantity from {$currentRemoved} to {$totalRemoved}");
                    $updated++;
                } else {
                    $skipped++;
                }
            } catch (\Exception $e) {
                $this->newLine();
                $this->error("Error processing stock ID {$stock->id}: " . $e->getMessage());
                $errors++;
            }

            $progressBar->advance();
        }

        $progressBar->finish();
        $this->newLine(2);

        // Summary
        $this->info('Recalculation complete!');
        $this->table(
            ['Status', 'Count'],
            [
                ['Updated', $updated],
                ['Skipped (already correct)', $skipped],
                ['Errors', $errors],
                ['Total Processed', $stocks->count()],
            ]
        );

        if ($dryRun && $updated > 0) {
            $this->warn("This was a dry run. Run without --dry-run to apply changes.");
        }

        return Command::SUCCESS;
    }
}
