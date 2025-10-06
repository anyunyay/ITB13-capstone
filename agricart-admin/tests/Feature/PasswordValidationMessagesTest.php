<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class PasswordValidationMessagesTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    /**
     * Test that password validation shows specific error messages for missing requirements.
     */
    public function test_password_validation_shows_specific_error_messages()
    {
        // Test password that's too short
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'short',
            'password_confirmation' => 'short',
            'contact_number' => '09123456789',
            'address' => 'Test Address',
            'barangay' => 'Sala',
            'city' => 'Cabuyao',
            'province' => 'Laguna',
        ]);

        $response->assertSessionHasErrors(['password']);
        $errors = session('errors')->get('password');
        $this->assertTrue(collect($errors)->some(fn($error) => str_contains($error, '8 characters')));
    }

    /**
     * Test that password validation shows error for missing uppercase letters.
     */
    public function test_password_validation_shows_uppercase_error()
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'contact_number' => '09123456789',
            'address' => 'Test Address',
            'barangay' => 'Sala',
            'city' => 'Cabuyao',
            'province' => 'Laguna',
        ]);

        $response->assertSessionHasErrors(['password']);
        $errors = session('errors')->get('password');
        $this->assertTrue(collect($errors)->some(fn($error) => str_contains($error, 'uppercase')));
    }

    /**
     * Test that password validation shows error for missing lowercase letters.
     */
    public function test_password_validation_shows_lowercase_error()
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'PASSWORD123',
            'password_confirmation' => 'PASSWORD123',
            'contact_number' => '09123456789',
            'address' => 'Test Address',
            'barangay' => 'Sala',
            'city' => 'Cabuyao',
            'province' => 'Laguna',
        ]);

        $response->assertSessionHasErrors(['password']);
        $errors = session('errors')->get('password');
        $this->assertTrue(collect($errors)->some(fn($error) => str_contains($error, 'lowercase')));
    }

    /**
     * Test that password validation shows error for missing numbers.
     */
    public function test_password_validation_shows_numbers_error()
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Password',
            'password_confirmation' => 'Password',
            'contact_number' => '09123456789',
            'address' => 'Test Address',
            'barangay' => 'Sala',
            'city' => 'Cabuyao',
            'province' => 'Laguna',
        ]);

        $response->assertSessionHasErrors(['password']);
        $errors = session('errors')->get('password');
        $this->assertTrue(collect($errors)->some(fn($error) => str_contains($error, 'number')));
    }

    /**
     * Test that password validation shows error for missing symbols.
     */
    public function test_password_validation_shows_symbols_error()
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Password123',
            'password_confirmation' => 'Password123',
            'contact_number' => '09123456789',
            'address' => 'Test Address',
            'barangay' => 'Sala',
            'city' => 'Cabuyao',
            'province' => 'Laguna',
        ]);

        $response->assertSessionHasErrors(['password']);
        $errors = session('errors')->get('password');
        $this->assertTrue(collect($errors)->some(fn($error) => str_contains($error, 'symbol')));
    }

    /**
     * Test that password confirmation error shows specific message.
     */
    public function test_password_confirmation_error_message()
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'MySecurePass123!@#',
            'password_confirmation' => 'DifferentPassword123!@#',
            'contact_number' => '09123456789',
            'address' => 'Test Address',
            'barangay' => 'Sala',
            'city' => 'Cabuyao',
            'province' => 'Laguna',
        ]);

        $response->assertSessionHasErrors(['password']);
        $errors = session('errors')->get('password');
        $this->assertTrue(collect($errors)->some(fn($error) => str_contains($error, 'confirmation')));
    }
}
