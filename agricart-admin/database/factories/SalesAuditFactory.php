<?php

namespace Database\Factories;

use App\Models\SalesAudit;
use App\Models\User;
use App\Models\UserAddress;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SalesAudit>
 */
class SalesAuditFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $customer = User::where('type', 'customer')->inRandomOrder()->first() ?? User::factory()->create(['type' => 'customer']);
        $address = UserAddress::where('user_id', $customer->id)->where('is_active', true)->first() ?? UserAddress::factory()->create(['user_id' => $customer->id, 'is_active' => true]);
        
        return [
            'customer_id' => $customer->id,
            'admin_id' => User::where('type', 'admin')->inRandomOrder()->first()?->id ?? User::factory()->create(['type' => 'admin'])->id,
            'logistic_id' => null,
            'total_amount' => $this->faker->randomFloat(2, 100, 1000),
            'status' => $this->faker->randomElement(['pending', 'approved', 'rejected']),
            'delivery_status' => $this->faker->randomElement(['pending', 'out_for_delivery', 'delivered']),
            'admin_notes' => $this->faker->optional()->sentence(),
            'address_id' => $address->id,
            'is_urgent' => $this->faker->boolean(20), // 20% chance of being urgent
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
