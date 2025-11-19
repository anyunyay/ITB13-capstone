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
            'is_default' => false,
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

        // Additional Logistics User - Elmo V. Republica
        $logisticUser3 = User::create([
            'type' => 'logistic',
            'name' => 'Elmo V. Republica',
            'email' => 'elmo@logistic.com',
            'contact_number' => '09111222333',
            'registration_date' => now()->subDays(20),
            'password' => Hash::make('12345678'),
            'email_verified_at' => now(),
            'active' => true,
        ]);

        UserAddress::create([
            'user_id' => $logisticUser3->id,
            'street' => '321 Transport Avenue',
            'barangay' => 'Sala',
            'city' => 'Cabuyao',
            'province' => 'Laguna',
            'is_active' => true,
        ]);

        // Create Farmer Users
        $farmers = [
            ['name' => 'Sonia Canceran', 'email' => 'sonia.canceran@farmer.com'],
            ['name' => 'Aurora P. Cervantes', 'email' => 'aurora.cervantes@farmer.com'],
            ['name' => 'Roger Dubos', 'email' => 'roger.dubos@farmer.com'],
            ['name' => 'Jouie P. Asido', 'email' => 'jouie.asido@farmer.com'],
            ['name' => 'Ronnie Asido', 'email' => 'ronnie.asido@farmer.com'],
            ['name' => 'Ronaldo L. Comite', 'email' => 'ronaldo.comite@farmer.com'],
            ['name' => 'Sotelia B. Cariod', 'email' => 'sotelia.cariod@farmer.com'],
            ['name' => 'Jell O. Federis', 'email' => 'jell.federis@farmer.com'],
            ['name' => 'Gregorio L. Bando', 'email' => 'gregorio.bando@farmer.com'],
            ['name' => 'Noel L. Villare', 'email' => 'noel.villare@farmer.com'],
            ['name' => 'Jimmy F. Santiago', 'email' => 'jimmy.santiago@farmer.com'],
            ['name' => 'Cristina R. Rogel', 'email' => 'cristina.rogel@farmer.com'],
        ];

        foreach ($farmers as $index => $farmerData) {
            $farmer = User::create([
                'type' => 'member',
                'name' => $farmerData['name'],
                'email' => $farmerData['email'],
                'contact_number' => '0912' . str_pad($index + 1, 7, '0', STR_PAD_LEFT),
                'registration_date' => now()->subDays(60 - $index * 2),
                'password' => Hash::make('12345678'),
                'email_verified_at' => now(),
                'active' => true,
            ]);

            UserAddress::create([
                'user_id' => $farmer->id,
                'street' => 'Farm ' . ($index + 1) . ', Agricultural Zone',
                'barangay' => 'Sala',
                'city' => 'Cabuyao',
                'province' => 'Laguna',
                'is_active' => true,
            ]);
        }

        // Create one test customer
        User::factory()->count(1)->customer()->create();

        // Note: Members will be created in DatabaseSeeder with specific member ID 2411000
        // as requested to exclude member seeding from this seeder
    }
}
