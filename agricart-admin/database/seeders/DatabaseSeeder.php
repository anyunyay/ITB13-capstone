<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Product;
use App\Models\Stock;
use App\Models\SalesAudit;
use App\Models\Sales;
use App\Models\AuditTrail;
use App\Models\MemberEarnings;
use App\Models\PriceTrend;

class DatabaseSeeder extends Seeder
{
    /**
     * Unified Master Seeder - Populates entire system with interconnected, realistic data
     * 
     * This seeder orchestrates all sub-seeders in the correct order to ensure:
     * - All foreign key relationships are preserved
     * - Data is realistic and interconnected
     * - Timestamps are staggered for testing
     * - System is fully functional after seeding
     * 
     * Execution Order:
     * 1. Roles & Permissions
     * 2. Users (Admin, Staff, Members, Logistics, Customers)
     * 3. Products & Inventory
     * 4. Stocks (Member inventory)
     * 5. Price Trends (Historical pricing)
     * 6. Orders & Sales (With audit trails and stock updates)
     * 7. Member Earnings (Calculated from sales)
     * 8. Notifications (Order updates, stock changes, etc.)
     * 
     * Usage:
     *   php artisan db:seed                    # Seed all data
     *   php artisan migrate:fresh --seed       # Fresh database + seed
     */
    public function run(): void
    {
        $this->command->info('');
        $this->command->info('╔════════════════════════════════════════════════════════════════╗');
        $this->command->info('║   🌾 AgriCart Admin - Unified Database Seeder                 ║');
        $this->command->info('║   Populating system with interconnected, realistic data        ║');
        $this->command->info('╚════════════════════════════════════════════════════════════════╝');
        $this->command->info('');

        // ============================================================
        // PHASE 1: Foundation - Users & Roles
        // ============================================================
        $this->command->info('📋 PHASE 1: Foundation - Users & Roles');
        $this->command->info('─────────────────────────────────────────────────────────────────');
        
        $this->call([
            RoleSeeder::class,      // Creates roles and permissions
            UserSeeder::class,      // Creates admin, logistics, customers
            StaffSeeder::class,     // Creates staff users
            MemberSeeder::class,    // Creates member (farmer) users
        ]);

        $this->printPhaseStats('Users', [
            'Admin' => User::where('type', 'admin')->count(),
            'Staff' => User::where('type', 'staff')->count(),
            'Members' => User::where('type', 'member')->count(),
            'Logistics' => User::where('type', 'logistic')->count(),
            'Customers' => User::where('type', 'customer')->count(),
        ]);

        // ============================================================
        // PHASE 2: Catalog - Products & Inventory
        // ============================================================
        $this->command->info('');
        $this->command->info('📦 PHASE 2: Catalog - Products & Inventory');
        $this->command->info('─────────────────────────────────────────────────────────────────');
        
        $this->call([
            ProductSeeder::class,       // Creates product catalog
            StockSeeder::class,         // Creates member stocks
            PriceTrendSeeder::class,    // Creates price history
        ]);

        $this->printPhaseStats('Inventory', [
            'Products' => Product::count(),
            'Stocks' => Stock::count(),
            'Available Stock' => Stock::where('quantity', '>', 0)->count(),
            'Price Trends' => PriceTrend::count(),
        ]);

        // ============================================================
        // PHASE 3: Transactions - Orders & Sales
        // ============================================================
        $this->command->info('');
        $this->command->info('🛒 PHASE 3: Transactions - Orders & Sales');
        $this->command->info('─────────────────────────────────────────────────────────────────');
        
        $this->call([
            OrderHistoryLazyLoadingSeeder::class,   // Creates orders with lazy loading support
        ]);

        $this->printPhaseStats('Orders', [
            'Total Orders' => SalesAudit::count(),
            'Pending' => SalesAudit::where('status', 'pending')->count(),
            'Approved' => SalesAudit::where('status', 'approved')->count(),
            'Delivered' => Sales::count(),
            'Order Items' => AuditTrail::count(),
        ]);

        // ============================================================
        // PHASE 4: Analytics - Earnings & Notifications
        // ============================================================
        $this->command->info('');
        $this->command->info('📊 PHASE 4: Analytics - Earnings & Notifications');
        $this->command->info('─────────────────────────────────────────────────────────────────');
        
        $this->call([
            MemberEarningsSeeder::class,    // Calculates member earnings
            // NotificationSeeder removed - notifications now created with orders
        ]);

        $notificationCount = \DB::table('notifications')->count();
        
        $this->printPhaseStats('Analytics', [
            'Member Earnings' => MemberEarnings::count(),
            'Notifications' => $notificationCount,
        ]);

        // ============================================================
        // SUMMARY
        // ============================================================
        $this->printFinalSummary();
    }

    /**
     * Print statistics for a phase
     */
    private function printPhaseStats(string $category, array $stats): void
    {
        $this->command->info('');
        foreach ($stats as $label => $count) {
            $this->command->info("  ✓ {$label}: {$count}");
        }
    }

    /**
     * Print final summary
     */
    private function printFinalSummary(): void
    {
        $this->command->info('');
        $this->command->info('╔════════════════════════════════════════════════════════════════╗');
        $this->command->info('║   ✨ Database Seeding Complete!                                ║');
        $this->command->info('╚════════════════════════════════════════════════════════════════╝');
        $this->command->info('');
        
        $this->command->info('📊 FINAL STATISTICS:');
        $this->command->info('─────────────────────────────────────────────────────────────────');
        
        $stats = [
            'Total Users' => User::count(),
            'Total Products' => Product::count(),
            'Total Stocks' => Stock::count(),
            'Total Orders' => SalesAudit::count(),
            'Delivered Orders' => Sales::count(),
            'Order Items' => AuditTrail::count(),
            'Member Earnings' => MemberEarnings::count(),
            'Price Trends' => PriceTrend::count(),
            'Notifications' => \Illuminate\Support\Facades\DB::table('notifications')->count(),
        ];

        foreach ($stats as $label => $count) {
            $this->command->info(sprintf('  %-20s : %d', $label, $count));
        }

        $this->command->info('');
        $this->command->info('🎯 KEY FEATURES:');
        $this->command->info('  ✓ All foreign key relationships preserved');
        $this->command->info('  ✓ Realistic timestamps with staggered updates');
        $this->command->info('  ✓ Orders support lazy loading (4 per page)');
        $this->command->info('  ✓ Latest modified orders appear first');
        $this->command->info('  ✓ Notifications linked to orders and users');
        $this->command->info('  ✓ Stock trails track inventory changes');
        $this->command->info('  ✓ Member earnings calculated from sales');
        $this->command->info('');
        
        $this->command->info('🚀 NEXT STEPS:');
        $this->command->info('  1. Test Order History: /customer/orders/history');
        $this->command->info('  2. Verify lazy loading (4 orders per page)');
        $this->command->info('  3. Test notification navigation');
        $this->command->info('  4. Check member earnings dashboard');
        $this->command->info('');
        
        $this->command->info('📚 DOCUMENTATION:');
        $this->command->info('  - ORDER_HISTORY_LAZY_LOADING_IMPLEMENTATION.md');
        $this->command->info('  - ORDER_HISTORY_SEEDER_DOCUMENTATION.md');
        $this->command->info('  - ORDER_HISTORY_COMPLETE_IMPLEMENTATION_SUMMARY.md');
        $this->command->info('');
    }
}
