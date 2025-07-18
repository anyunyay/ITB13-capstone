<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    public function definition(): array
    {
        return [
            'contact_number' => $this->faker->phoneNumber(),
            'email' => $this->faker->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'remember_token' => Str::random(10),
            'type' => 'customer', // default type
        ];
    }

    public function admin()
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'admin',
            'name' => 'Admin',
            'email' => 'admin@admin.com',
            'password' => Hash::make('12345678'),
        ]);
    }

    public function customer()
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'customer',
            'firstname' => $this->faker->firstName(),
            'lastname' => $this->faker->lastName(),
            'username' => $this->faker->unique()->userName(),
            'password' => Hash::make('password'),
            'province' => $this->faker->state(),
            'barangay' => $this->faker->city(),
            'city' => $this->faker->city(),
        ]);
    }

    public function member()
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'member',
            'name' => $this->faker->name(),
            'address' => $this->faker->address(),
            'registration_date' => $this->faker->dateTimeThisYear(),
            'document' => $this->faker->imageUrl(640, 480, 'member', true),
            'password' => Hash::make('password'),
        ]);
    }

    public function logistic()
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'logistic',
            'name' => $this->faker->name(),
            'address' => $this->faker->address(),
            'registration_date' => $this->faker->dateTimeThisYear(),
            'password' => Hash::make('password'),
        ]);
    }
} 