<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\StockTrail;

class TestStockTrailData extends Command
{
    protected $signature = 'test:stock-trail-data';
    protected $description = 'Test stock trail data loading';

    public function handle()
    {
        $this->info('Testing Stock Trail Data...');
        
        $trail = StockTrail::with('performedByUser')->first();
        
        if (!$trail) {
            $this->error('No stock trails found in database');
            return 1;
        }
        
        $this->info("Trail ID: {$trail->id}");
        $this->info("Action Type: {$trail->action_type}");
        $this->info("Performed By ID: " . ($trail->performed_by ?? 'NULL'));
        $this->info("Performed By Type: " . ($trail->performed_by_type ?? 'NULL'));
        
        if ($trail->performedByUser) {
            $this->info("User Name: {$trail->performedByUser->name}");
            $this->info("User Type: {$trail->performedByUser->type}");
        } else {
            $this->warn("performedByUser relationship returned NULL");
        }
        
        // Check a few more records
        $this->info("\nChecking 5 recent records:");
        $trails = StockTrail::with('performedByUser')->latest()->take(5)->get();
        
        foreach ($trails as $t) {
            $userName = $t->performedByUser ? $t->performedByUser->name : 'NULL';
            $this->line("ID: {$t->id} | Action: {$t->action_type} | Performed By: {$userName}");
        }
        
        return 0;
    }
}

