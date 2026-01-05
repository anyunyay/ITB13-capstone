<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class OpenEmailPreview extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'email:preview {--url= : Custom URL for the preview}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Open email preview in browser';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $baseUrl = $this->option('url') ?: 'http://127.0.0.1:8000';
        $previewUrl = $baseUrl . '/email-preview';

        $this->info('📧 Email Preview System');
        $this->line('');
        $this->info('🌐 Preview URLs:');
        $this->line("   Main Preview: {$previewUrl}");
        $this->line("   Approval Email: {$baseUrl}/email-preview/approval");
        $this->line("   Rejection Email: {$baseUrl}/email-preview/rejection");
        $this->line('');
        $this->info('📋 Available Features:');
        $this->line('   • Preview order approval emails with receipt details');
        $this->line('   • Preview order rejection emails with reasons');
        $this->line('   • Custom preview with real order data');
        $this->line('   • Responsive design testing');
        $this->line('');
        $this->info('🚀 Opening preview in browser...');

        // Try to open in browser (works on most systems)
        if (PHP_OS_FAMILY === 'Windows') {
            exec("start {$previewUrl}");
        } elseif (PHP_OS_FAMILY === 'Darwin') {
            exec("open {$previewUrl}");
        } else {
            exec("xdg-open {$previewUrl}");
        }

        $this->info('✅ Email preview should now be open in your browser!');
        $this->line('');
        $this->comment('💡 Tip: Use the custom preview feature to test with real order data');
    }
}
