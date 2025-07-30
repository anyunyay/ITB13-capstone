<?php

namespace Database\Seeders;

use App\Models\User;
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
        ]);

        // Create another user manually
        User::create([
            'type' => 'member',
            'name' => 'John Doe',
            'address' => '123 Main St',
            'email' => 'member@member.com',
            'registration_date' => now(),
            'document' => 'https://via.placeholder.com/640x480.png?text=member',
            'password' => Hash::make('12345678'),
        ]);

        User::create([
            'type' => 'logistic',
            'name' => 'Logistic User',
            'address' => '456 Logistics Ave',
            'email' => 'logistic@logistic.com',
            'registration_date' => now(),
            'password' => Hash::make('12345678'),
        ]);
    }
}
