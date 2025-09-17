<?php

namespace Database\Seeders;

use App\Models\PriceTrend;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class PriceTrendSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $priceData = [
            // June 1, 2025
            [
                'date' => '2025-06-01',
                'products' => [
                    // Per 1 kg products
                    ['name' => 'Ampalaya', 'price' => 59, 'unit' => 'kg'],
                    ['name' => 'Kalabasa', 'price' => 22, 'unit' => 'kg'],
                    ['name' => 'Sitaw', 'price' => 78, 'unit' => 'kg'],
                    ['name' => 'Talong', 'price' => 59, 'unit' => 'kg'],
                    ['name' => 'Pipino', 'price' => 39, 'unit' => 'kg'],
                    ['name' => 'Pechay', 'price' => 72, 'unit' => 'kg'],
                    ['name' => 'Siling Labuyo', 'price' => 104, 'unit' => 'kg'],
                    ['name' => 'Siling Haba', 'price' => 78, 'unit' => 'kg'],
                    ['name' => 'Kamatis', 'price' => 52, 'unit' => 'kg'],
                    ['name' => 'Pakwan', 'price' => 52, 'unit' => 'kg'],
                    ['name' => 'Mais', 'price' => 17, 'unit' => 'kg'],
                    // Per 1 tali products
                    ['name' => 'Tanglad', 'price' => 8, 'unit' => 'tali'],
                    ['name' => 'Talbos ng Kamote', 'price' => 8, 'unit' => 'tali'],
                    ['name' => 'Alugbati', 'price' => 8, 'unit' => 'tali'],
                    ['name' => 'Kangkong', 'price' => 8, 'unit' => 'tali'],
                ]
            ],
            // June 2, 2025
            [
                'date' => '2025-06-02',
                'products' => [
                    // Per 1 kg products
                    ['name' => 'Ampalaya', 'price' => 59, 'unit' => 'kg'],
                    ['name' => 'Kalabasa', 'price' => 22, 'unit' => 'kg'],
                    ['name' => 'Sitaw', 'price' => 104, 'unit' => 'kg'],
                    ['name' => 'Talong', 'price' => 46, 'unit' => 'kg'],
                    ['name' => 'Pipino', 'price' => 39, 'unit' => 'kg'],
                    ['name' => 'Pechay', 'price' => 72, 'unit' => 'kg'],
                    ['name' => 'Siling Labuyo', 'price' => 104, 'unit' => 'kg'],
                    ['name' => 'Siling Haba', 'price' => 78, 'unit' => 'kg'],
                    ['name' => 'Kamatis', 'price' => 52, 'unit' => 'kg'],
                    ['name' => 'Pakwan', 'price' => 52, 'unit' => 'kg'],
                    ['name' => 'Mais', 'price' => 17, 'unit' => 'kg'],
                    // Per 1 tali products
                    ['name' => 'Tanglad', 'price' => 8, 'unit' => 'tali'],
                    ['name' => 'Talbos ng Kamote', 'price' => 8, 'unit' => 'tali'],
                    ['name' => 'Alugbati', 'price' => 8, 'unit' => 'tali'],
                    ['name' => 'Kangkong', 'price' => 8, 'unit' => 'tali'],
                ]
            ],
            // June 3, 2025
            [
                'date' => '2025-06-03',
                'products' => [
                    // Per 1 kg products
                    ['name' => 'Ampalaya', 'price' => 59, 'unit' => 'kg'],
                    ['name' => 'Kalabasa', 'price' => 22, 'unit' => 'kg'],
                    ['name' => 'Sitaw', 'price' => 104, 'unit' => 'kg'],
                    ['name' => 'Talong', 'price' => 46, 'unit' => 'kg'],
                    ['name' => 'Pipino', 'price' => 39, 'unit' => 'kg'],
                    ['name' => 'Pechay', 'price' => 72, 'unit' => 'kg'],
                    ['name' => 'Siling Labuyo', 'price' => 104, 'unit' => 'kg'],
                    ['name' => 'Siling Haba', 'price' => 78, 'unit' => 'kg'],
                    ['name' => 'Kamatis', 'price' => 52, 'unit' => 'kg'],
                    ['name' => 'Pakwan', 'price' => 52, 'unit' => 'kg'],
                    ['name' => 'Mais', 'price' => 17, 'unit' => 'kg'],
                    // Per 1 tali products
                    ['name' => 'Tanglad', 'price' => 8, 'unit' => 'tali'],
                    ['name' => 'Talbos ng Kamote', 'price' => 8, 'unit' => 'tali'],
                    ['name' => 'Alugbati', 'price' => 8, 'unit' => 'tali'],
                    ['name' => 'Kangkong', 'price' => 8, 'unit' => 'tali'],
                ]
            ],
            // June 4, 2025
            [
                'date' => '2025-06-04',
                'products' => [
                    // Per 1 kg products
                    ['name' => 'Ampalaya', 'price' => 59, 'unit' => 'kg'],
                    ['name' => 'Kalabasa', 'price' => 22, 'unit' => 'kg'],
                    ['name' => 'Sitaw', 'price' => 117, 'unit' => 'kg'],
                    ['name' => 'Talong', 'price' => 46, 'unit' => 'kg'],
                    ['name' => 'Pipino', 'price' => 39, 'unit' => 'kg'],
                    ['name' => 'Pechay', 'price' => 72, 'unit' => 'kg'],
                    ['name' => 'Siling Labuyo', 'price' => 78, 'unit' => 'kg'],
                    ['name' => 'Siling Haba', 'price' => 65, 'unit' => 'kg'],
                    ['name' => 'Kamatis', 'price' => 52, 'unit' => 'kg'],
                    ['name' => 'Pakwan', 'price' => 52, 'unit' => 'kg'],
                    ['name' => 'Mais', 'price' => 17, 'unit' => 'kg'],
                    // Per 1 tali products
                    ['name' => 'Tanglad', 'price' => 8, 'unit' => 'tali'],
                    ['name' => 'Talbos ng Kamote', 'price' => 8, 'unit' => 'tali'],
                    ['name' => 'Alugbati', 'price' => 8, 'unit' => 'tali'],
                    ['name' => 'Kangkong', 'price' => 8, 'unit' => 'tali'],
                ]
            ],
            // June 5, 2025
            [
                'date' => '2025-06-05',
                'products' => [
                    // Per 1 kg products
                    ['name' => 'Ampalaya', 'price' => 65, 'unit' => 'kg'],
                    ['name' => 'Kalabasa', 'price' => 22, 'unit' => 'kg'],
                    ['name' => 'Sitaw', 'price' => 117, 'unit' => 'kg'],
                    ['name' => 'Talong', 'price' => 46, 'unit' => 'kg'],
                    ['name' => 'Pipino', 'price' => 39, 'unit' => 'kg'],
                    ['name' => 'Pechay', 'price' => 72, 'unit' => 'kg'],
                    ['name' => 'Siling Labuyo', 'price' => 78, 'unit' => 'kg'],
                    ['name' => 'Siling Haba', 'price' => 65, 'unit' => 'kg'],
                    ['name' => 'Kamatis', 'price' => 52, 'unit' => 'kg'],
                    ['name' => 'Pakwan', 'price' => 52, 'unit' => 'kg'],
                    ['name' => 'Mais', 'price' => 17, 'unit' => 'kg'],
                    // Per 1 tali products
                    ['name' => 'Tanglad', 'price' => 8, 'unit' => 'tali'],
                    ['name' => 'Talbos ng Kamote', 'price' => 8, 'unit' => 'tali'],
                    ['name' => 'Alugbati', 'price' => 8, 'unit' => 'tali'],
                    ['name' => 'Kangkong', 'price' => 8, 'unit' => 'tali'],
                ]
            ],
        ];

        foreach ($priceData as $dayData) {
            foreach ($dayData['products'] as $product) {
                PriceTrend::create([
                    'product_name' => $product['name'],
                    'date' => $dayData['date'],
                    'price_per_kg' => $product['unit'] === 'kg' ? $product['price'] : null,
                    'price_per_tali' => $product['unit'] === 'tali' ? $product['price'] : null,
                    'unit_type' => $product['unit'],
                ]);
            }
        }
    }
}