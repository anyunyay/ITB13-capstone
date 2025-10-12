<?php

namespace Database\Seeders;

use App\Models\SystemStatus;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SystemStatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        SystemStatus::create([
            'status_key' => 'customer_access',
            'status_value' => 'open',
            'lock_time' => null,
            'updated_by' => null,
        ]);
    }
}
