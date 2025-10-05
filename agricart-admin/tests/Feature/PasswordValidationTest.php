<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use Illuminate\Validation\Rules\Password;

class PasswordValidationTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    /**
     * Test that password validation requires minimum 8 characters.
     */
    public function test_password_requires_minimum_length()
    {
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
    }

    /**
     * Test that password validation requires letters.
     */
    public function test_password_requires_letters()
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => '12345678',
            'password_confirmation' => '12345678',
            'contact_number' => '09123456789',
            'address' => 'Test Address',
            'barangay' => 'Sala',
            'city' => 'Cabuyao',
            'province' => 'Laguna',
        ]);

        $response->assertSessionHasErrors(['password']);
    }

    /**
     * Test that password validation requires mixed case.
     */
    public function test_password_requires_mixed_case()
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
    }

    /**
     * Test that password validation requires numbers.
     */
    public function test_password_requires_numbers()
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
    }

    /**
     * Test that password validation requires symbols.
     */
    public function test_password_requires_symbols()
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
    }

    /**
     * Test that a valid password passes validation.
     */
    public function test_valid_password_passes_validation()
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'MySecurePass123!@#',
            'password_confirmation' => 'MySecurePass123!@#',
            'contact_number' => '09123456789',
            'address' => 'Test Address',
            'barangay' => 'Sala',
            'city' => 'Cabuyao',
            'province' => 'Laguna',
        ]);

        $response->assertRedirect();
        // The user should be created and redirected to verification notice
        $this->assertDatabaseHas('users', [
            'email' => 'test@example.com',
            'name' => 'Test User',
        ]);
    }

    /**
     * Test that password confirmation must match.
     */
    public function test_password_confirmation_must_match()
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'DifferentPassword123!',
            'contact_number' => '09123456789',
            'address' => 'Test Address',
            'barangay' => 'Sala',
            'city' => 'Cabuyao',
            'province' => 'Laguna',
        ]);

        $response->assertSessionHasErrors(['password']);
    }
}