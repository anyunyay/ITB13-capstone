<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductPriceHistory;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing products and related data
        // Use delete instead of truncate to handle foreign key constraints
        ProductPriceHistory::query()->delete();
        Product::query()->delete();

        $products = [
            // Per 1 kg products
            [
                'name' => 'Ampalaya',
                'price_kilo' => 75.00,
                'produce_type' => 'vegetable',
                'description' => 'Bitter gourd, a nutritious vegetable rich in vitamins and minerals.'
            ],
            [
                'name' => 'Kalabasa',
                'price_kilo' => 15.00,
                'produce_type' => 'vegetable',
                'description' => 'Squash, a versatile vegetable perfect for soups and stews.'
            ],
            [
                'name' => 'Sitaw',
                'price_kilo' => 70.00,
                'produce_type' => 'vegetable',
                'description' => 'String beans, a popular green vegetable rich in fiber.'
            ],
            [
                'name' => 'Talong',
                'price_kilo' => 70.00,
                'produce_type' => 'vegetable',
                'description' => 'Eggplant, a versatile vegetable used in many Filipino dishes.'
            ],
            [
                'name' => 'Pipino',
                'price_kilo' => 30.00,
                'produce_type' => 'vegetable',
                'description' => 'Cucumber, a refreshing vegetable perfect for salads.'
            ],
            [
                'name' => 'Pechay',
                'price_kilo' => 50.00,
                'produce_type' => 'vegetable',
                'description' => 'Chinese cabbage, a leafy green vegetable rich in nutrients.'
            ],
            [
                'name' => 'Siling Haba',
                'price_kilo' => 80.00,
                'produce_type' => 'vegetable',
                'description' => 'Long chili pepper, adds spice and flavor to dishes.'
            ],
            [
                'name' => 'Siling Labuyo',
                'price_kilo' => 65.00,
                'produce_type' => 'vegetable',
                'description' => 'Bird\'s eye chili, a very spicy pepper used for heat.'
            ],
            [
                'name' => 'Kamatis',
                'price_kilo' => 52.00,
                'produce_type' => 'vegetable',
                'description' => 'Tomato, a versatile fruit used as a vegetable in cooking.'
            ],
            
            // Per 1 tali products
            [
                'name' => 'Tanglad',
                'price_tali' => 8.00,
                'produce_type' => 'vegetable',
                'description' => 'Lemongrass, aromatic herb used for flavoring soups and teas.'
            ],
            [
                'name' => 'Talbos ng Kamote',
                'price_tali' => 8.00,
                'produce_type' => 'vegetable',
                'description' => 'Sweet potato leaves, nutritious leafy green vegetable.'
            ],
            [
                'name' => 'Alugbati',
                'price_tali' => 8.00,
                'produce_type' => 'vegetable',
                'description' => 'Malabar spinach, a leafy green vegetable rich in vitamins.'
            ],
            [
                'name' => 'Kangkong',
                'price_tali' => 8.00,
                'produce_type' => 'vegetable',
                'description' => 'Water spinach, a popular leafy green vegetable in Filipino cuisine.'
            ],
            
            // Per 1 pc products
            [
                'name' => 'Pakwan',
                'price_pc' => 52.00,
                'produce_type' => 'fruit',
                'description' => 'Watermelon, a refreshing summer fruit perfect for hot days.'
            ],
            [
                'name' => 'Mais',
                'price_pc' => 17.00,
                'produce_type' => 'vegetable',
                'description' => 'Corn, a versatile vegetable that can be boiled, grilled, or used in various dishes.'
            ]
        ];

        $currentDate = Carbon::now();

        foreach ($products as $productData) {
            // Create the product
            $product = Product::create($productData);

            // Create price history record with current date
            ProductPriceHistory::create([
                'product_id' => $product->id,
                'price_kilo' => $productData['price_kilo'] ?? null,
                'price_pc' => $productData['price_pc'] ?? null,
                'price_tali' => $productData['price_tali'] ?? null,
                'created_at' => $currentDate,
                'updated_at' => $currentDate
            ]);
        }
    }
}
