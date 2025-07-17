<?php

namespace Database\Seeders;

use App\Models\User;
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

        User::factory()->create([
            'name' => 'Admin2',
            'email' => 'admin2@admin.com',
            'password' =>'12345678',
            'type' => 'admin',
        ]);

        User::factory()->create([
            'firstname' => 'John',
            'lastname' => 'Doe',
            'username' => 'johndoe',
            'email' => 'customer@gmail.com',
            'contact_number' => '1234567890',
            'password' => '12345678',
            'type' => 'customer',
        ]);

        $this->call([
            RoleSeeder::class,
            ProductSeeder::class,
        ]);
    }
}
