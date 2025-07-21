<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\Member;
use App\Models\SellCategory;
use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Stock>
 */
class StockFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'product_id' => Product::inRandomOrder()->first()->id,
            'quantity' => $this->faker->numberBetween(0.25, 10.00),
            'member_id' => User::where('type', 'member')->inRandomOrder()->first()->id,
            'sell_category_id' => SellCategory::inRandomOrder()->first()->id,
        ];
    }
}
