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
        
        // Get all members including the specific one with ID 2411000
        $members = User::where('type', 'member')->get();
        
        if ($members->isEmpty()) {
            $this->command->warn('No members found. Stock seeding skipped.');
            return;
        }

        $primaryMember = User::where('member_id', '2411000')->first();
        
        $this->command->info("Creating stocks for {$members->count()} members...");

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

            // Distribute stock across multiple members for realistic scenario
            // Primary member (2411000) gets more stock as the main supplier
            $membersForThisProduct = collect();
            
            if ($primaryMember) {
                // Primary member always gets stock
                $membersForThisProduct->push($primaryMember);
                
                // Add 1-2 other members randomly for some products
                if (rand(1, 3) === 1) { // 33% chance to add other members
                    $otherMembers = $members->where('id', '!=', $primaryMember->id)->random(rand(1, 2));
                    $membersForThisProduct = $membersForThisProduct->merge($otherMembers);
                }
            } else {
                // Fallback: assign to random members if primary not found
                $membersForThisProduct = $members->random(rand(1, 2));
            }

            foreach ($membersForThisProduct as $member) {
                $initialQuantity = $this->getRealisticQuantityForCategory($category, $product->name);
                
                // Primary member gets larger quantities, others get smaller
                if ($member->member_id === '2411000') {
                    $multiplier = 1.0;
                } else {
                    $multiplier = rand(60, 90) / 100; // 60-90% of primary member's quantity
                    $initialQuantity = (int)($initialQuantity * $multiplier);
                }
                
                if ($initialQuantity <= 0) continue;

                $soldQuantity = $this->getRealisticSoldQuantity($initialQuantity);

                // Create stock for this product with realistic quantities
                Stock::create([
                    'product_id' => $product->id,
                    'member_id' => $member->id,
                    'quantity' => max(0, $initialQuantity - $soldQuantity),
                    'sold_quantity' => $soldQuantity,
                    'initial_quantity' => $initialQuantity,
                    'category' => $category,
                    'removed_at' => null,
                    'notes' => null,
                ]);
            }
        }

        // Create some removed/exhausted stocks for realistic scenario
        $exhaustedProducts = $products->random(2); // Random 2 products are exhausted
        foreach ($exhaustedProducts as $product) {
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
                    'sold_quantity' => $this->getRealisticQuantityForCategory($category, $product->name),
                    'initial_quantity' => $this->getRealisticQuantityForCategory($category, $product->name),
                    'category' => $category,
                    'removed_at' => now()->subDays(rand(1, 7)), // Removed within last week
                    'notes' => 'Stock exhausted - sold out',
                ]);
            }
        }

        $this->command->info("Created realistic stock data for {$products->count()} products");
    }

    /**
     * Get realistic quantity based on category and product type
     */
    private function getRealisticQuantityForCategory(string $category, string $productName): float
    {
        switch ($category) {
            case 'Kilo':
                // Vegetables and fruits sold by kilo
                return match($productName) {
                    'Ampalaya', 'Talong' => rand(8, 15), // Popular vegetables, moderate quantities
                    'Kalabasa' => rand(12, 25), // Squash is usually available in larger quantities
                    'Sitaw', 'Pechay' => rand(6, 12), // Leafy vegetables, smaller quantities
                    'Pipino', 'Siling Haba', 'Siling Labuyo' => rand(4, 10), // Smaller items
                    'Kamatis' => rand(10, 20), // Tomatoes usually available in good quantities
                    default => rand(5, 15)
                };
            case 'Pc':
                // Items sold by piece (watermelon, corn)
                return match($productName) {
                    'Pakwan' => rand(15, 30), // Watermelons in moderate quantities
                    'Mais' => rand(25, 50), // Corn usually available in larger quantities
                    default => rand(10, 30)
                };
            case 'Tali':
                // Leafy vegetables and herbs sold by tali/bundle
                return match($productName) {
                    'Tanglad', 'Talbos ng Kamote', 'Alugbati' => rand(30, 80), // Herbs and leafy greens in bundles
                    'Kangkong' => rand(40, 100), // Popular leafy vegetable, usually more available
                    default => rand(20, 60)
                };
            default:
                return rand(1, 10);
        }
    }

    /**
     * Get realistic sold quantity based on initial quantity (simulates partial sales)
     */
    private function getRealisticSoldQuantity(float $initialQuantity): float
    {
        // Most products have some sales activity, but not completely sold out
        $salesPercentage = rand(10, 60); // 10-60% of stock has been sold
        return floor(($initialQuantity * $salesPercentage) / 100);
    }

    /**
     * Legacy method - kept for backward compatibility
     */
    private function getQuantityForCategory(string $category): float
    {
        switch ($category) {
            case 'Kilo':
                return rand(5, 20);
            case 'Pc':
                return rand(10, 50);
            case 'Tali':
                return rand(20, 100);
            default:
                return rand(1, 10);
        }
    }
}
