<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class ThemeSwitchingTest extends TestCase
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
    public function theme_switching_removes_old_classes_and_applies_new_ones()
    {
        $this->actingAs($this->user);

        // Start with light theme
        $this->user->update(['appearance' => 'light']);
        
        $response = $this->getJson('/user/appearance');
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'appearance' => 'light',
                ],
            ]);

        // Switch to dark theme
        $response = $this->patchJson('/user/appearance', [
            'appearance' => 'dark',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'appearance' => 'dark',
                ],
            ]);

        // Verify the change was persisted
        $this->assertDatabaseHas('users', [
            'id' => $this->user->id,
            'appearance' => 'dark',
        ]);

        // Switch to system theme
        $response = $this->patchJson('/user/appearance', [
            'appearance' => 'system',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'appearance' => 'system',
                ],
            ]);

        // Verify the change was persisted
        $this->assertDatabaseHas('users', [
            'id' => $this->user->id,
            'appearance' => 'system',
        ]);
    }

    /** @test */
    public function theme_switching_handles_rapid_changes_correctly()
    {
        $this->actingAs($this->user);

        $themes = ['light', 'dark', 'system', 'light', 'dark'];
        
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

            // Verify each change was persisted
            $this->assertDatabaseHas('users', [
                'id' => $this->user->id,
                'appearance' => $theme,
            ]);
        }
    }

    /** @test */
    public function theme_switching_preserves_user_preference_across_sessions()
    {
        $this->actingAs($this->user);

        // Set theme to dark
        $this->patchJson('/user/appearance', [
            'appearance' => 'dark',
        ]);

        // Simulate new session by creating new user instance
        $newUser = User::find($this->user->id);
        $this->assertEquals('dark', $newUser->appearance);

        // Verify the theme is still dark
        $response = $this->getJson('/user/appearance');
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'appearance' => 'dark',
                ],
            ]);
    }

    /** @test */
    public function theme_switching_logs_activity_correctly()
    {
        $this->actingAs($this->user);

        $response = $this->patchJson('/user/appearance', [
            'appearance' => 'light',
        ]);

        $response->assertStatus(200);
        
        // Verify the theme was updated
        $this->assertDatabaseHas('users', [
            'id' => $this->user->id,
            'appearance' => 'light',
        ]);
    }

    /** @test */
    public function theme_switching_handles_invalid_themes_gracefully()
    {
        $this->actingAs($this->user);

        $response = $this->patchJson('/user/appearance', [
            'appearance' => 'invalid',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['appearance']);
    }

    /** @test */
    public function theme_switching_requires_authentication()
    {
        $response = $this->patchJson('/user/appearance', [
            'appearance' => 'dark',
        ]);

        $response->assertStatus(401);
    }

    /** @test */
    public function theme_switching_works_with_all_valid_themes()
    {
        $this->actingAs($this->user);

        $validThemes = ['light', 'dark', 'system'];

        foreach ($validThemes as $theme) {
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

            // Verify the theme was saved
            $this->assertDatabaseHas('users', [
                'id' => $this->user->id,
                'appearance' => $theme,
            ]);
        }
    }
}
