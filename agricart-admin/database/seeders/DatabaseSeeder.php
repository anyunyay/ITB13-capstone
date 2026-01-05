<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // First, seed roles, users, staff, and members (farmers)
        $this->call([
            RoleSeeder::class,
            UserSeeder::class,
            StaffSeeder::class,
            MemberSeeder::class, // Creates member (farmer) users with sequential IDs
        ]);

        // Now seed products, stocks, and comprehensive sales data with proper relationships
        // This sequence matches the real application initialization flow:
        // 1. Products (catalog data)
        // 2. Stocks (member inventory)
        // 3. Price Trends (historical pricing)
        // 4. Sales (orders and transactions) - MUST run before NotificationSeeder
        // 5. Member Earnings (calculated from sales)
        // 6. Notifications (created after all events have occurred)
        //
        // IMPORTANT: NotificationSeeder depends on orders from ComprehensiveSalesSeeder
        // and must run AFTER it to avoid foreign key constraint violations
        $this->call([
            ProductSeeder::class,           // Creates product catalog
            StockSeeder::class,             // Creates member stocks
            PriceTrendSeeder::class,        // Creates price history
            ComprehensiveSalesSeeder::class, // Creates orders (SalesAudit) and sales
            MemberEarningsSeeder::class,    // Calculates member earnings
            NotificationSeeder::class,      // Creates notifications referencing orders
        ]);
    }
}
