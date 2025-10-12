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
        // Seed products before stocks
        $this->call([
            RoleSeeder::class,
            UserSeeder::class,
            ProductSeeder::class,
            StockSeeder::class,
            PriceTrendSeeder::class,
            UrgentOrderTestSeeder::class,
            MemberEarningsSeeder::class,
            SystemStatusSeeder::class,
        ]);

        // Create another user manually with specific member_id
        $memberUser = User::create([
            'type' => 'member',
            'name' => 'John Doe',
            'email' => null, // No email for members - they use member_id for login
            'member_id' => '2411997', // Specific member ID for testing (avoiding conflicts)
            'contact_number' => '09123456789',
            'registration_date' => now(),
            'document' => 'https://via.placeholder.com/640x480.png?text=member',
            'password' => Hash::make('12345678'),
            'email_verified_at' => now(), // Automatically verify email
            'is_default' => true, // Default account created by seeder
        ]);

        // Create default address for the member
        UserAddress::create([
            'user_id' => $memberUser->id,
            'street' => '123 Main St',
            'barangay' => 'Sala',
            'city' => 'Cabuyao',
            'province' => 'Laguna',
            'is_active' => true,
        ]);

        $logisticUser = User::create([
            'type' => 'logistic',
            'name' => 'Logistic User',
            'email' => 'logistic@logistic.com',
            'contact_number' => '09987654321',
            'registration_date' => now(),
            'password' => Hash::make('12345678'),
            'email_verified_at' => null, // Not automatically verified - must update credentials
            'is_default' => true, // Default account created by seeder
        ]);

        // Create default address for the logistic
        UserAddress::create([
            'user_id' => $logisticUser->id,
            'street' => '456 Logistics Ave',
            'barangay' => 'Sala',
            'city' => 'Cabuyao',
            'province' => 'Laguna',
            'is_active' => true,
        ]);
    }
}
