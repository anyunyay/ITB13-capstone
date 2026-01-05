<?php

namespace Database\Factories;

use App\Models\Sales;
use App\Models\SalesAudit;
use App\Models\User;
use App\Models\UserAddress;
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
        $customer = User::where('type', 'customer')->inRandomOrder()->first() ?? User::factory()->create(['type' => 'customer']);
        $salesAudit = SalesAudit::inRandomOrder()->first() ?? SalesAudit::factory()->create();
        
        return [
            'customer_id' => $customer->id,
            'total_amount' => $this->faker->randomFloat(2, 100, 1000),
            'delivery_address' => $this->faker->streetAddress . ', ' . $this->faker->city . ', ' . $this->faker->state,
            'admin_id' => User::where('type', 'admin')->inRandomOrder()->first()?->id ?? User::factory()->create(['type' => 'admin'])->id,
            'admin_notes' => $this->faker->optional()->sentence(),
            'logistic_id' => User::where('type', 'logistic')->inRandomOrder()->first()?->id ?? User::factory()->create(['type' => 'logistic'])->id,
            'sales_audit_id' => $salesAudit->id,
            'delivered_at' => $this->faker->dateTimeBetween('-30 days', 'now'),
        ];
    }
} 