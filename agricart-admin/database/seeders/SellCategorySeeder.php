<?php

namespace Database\Seeders;

use App\Models\SellCategory;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SellCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        SellCategory::create()->createMany([
            ['sell_category' => 'Kilo'],
            ['sell_category' => 'Pc'],
            ['sell_category' => 'Tali'],
        ]);
    }
}
