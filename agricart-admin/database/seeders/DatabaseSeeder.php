<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserAddress;
use App\Models\Stock;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // First, seed roles and users (excluding members as requested)
        $this->call([
            RoleSeeder::class,
            UserSeeder::class,
        ]);

        // Create the specific member user with ID 2411000 as requested
        $memberUser = User::create([
            'type' => 'member',
            'name' => 'Maria Santos',
            'email' => null, // No email for members - they use member_id for login
            'member_id' => '2411000', // Specific member ID as requested
            'contact_number' => '09123456789',
            'registration_date' => now()->subMonths(6), // Registered 6 months ago
            'document' => 'https://via.placeholder.com/640x480.png?text=member',
            'password' => Hash::make('12345678'),
            'email_verified_at' => now(), // Members are considered verified by default
            'active' => true,
            'is_default' => false,
        ]);

        // Create default address for the member
        UserAddress::create([
            'user_id' => $memberUser->id,
            'street' => '123 Farmer Road',
            'barangay' => 'Sala',
            'city' => 'Cabuyao',
            'province' => 'Laguna',
            'is_active' => true,
        ]);

        // Create additional members for more realistic data distribution
        $additionalMembers = [
            [
                'name' => 'Jose Rodriguez',
                'contact_number' => '09234567890',
                'street' => '456 Farm Lane',
                'barangay' => 'Sala',
                'city' => 'Cabuyao',
                'province' => 'Laguna',
            ],
            [
                'name' => 'Ana Cruz',
                'contact_number' => '09345678901',
                'street' => '789 Agriculture Street',
                'barangay' => 'Sala',
                'city' => 'Cabuyao',
                'province' => 'Laguna',
            ]
        ];

        foreach ($additionalMembers as $memberData) {
            $newMember = User::create([
                'type' => 'member',
                'name' => $memberData['name'],
                'email' => null,
                'contact_number' => $memberData['contact_number'],
                'registration_date' => now()->subMonths(rand(3, 12)),
                'document' => 'https://via.placeholder.com/640x480.png?text=member',
                'password' => Hash::make('12345678'),
                'email_verified_at' => now(),
                'active' => true,
                'is_default' => false,
                // member_id will be auto-generated
            ]);

            UserAddress::create([
                'user_id' => $newMember->id,
                'street' => $memberData['street'],
                'barangay' => $memberData['barangay'],
                'city' => $memberData['city'],
                'province' => $memberData['province'],
                'is_active' => true,
            ]);
        }

        // Now seed products, stocks, and comprehensive sales data with proper relationships
        // This sequence matches the real application initialization flow:
        // 1. Products (catalog data)
        // 2. Stocks (member inventory)
        // 3. Price Trends (historical pricing)
        // 4. Sales (orders and transactions)
        // 5. Member Earnings (calculated from sales)
        // 6. Notifications (created after all events have occurred)
        $this->call([
            ProductSeeder::class,           // Creates product catalog
            StockSeeder::class,             // Creates member stocks
            PriceTrendSeeder::class,        // Creates price history
            ComprehensiveSalesSeeder::class, // Creates orders and sales
            MemberEarningsSeeder::class,    // Calculates member earnings
            NotificationSeeder::class,      // Creates notifications for all events
        ]);
    }
}
