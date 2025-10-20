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
        // This must be done before StockSeeder and UrgentOrderTestSeeder
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
            'is_default' => true,
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

        // Now seed products, stocks, and orders with proper relationships
        $this->call([
            ProductSeeder::class,
            StockSeeder::class,
            PriceTrendSeeder::class,
            UrgentOrderTestSeeder::class,
            MemberEarningsSeeder::class,
        ]);
    }
}
