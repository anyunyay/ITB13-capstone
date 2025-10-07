<?php

namespace Tests\Feature\Customer;

use App\Models\User;
use App\Models\AppearanceSettings;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Database\Seeders\RoleSeeder;

class AppearanceSettingsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleSeeder::class);
    }

    public function test_customer_can_view_appearance_settings_page()
    {
        $user = User::factory()->create(['type' => 'customer']);
        $user->assignRole('customer');
        $user->givePermissionTo('access customer features');

        $response = $this->actingAs($user)->get('/customer/profile/appearance');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Customer/Profile/appearance')
            ->has('user')
        );
    }

    public function test_appearance_settings_are_created_automatically_for_new_user()
    {
        $user = User::factory()->create(['type' => 'customer']);
        $user->assignRole('customer');
        $user->givePermissionTo('access customer features');

        // Initially no appearance settings should exist
        $this->assertDatabaseMissing('appearance_settings', ['user_id' => $user->id]);

        // Visit the appearance page
        $this->actingAs($user)->get('/customer/profile/appearance');

        // Appearance settings should be created automatically
        $this->assertDatabaseHas('appearance_settings', [
            'user_id' => $user->id,
            'theme' => 'system',
            'language' => 'en',
        ]);
    }

    public function test_customer_can_update_appearance_settings()
    {
        $user = User::factory()->create(['type' => 'customer']);
        $user->assignRole('customer');
        $user->givePermissionTo('access customer features');

        $appearanceSettings = AppearanceSettings::getForUser($user->id);

        $updateData = [
            'theme' => 'dark',
            'language' => 'fil',
            'notifications' => [
                'email' => true,
                'push' => false,
                'sms' => true,
            ],
        ];

        $response = $this->actingAs($user)->patch('/customer/profile/appearance', $updateData);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $appearanceSettings->refresh();
        $this->assertEquals('dark', $appearanceSettings->theme);
        $this->assertEquals('fil', $appearanceSettings->language);
        $this->assertEquals([
            'email' => true,
            'push' => false,
            'sms' => true,
        ], $appearanceSettings->notifications);
    }

    public function test_appearance_settings_validation_works_correctly()
    {
        $user = User::factory()->create(['type' => 'customer']);
        $user->assignRole('customer');
        $user->givePermissionTo('access customer features');

        // Test invalid theme
        $response = $this->actingAs($user)->patch('/customer/profile/appearance', [
            'theme' => 'invalid',
            'language' => 'en',
            'notifications' => ['email' => true, 'push' => true, 'sms' => false],
        ]);

        $response->assertSessionHasErrors(['theme']);

        // Test invalid language
        $response = $this->actingAs($user)->patch('/customer/profile/appearance', [
            'theme' => 'light',
            'language' => 'invalid',
            'notifications' => ['email' => true, 'push' => true, 'sms' => false],
        ]);

        $response->assertSessionHasErrors(['language']);

        // Test missing notifications
        $response = $this->actingAs($user)->patch('/customer/profile/appearance', [
            'theme' => 'light',
            'language' => 'en',
        ]);

        $response->assertSessionHasErrors(['notifications']);
    }

    public function test_appearance_settings_model_methods_work_correctly()
    {
        $user = User::factory()->create(['type' => 'customer']);

        // Test getForUser creates default settings
        $settings = AppearanceSettings::getForUser($user->id);
        $this->assertEquals('system', $settings->theme);
        $this->assertEquals('en', $settings->language);
        $this->assertEquals([
            'email' => true,
            'push' => true,
            'sms' => false,
        ], $settings->notifications);

        // Test getForUser returns existing settings
        $settings2 = AppearanceSettings::getForUser($user->id);
        $this->assertEquals($settings->id, $settings2->id);

        // Test default notifications
        $defaultNotifications = AppearanceSettings::getDefaultNotifications();
        $this->assertEquals([
            'email' => true,
            'push' => true,
            'sms' => false,
        ], $defaultNotifications);
    }

    public function test_user_relationship_with_appearance_settings_works()
    {
        $user = User::factory()->create(['type' => 'customer']);
        $appearanceSettings = AppearanceSettings::getForUser($user->id);

        $this->assertEquals($user->id, $appearanceSettings->user->id);
        $this->assertInstanceOf(User::class, $appearanceSettings->user);
    }
}
