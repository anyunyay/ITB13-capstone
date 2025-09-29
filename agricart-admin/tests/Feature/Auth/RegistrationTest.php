<?php

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    // Seed roles and permissions for testing
    $this->seed(\Database\Seeders\RoleSeeder::class);
});

test('registration screen can be rendered', function () {
    $response = $this->get('/register');

    $response->assertStatus(200);
});

test('new users can register', function () {
    $response = $this->post('/register', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'contact_number' => '+639123456789',
        'address' => '123 Test Street',
        'barangay' => 'Sala',
        'city' => 'Cabuyao',
        'province' => 'Laguna',
    ]);

    // Check if user was created successfully
    $user = \App\Models\User::where('email', 'test@example.com')->first();
    expect($user)->not->toBeNull();
    expect($user->contact_number)->toBe('+639123456789');
    expect($user->address)->toBe('123 Test Street');
    expect($user->barangay)->toBe('Sala');
    expect($user->city)->toBe('Cabuyao');
    expect($user->province)->toBe('Laguna');
    expect($user->type)->toBe('customer');
    
    // Check response
    $response->assertRedirect(route('verification.notice', absolute: false));
    
    // Check authentication
    $this->assertAuthenticated();
});

test('registration fails with invalid address', function () {
    $response = $this->post('/register', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'contact_number' => '+639123456789',
        'address' => '123 Test Street',
        'barangay' => 'Invalid Barangay',
        'city' => 'Invalid City',
        'province' => 'Invalid Province',
    ]);

    $response->assertSessionHasErrors(['barangay', 'city', 'province']);
    $this->assertGuest();
});

test('registration fails with invalid contact number', function () {
    $response = $this->post('/register', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'contact_number' => '123456789', // Invalid format
        'address' => '123 Test Street',
        'barangay' => 'Sala',
        'city' => 'Cabuyao',
        'province' => 'Laguna',
    ]);

    $response->assertSessionHasErrors(['contact_number']);
    $this->assertGuest();
});