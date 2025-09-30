<?php

use App\Models\User;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    // Seed roles and permissions
    $this->seed(\Database\Seeders\RoleSeeder::class);
});

test('login screen can be rendered', function () {
    $response = $this->get('/login');

    $response->assertStatus(200);
});

test('users can authenticate using the login screen', function () {
    $user = User::factory()->customer()->create();

    $response = $this->post('/login', [
        'email' => $user->email,
        'password' => '12345678',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('home', absolute: false));
});

test('users can not authenticate with invalid password', function () {
    $user = User::factory()->customer()->create();

    $this->post('/login', [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $this->assertGuest();
});

test('users can logout', function () {
    $user = User::factory()->customer()->create();

    $response = $this->actingAs($user)->post('/logout');

    $this->assertGuest();
    $response->assertRedirect('/');
});

test('customers are blocked from admin login', function () {
    $customer = User::factory()->customer()->create();

    $response = $this->post('/admin/login', [
        'email' => $customer->email,
        'password' => '12345678',
    ]);

    $this->assertGuest();
    $response->assertRedirect(route('login'));
    $response->assertSessionHas('restrictionPopup');
});

test('customers are blocked from member login', function () {
    $customer = User::factory()->customer()->create();

    $response = $this->post('/member/login', [
        'email' => $customer->email,
        'password' => '12345678',
    ]);

    $this->assertGuest();
    $response->assertRedirect(route('login'));
    $response->assertSessionHas('restrictionPopup');
});

test('customers are blocked from logistics login', function () {
    $customer = User::factory()->customer()->create();

    $response = $this->post('/logistic/login', [
        'email' => $customer->email,
        'password' => '12345678',
    ]);

    $this->assertGuest();
    $response->assertRedirect(route('login'));
    $response->assertSessionHas('restrictionPopup');
});

test('admin users are blocked from customer login', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->post('/login', [
        'email' => $admin->email,
        'password' => '12345678',
    ]);

    $this->assertGuest();
    $response->assertRedirect(route('admin.login'));
    $response->assertSessionHas('restrictionPopup');
});

test('staff users are blocked from customer login', function () {
    $staff = User::factory()->staff()->create();

    $response = $this->post('/login', [
        'email' => $staff->email,
        'password' => 'password',
    ]);

    $this->assertGuest();
    $response->assertRedirect(route('admin.login'));
    $response->assertSessionHas('restrictionPopup');
});

test('member users are blocked from customer login', function () {
    $member = User::factory()->member()->create();

    $response = $this->post('/login', [
        'email' => $member->email,
        'password' => 'password',
    ]);

    $this->assertGuest();
    $response->assertRedirect(route('member.login'));
    $response->assertSessionHas('restrictionPopup');
});

test('logistic users are blocked from customer login', function () {
    $logistic = User::factory()->logistic()->create();

    $response = $this->post('/login', [
        'email' => $logistic->email,
        'password' => 'password',
    ]);

    $this->assertGuest();
    $response->assertRedirect(route('logistic.login'));
    $response->assertSessionHas('restrictionPopup');
});

test('member users are blocked from admin login', function () {
    $member = User::factory()->member()->create();

    $response = $this->post('/admin/login', [
        'email' => $member->email,
        'password' => 'password',
    ]);

    $this->assertGuest();
    $response->assertRedirect(route('member.login'));
    $response->assertSessionHas('restrictionPopup');
});

test('logistic users are blocked from admin login', function () {
    $logistic = User::factory()->logistic()->create();

    $response = $this->post('/admin/login', [
        'email' => $logistic->email,
        'password' => 'password',
    ]);

    $this->assertGuest();
    $response->assertRedirect(route('logistic.login'));
    $response->assertSessionHas('restrictionPopup');
});

test('admin users are blocked from member login', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->post('/member/login', [
        'email' => $admin->email,
        'password' => '12345678',
    ]);

    $this->assertGuest();
    $response->assertRedirect(route('admin.login'));
    $response->assertSessionHas('restrictionPopup');
});

test('logistic users are blocked from member login', function () {
    $logistic = User::factory()->logistic()->create();

    $response = $this->post('/member/login', [
        'email' => $logistic->email,
        'password' => 'password',
    ]);

    $this->assertGuest();
    $response->assertRedirect(route('logistic.login'));
    $response->assertSessionHas('restrictionPopup');
});

test('admin users are blocked from logistics login', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->post('/logistic/login', [
        'email' => $admin->email,
        'password' => '12345678',
    ]);

    $this->assertGuest();
    $response->assertRedirect(route('admin.login'));
    $response->assertSessionHas('restrictionPopup');
});

test('member users are blocked from logistics login', function () {
    $member = User::factory()->member()->create();

    $response = $this->post('/logistic/login', [
        'email' => $member->email,
        'password' => 'password',
    ]);

    $this->assertGuest();
    $response->assertRedirect(route('member.login'));
    $response->assertSessionHas('restrictionPopup');
});

test('staff users can login through admin login', function () {
    $staff = User::factory()->staff()->create();

    $response = $this->post('/admin/login', [
        'email' => $staff->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('admin.dashboard'));
});

test('admin users can login through admin login', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->post('/admin/login', [
        'email' => $admin->email,
        'password' => '12345678',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('admin.dashboard'));
});