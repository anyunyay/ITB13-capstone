<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserAddress;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing users to avoid conflicts
        User::query()->delete();
        UserAddress::query()->delete();

        // Create specific admin user as requested
        $adminUser = User::create([
            'type' => 'admin',
            'name' => 'Samuel Salazar',
            'email' => 'admin@admin.com',
            'password' => Hash::make('12345678'),
            'email_verified_at' => now(),
            'is_default' => true,
            'active' => true,
        ]);

        // Create default address for admin
        UserAddress::create([
            'user_id' => $adminUser->id,
            'street' => 'Admin Office, 123 Business Plaza',
            'barangay' => 'Sala',
            'city' => 'Cabuyao',
            'province' => 'Laguna',
            'is_active' => true,
        ]);

        // Create specific logistics users as requested
        $logisticUser1 = User::create([
            'type' => 'logistic',
            'name' => 'Judel Macasinag',
            'email' => 'judel@logistic.com',
            'contact_number' => '09123456789',
            'registration_date' => now()->subDays(30),
            'password' => Hash::make('12345678'),
            'email_verified_at' => now(),
            'active' => true,
        ]);

        UserAddress::create([
            'user_id' => $logisticUser1->id,
            'street' => '456 Delivery Road',
            'barangay' => 'Sala',
            'city' => 'Cabuyao',
            'province' => 'Laguna',
            'is_active' => true,
        ]);

        $logisticUser2 = User::create([
            'type' => 'logistic',
            'name' => 'Juan Benedict',
            'email' => 'juan@logistic.com',
            'contact_number' => '09987654321',
            'registration_date' => now()->subDays(25),
            'password' => Hash::make('12345678'),
            'email_verified_at' => now(),
            'active' => true,
        ]);

        UserAddress::create([
            'user_id' => $logisticUser2->id,
            'street' => '789 Logistics Street',
            'barangay' => 'Sala',
            'city' => 'Cabuyao',
            'province' => 'Laguna',
            'is_active' => true,
        ]);

        // Create one test customer
        User::factory()->count(1)->customer()->create();

        // Note: Members will be created in DatabaseSeeder with specific member ID 2411000
        // as requested to exclude member seeding from this seeder
    }
}
