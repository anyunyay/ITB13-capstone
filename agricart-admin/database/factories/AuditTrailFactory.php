<?php

namespace Database\Factories;

use App\Models\AuditTrail;
use App\Models\Sales;
use App\Models\Product;
use App\Models\Stock;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AuditTrail>
 */
class AuditTrailFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'sale_id' => Sales::factory(),
            'product_id' => Product::factory(),
            'stock_id' => Stock::factory(),
            'category' => $this->faker->randomElement(['Kilo', 'Pc', 'Tali']),
            'quantity' => $this->faker->numberBetween(1, 10),
        ];
    }
}