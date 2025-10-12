<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Seed 1 admin
        User::factory()->count(1)->admin()->create();

        // Seed 1 customers
        User::factory()->count(1)->customer()->create();

        // Seed 3 members (member_id will be auto-generated starting from 2411001)
        User::factory()->count(3)->member()->create();

        // Seed 3 logistics
        User::factory()->count(3)->logistic()->create();
    }
}
