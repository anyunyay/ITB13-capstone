<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class OpenDirectEmailTemplates extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'email:templates {--url= : Custom URL for the templates}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Open direct email templates in browser';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $baseUrl = $this->option('url') ?: 'http://127.0.0.1:8000';
        $templatesUrl = $baseUrl . '/direct-email-templates';

        $this->info('📧 Direct Email Templates System');
        $this->line('');
        $this->info('🌐 Template URLs:');
        $this->line("   Main Templates: {$templatesUrl}");
        $this->line("   Order Approval: {$baseUrl}/direct-email-templates/order-approval");
        $this->line("   Order Rejection: {$baseUrl}/direct-email-templates/order-rejection");
        $this->line("   New Order: {$baseUrl}/direct-email-templates/new-order");
        $this->line('');
        $this->info('📋 Available Templates:');
        $this->line('   • Order Approval & Receipt (with real data)');
        $this->line('   • Order Rejection (with reasons)');
        $this->line('   • New Order Notification (admin alerts)');
        $this->line('   • Order Confirmation (customer confirmations)');
        $this->line('   • Delivery Status Updates (logistics)');
        $this->line('   • Product Sale Notifications (members)');
        $this->line('   • Earnings Updates (farmers)');
        $this->line('   • Low Stock Alerts (inventory)');
        $this->line('   • And 6 more email types...');
        $this->line('');
        $this->info('🚀 Opening templates in browser...');

        // Try to open in browser (works on most systems)
        if (PHP_OS_FAMILY === 'Windows') {
            exec("start {$templatesUrl}");
        } elseif (PHP_OS_FAMILY === 'Darwin') {
            exec("open {$templatesUrl}");
        } else {
            exec("xdg-open {$templatesUrl}");
        }

        $this->info('✅ Direct email templates should now be open in your browser!');
        $this->line('');
        $this->comment('💡 Tip: All templates show real data - no ID input required!');
        $this->comment('💡 Each template shows exactly how emails will appear to users.');
    }
}
