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
            'price' => $this->faker->randomFloat(2, 1, 1000),
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
