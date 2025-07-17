<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Stock;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

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

        // Create admin user after roles/permissions are seeded
        $admin = User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin@admin.com',
            'password' =>'12345678',
            'type' => 'admin',
        ]);
    }
}
