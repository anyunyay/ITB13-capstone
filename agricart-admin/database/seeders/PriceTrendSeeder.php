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
                    ['name' => 'Sample Repetitive Data', 'price' => 40, 'unit' => 'kg'],
                    // Per 1 tali products
                    ['name' => 'Tanglad', 'price' => 8, 'unit' => 'tali'],
                    ['name' => 'Talbos ng Kamote', 'price' => 8, 'unit' => 'tali'],
                    ['name' => 'Alugbati', 'price' => 8, 'unit' => 'tali'],
                    ['name' => 'Kangkong', 'price' => 8, 'unit' => 'tali'],
                    ['name' => 'Sample Repetitive Data', 'price' => 20, 'unit' => 'tali'],
                    // Per 1 pc products
                    ['name' => 'Pakwan', 'price' => 52, 'unit' => 'pc'],
                    ['name' => 'Mais', 'price' => 17, 'unit' => 'pc'],
                    ['name' => 'Sample Repetitive Data', 'price' => 10, 'unit' => 'pc'],
                ]
            ],
            // June 2, 2025
            [
                'date' => '2025-06-02',
                'products' => [
                    // Per 1 kg products
                    ['name' => 'Sitaw', 'price' => 104, 'unit' => 'kg'],
                    ['name' => 'Talong', 'price' => 46, 'unit' => 'kg'],
                ]
            ],
            // June 3, 2025
            [
                'date' => '2025-06-03',
                'products' => [
                    // No specific goods or prices listed for this date
                ]
            ],
            // June 4, 2025
            [
                'date' => '2025-06-04',
                'products' => [
                    // Per 1 kg products
                    ['name' => 'Sitaw', 'price' => 117, 'unit' => 'kg'],
                    ['name' => 'Siling Labuyo', 'price' => 78, 'unit' => 'kg'],
                    ['name' => 'Siling Haba', 'price' => 65, 'unit' => 'kg'],
                ]
            ],
            // June 5, 2025
            [
                'date' => '2025-06-05',
                'products' => [
                    // Per 1 kg products
                    ['name' => 'Ampalaya', 'price' => 65, 'unit' => 'kg'],
                ]
            ],
            // June 6, 2025
            [
                'date' => '2025-06-06',
                'products' => [
                    // No specific goods or prices listed for this date
                    ['name' => 'Sample Repetitive Data', 'price' => 30, 'unit' => 'kg'],
                    ['name' => 'Sample Repetitive Data', 'price' => 25, 'unit' => 'tali'],
                    ['name' => 'Sample Repetitive Data', 'price' => 20, 'unit' => 'pc'],
                ]
            ],
            // June 7, 2025
            [
                'date' => '2025-06-07',
                'products' => [
                    // Per 1 kg products
                    ['name' => 'Ampalaya', 'price' => 78, 'unit' => 'kg'],
                    ['name' => 'Talong', 'price' => 52, 'unit' => 'kg'],
                    ['name' => 'Pechay', 'price' => 65, 'unit' => 'kg'],
                    ['name' => 'Siling Labuyo', 'price' => 65, 'unit' => 'kg'],
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
                    'price_per_pc' => $product['unit'] === 'pc' ? $product['price'] : null,
                    'unit_type' => $product['unit'],
                ]);
            }
        }
    }
}