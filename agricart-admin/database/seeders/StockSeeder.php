<?php

namespace Database\Seeders;

use App\Models\Stock;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class StockSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing stocks
        Stock::query()->delete();

        // Get all products
        $products = Product::all();
        
        // Get a member user for stock assignment
        $member = User::where('type', 'member')->first();

        foreach ($products as $product) {
            // Determine the category based on which price field is set
            $category = null;
            if (!is_null($product->price_kilo)) {
                $category = 'Kilo';
            } elseif (!is_null($product->price_pc)) {
                $category = 'Pc';
            } elseif (!is_null($product->price_tali)) {
                $category = 'Tali';
            }

            // Skip if no category can be determined
            if (!$category) {
                continue;
            }

            // Create stock for this product
            Stock::create([
                'product_id' => $product->id,
                'member_id' => $member->id,
                'quantity' => $this->getQuantityForCategory($category),
                'sold_quantity' => 0,
                'initial_quantity' => $this->getQuantityForCategory($category),
                'category' => $category,
                'removed_at' => null,
                'notes' => null,
            ]);
        }

        // Create some removed stocks for testing
        $removedProducts = $products->take(3);
        foreach ($removedProducts as $product) {
            $category = null;
            if (!is_null($product->price_kilo)) {
                $category = 'Kilo';
            } elseif (!is_null($product->price_pc)) {
                $category = 'Pc';
            } elseif (!is_null($product->price_tali)) {
                $category = 'Tali';
            }

            if ($category) {
                Stock::create([
                    'product_id' => $product->id,
                    'member_id' => $member->id,
                    'quantity' => 0,
                    'sold_quantity' => 0,
                    'initial_quantity' => 0,
                    'category' => $category,
                    'removed_at' => now()->subDays(rand(1, 30)),
                    'notes' => 'Stock removed for testing purposes',
                ]);
            }
        }
    }

    /**
     * Get appropriate quantity based on category
     */
    private function getQuantityForCategory(string $category): float
    {
        switch ($category) {
            case 'Kilo':
                return rand(5, 20); // 5-20 kg
            case 'Pc':
                return rand(10, 50); // 10-50 pieces
            case 'Tali':
                return rand(20, 100); // 20-100 tali
            default:
                return rand(1, 10);
        }
    }
}
