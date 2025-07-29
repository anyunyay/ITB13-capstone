<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->unique()->word(),
            'price_kilo' => $this->faker->randomFloat(2, 50, 500),
            'price_pc' => $this->faker->randomFloat(2, 10, 100),
            'price_tali' => $this->faker->randomFloat(2, 20, 200),
            'produce_type' => $this->faker->randomElement(['fruit', 'vegetable']),
            'description' => $this->faker->sentence(3),
            'image' => $this->faker->imageUrl(640, 480, 'product', true),
        ];
    }

    public function archived()
    {
        return $this->state(function (array $attributes) {
            return [
                'archived_at' => $this->faker->dateTimeBetween('-1 year', 'now'),
            ];
        });
    }
}
