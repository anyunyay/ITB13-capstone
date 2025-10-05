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
            'name' => $this->faker->name(),
            'email' => $this->faker->unique()->safeEmail(),
            'password' => Hash::make('password'),
            'contact_number' => $this->faker->phoneNumber(),
            'email_verified_at' => now(),
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
            'email_verified_at' => now(), // Automatically verify email for admin
        ]);
    }

    public function customer()
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'customer',
            'name' => $this->faker->name(),
            'email' => 'customer@customer.com',
            'password' => Hash::make('12345678'),
            'province' => $this->faker->state(),
            'barangay' => $this->faker->city(),
            'city' => $this->faker->city(),
            'email_verified_at' => now(), // Automatically verify email for customers
        ]);
    }

    public function member()
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'member',
            'name' => $this->faker->name(),
            'address' => $this->faker->address(),
            'email' => $this->faker->unique()->safeEmail(),
            'registration_date' => $this->faker->dateTimeThisYear(),
            'document' => $this->faker->imageUrl(640, 480, 'member', true),
            'password' => Hash::make('password'),
            'email_verified_at' => now(), // Automatically verify email for members
        ]);
    }

    public function logistic()
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'logistic',
            'name' => $this->faker->name(),
            'address' => $this->faker->address(),
            'email' => $this->faker->unique()->safeEmail(),
            'registration_date' => $this->faker->dateTimeThisYear(),
            'password' => Hash::make('password'),
            'email_verified_at' => now(), // Automatically verify email for logistics
        ]);
    }

    public function staff()
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'staff',
            'name' => $this->faker->name(),
            'email' => $this->faker->unique()->safeEmail(),
            'password' => Hash::make('password'),
            'email_verified_at' => now(), // Automatically verify email for staff
        ]);
    }

    /**
     * Indicate that the model's email address is not verified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
} 