<?php

namespace Database\Seeders;

use App\Models\Admin;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        Admin::factory()->create([
            'name' => 'Admin',
            'email' => 'admin@admin.com',
            'password' =>'12345678',
        ]);

        Admin::factory()->create([
            'name' => 'Admin2',
            'email' => 'admin2@admin.com',
            'password' =>'12345678',
        ]);


        $this->call([
            RoleSeeder::class,
            ProductSeeder::class,
            MemberSeeder::class,
            StockSeeder::class,
            LogisticSeeder::class,
            CustomerSeeder::class,
        ]);
    }
}
