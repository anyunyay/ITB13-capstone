<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\UserAddress>
 */
class UserAddressFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'street' => $this->faker->streetAddress,
            'barangay' => $this->faker->city,
            'city' => $this->faker->city,
            'province' => $this->faker->state,
            'is_active' => true,
        ];
    }
}