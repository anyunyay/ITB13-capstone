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
        $admin = User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin@admin.com',
            'password' =>'12345678',
            'type' => 'admin',
        ]);

        // Create token for the admin
        $token = $admin->createToken('admin-token')->plainTextToken;
        $this->command->info('Admin token created: ' . $token);

        // Seed products before stocks
        $this->call([
            UserSeeder::class,
            ProductSeeder::class,
            StockSeeder::class,
            RoleSeeder::class,
        ]);
    }
}
