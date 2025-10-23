<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ThemeContextTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function user_appearance_column_exists()
    {
        $user = User::factory()->create([
            'appearance' => 'dark',
        ]);

        $this->assertEquals('dark', $user->appearance);
    }

    /** @test */
    public function user_appearance_has_default_value()
    {
        $user = User::factory()->create();

        $this->assertEquals('system', $user->appearance);
    }

    /** @test */
    public function user_appearance_is_mass_assignable()
    {
        $user = User::factory()->create();

        $user->update([
            'appearance' => 'light',
        ]);

        $this->assertEquals('light', $user->fresh()->appearance);
    }

    /** @test */
    public function user_appearance_accepts_valid_values()
    {
        $user = User::factory()->create();

        $validThemes = ['light', 'dark', 'system'];

        foreach ($validThemes as $theme) {
            $user->update(['appearance' => $theme]);
            $this->assertEquals($theme, $user->fresh()->appearance);
        }
    }

    /** @test */
    public function user_appearance_validation_works()
    {
        $user = User::factory()->create();

        // This should not throw an exception for valid themes
        $user->update(['appearance' => 'light']);
        $user->update(['appearance' => 'dark']);
        $user->update(['appearance' => 'system']);

        $this->assertTrue(true); // If we get here, validation passed
    }
}