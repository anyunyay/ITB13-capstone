<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class ResetPopupSession extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'popup:reset';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reset urgent popup session (for testing purposes)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('To reset the urgent popup session:');
        $this->info('');
        $this->info('1. Open your browser and go to the admin panel');
        $this->info('2. Open Developer Tools (F12)');
        $this->info('3. Go to the "Application" or "Storage" tab');
        $this->info('4. Find "Session Storage" in the left sidebar');
        $this->info('5. Clear all session storage items');
        $this->info('6. Refresh the page');
        $this->info('');
        $this->info('Alternatively, you can run this JavaScript in the browser console:');
        $this->info('sessionStorage.clear();');
        $this->info('');
        $this->info('This will allow the urgent popup to show again on the next page load.');
        
        return 0;
    }
}