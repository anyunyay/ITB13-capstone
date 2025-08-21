<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\Member;
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
            'quantity' => $this->faker->numberBetween(1, 10.00),
            'member_id' => User::where('type', 'member')->inRandomOrder()->first()?->id ?? User::factory()->create(['type' => 'member'])->id,
            'category' => $this->faker->randomElement(['Kilo', 'Pc', 'Tali']),
            'last_customer_id' => null,
            'removed_at' => null,
            'notes' => null,
        ];
    }

    /**
     * Indicate that the stock is removed.
     */
    public function removed(string $notes = null): static
    {
        return $this->state(fn (array $attributes) => [
            'removed_at' => $this->faker->dateTimeBetween('-1 month', 'now'),
            'notes' => $notes ?? $this->faker->sentence(),
            'status' => 'removed',
        ]);
    }
}
