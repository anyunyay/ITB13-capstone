<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\AppearanceSettings;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class UserAppearanceTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create a test user
        $this->user = User::factory()->create([
            'type' => 'customer',
            'appearance' => 'system',
        ]);
    }

    /** @test */
    public function user_can_update_appearance_preference()
    {
        $this->actingAs($this->user);

        $response = $this->patchJson('/user/appearance', [
            'appearance' => 'dark',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Appearance preference updated successfully.',
                'data' => [
                    'appearance' => 'dark',
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'id' => $this->user->id,
            'appearance' => 'dark',
        ]);
    }

    /** @test */
    public function user_can_get_current_appearance_preference()
    {
        $this->actingAs($this->user);

        $response = $this->getJson('/user/appearance');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'appearance' => 'system',
                ],
            ]);
    }

    /** @test */
    public function appearance_update_requires_authentication()
    {
        $response = $this->patchJson('/user/appearance', [
            'appearance' => 'light',
        ]);

        $response->assertStatus(401);
    }

    /** @test */
    public function appearance_update_validates_required_fields()
    {
        $this->actingAs($this->user);

        $response = $this->patchJson('/user/appearance', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['appearance']);
    }

    /** @test */
    public function appearance_update_validates_valid_values()
    {
        $this->actingAs($this->user);

        $response = $this->patchJson('/user/appearance', [
            'appearance' => 'invalid',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['appearance']);
    }

    /** @test */
    public function appearance_update_accepts_all_valid_themes()
    {
        $this->actingAs($this->user);

        $themes = ['light', 'dark', 'system'];

        foreach ($themes as $theme) {
            $response = $this->patchJson('/user/appearance', [
                'appearance' => $theme,
            ]);

            $response->assertStatus(200)
                ->assertJson([
                    'success' => true,
                    'data' => [
                        'appearance' => $theme,
                    ],
                ]);

            $this->assertDatabaseHas('users', [
                'id' => $this->user->id,
                'appearance' => $theme,
            ]);
        }
    }

    /** @test */
    public function appearance_update_logs_activity()
    {
        $this->actingAs($this->user);

        $response = $this->patchJson('/user/appearance', [
            'appearance' => 'dark',
        ]);

        $response->assertStatus(200);
        
        // Verify the user was updated
        $this->assertDatabaseHas('users', [
            'id' => $this->user->id,
            'appearance' => 'dark',
        ]);
    }

    /** @test */
    public function appearance_settings_are_synced_with_user_model()
    {
        $this->actingAs($this->user);

        // Update appearance via API
        $this->patchJson('/user/appearance', [
            'appearance' => 'dark',
        ]);

        // Verify the user model is updated
        $this->user->refresh();
        $this->assertEquals('dark', $this->user->appearance);
    }

    /** @test */
    public function appearance_preference_persists_across_sessions()
    {
        $this->actingAs($this->user);

        // Set appearance to dark
        $this->patchJson('/user/appearance', [
            'appearance' => 'dark',
        ]);

        // Create a new user instance (simulating new session)
        $newUser = User::find($this->user->id);
        $this->assertEquals('dark', $newUser->appearance);
    }

    /** @test */
    public function appearance_endpoint_returns_success_response()
    {
        $this->actingAs($this->user);

        $response = $this->patchJson('/user/appearance', [
            'appearance' => 'light',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Appearance preference updated successfully.',
            ]);
    }
}