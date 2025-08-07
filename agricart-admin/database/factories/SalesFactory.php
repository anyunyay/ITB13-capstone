<?php

namespace Database\Factories;

use App\Models\Sales;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Sales>
 */
class SalesFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'customer_id' => User::where('type', 'customer')->inRandomOrder()->first()?->id ?? User::factory()->create(['type' => 'customer'])->id,
            'admin_id' => User::where('type', 'admin')->inRandomOrder()->first()?->id ?? User::factory()->create(['type' => 'admin'])->id,
            'logistic_id' => null,
            'total_amount' => $this->faker->randomFloat(2, 100, 1000),
            'status' => $this->faker->randomElement(['pending', 'approved', 'rejected']),
            'delivery_status' => $this->faker->randomElement(['pending', 'out_for_delivery', 'delivered']),
            'admin_notes' => $this->faker->optional()->sentence(),
        ];
    }

    /**
     * Indicate that the order is pending.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'delivery_status' => null,
        ]);
    }

    /**
     * Indicate that the order is approved.
     */
    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'approved',
            'delivery_status' => 'pending',
        ]);
    }

    /**
     * Indicate that the order is rejected.
     */
    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'rejected',
            'delivery_status' => null,
        ]);
    }
} 