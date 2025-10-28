<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class ResponsiveTableBehaviorTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create roles and permissions
        Role::create(['name' => 'admin']);
        Permission::create(['name' => 'view staffs']);
        
        // Create test data
        User::factory()->count(15)->create(['type' => 'staff']);
    }

    public function test_table_renders_with_mobile_responsive_classes()
    {
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->assignRole('admin');
        $admin->givePermissionTo('view staffs');
        
        $response = $this->actingAs($admin)
            ->get('/admin/staff');

        $response->assertStatus(200);
        
        // Check that the response contains mobile-responsive elements
        $content = $response->getContent();
        
        // Check for responsive table container
        $this->assertStringContains('overflow-x-auto', $content);
        $this->assertStringContains('table-container', $content);
        
        // Check for responsive column classes
        $this->assertStringContains('min-w-', $content);
        
        // Check for responsive pagination
        $this->assertStringContains('flex-col', $content);
        $this->assertStringContains('sm:flex-row', $content);
        $this->assertStringContains('md:flex-row', $content);
    }

    public function test_pagination_controls_have_mobile_responsive_design()
    {
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->assignRole('admin');
        $admin->givePermissionTo('view staffs');
        
        $response = $this->actingAs($admin)
            ->get('/admin/staff');

        $response->assertStatus(200);
        
        $content = $response->getContent();
        
        // Check for mobile-responsive pagination elements
        $this->assertStringContains('text-xs sm:text-sm', $content);
        $this->assertStringContains('gap-1 sm:gap-2', $content);
        $this->assertStringContains('px-2 sm:px-3', $content);
        $this->assertStringContains('min-h-[2.25rem] sm:min-h-[2.5rem]', $content);
        
        // Check for responsive button sizing
        $this->assertStringContains('min-w-[2.25rem] sm:min-w-[2.5rem]', $content);
        $this->assertStringContains('h-[2.25rem] sm:h-[2.5rem]', $content);
        
        // Check for responsive text hiding/showing
        $this->assertStringContains('hidden sm:inline', $content);
        $this->assertStringContains('sm:hidden', $content);
    }

    public function test_table_headers_have_minimum_touch_targets()
    {
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->assignRole('admin');
        $admin->givePermissionTo('view staffs');
        
        $response = $this->actingAs($admin)
            ->get('/admin/staff');

        $response->assertStatus(200);
        
        $content = $response->getContent();
        
        // Check for adequate touch targets (44px minimum)
        // This is ensured by the min-h classes and padding
        $this->assertStringContains('py-3', $content); // Provides vertical padding
        $this->assertStringContains('px-4', $content); // Provides horizontal padding
        
        // Check for hover states on interactive elements
        $this->assertStringContains('hover:', $content);
        $this->assertStringContains('transition-', $content);
    }

    public function test_search_and_filter_controls_are_responsive()
    {
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->assignRole('admin');
        $admin->givePermissionTo('view staffs');
        
        $response = $this->actingAs($admin)
            ->get('/admin/staff');

        $response->assertStatus(200);
        
        $content = $response->getContent();
        
        // Check for responsive search layout
        $this->assertStringContains('flex-col sm:flex-row', $content);
        $this->assertStringContains('gap-3', $content);
        $this->assertStringContains('md:flex-row', $content);
        
        // Check for responsive input sizing
        $this->assertStringContains('w-full', $content);
        $this->assertStringContains('max-w-sm', $content);
        
        // Check for responsive button layouts
        $this->assertStringContains('flex gap-2', $content);
    }

    public function test_table_content_handles_long_text_properly()
    {
        // Create a user with very long name and email
        $longNameUser = User::factory()->create([
            'type' => 'staff',
            'name' => 'This is a very long name that should be handled properly in responsive design',
            'email' => 'this.is.a.very.long.email.address.that.should.be.handled.properly@example.com'
        ]);
        
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->assignRole('admin');
        $admin->givePermissionTo('view staffs');
        
        $response = $this->actingAs($admin)
            ->get('/admin/staff');

        $response->assertStatus(200);
        
        $content = $response->getContent();
        
        // Check for text truncation classes
        $this->assertStringContains('truncate', $content);
        $this->assertStringContains('line-clamp-', $content);
        
        // Check for minimum column widths
        $this->assertStringContains('min-w-[', $content);
    }

    public function test_action_buttons_are_appropriately_sized_for_mobile()
    {
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->assignRole('admin');
        $admin->givePermissionTo('view staffs');
        
        $response = $this->actingAs($admin)
            ->get('/admin/staff');

        $response->assertStatus(200);
        
        $content = $response->getContent();
        
        // Check for appropriate button sizing
        $this->assertStringContains('size="sm"', $content);
        
        // Check for button spacing
        $this->assertStringContains('gap-2', $content);
        
        // Check for icon sizing
        $this->assertStringContains('h-4 w-4', $content);
        
        // Check for responsive button behavior
        $this->assertStringContains('transition-all', $content);
        $this->assertStringContains('duration-200', $content);
    }

    public function test_table_maintains_usability_with_many_columns()
    {
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->assignRole('admin');
        $admin->givePermissionTo('view staffs');
        
        $response = $this->actingAs($admin)
            ->get('/admin/staff');

        $response->assertStatus(200);
        
        $content = $response->getContent();
        
        // Check for horizontal scroll container
        $this->assertStringContains('overflow-x-auto', $content);
        
        // Check for minimum table width
        $this->assertStringContains('min-w-full', $content);
        
        // Check that columns have appropriate minimum widths
        $this->assertStringContains('min-w-[150px]', $content); // Name column
        $this->assertStringContains('min-w-[200px]', $content); // Email column
        $this->assertStringContains('min-w-[120px]', $content); // Contact column
    }

    public function test_empty_state_is_responsive()
    {
        // Clear all staff to test empty state
        User::where('type', 'staff')->delete();
        
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->assignRole('admin');
        $admin->givePermissionTo('view staffs');
        
        $response = $this->actingAs($admin)
            ->get('/admin/staff');

        $response->assertStatus(200);
        
        $content = $response->getContent();
        
        // Check for responsive empty state layout
        $this->assertStringContains('flex flex-col items-center', $content);
        $this->assertStringContains('space-y-', $content);
        $this->assertStringContains('text-center', $content);
        
        // Check for responsive text sizing
        $this->assertStringContains('text-lg', $content);
        $this->assertStringContains('text-sm', $content);
    }

    public function test_loading_states_are_responsive()
    {
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->assignRole('admin');
        $admin->givePermissionTo('view staffs');
        
        $response = $this->actingAs($admin)
            ->get('/admin/staff');

        $response->assertStatus(200);
        
        $content = $response->getContent();
        
        // Check for responsive loading overlay
        $this->assertStringContains('absolute inset-0', $content);
        $this->assertStringContains('flex items-center justify-center', $content);
        $this->assertStringContains('backdrop-blur-sm', $content);
        
        // Check for responsive loading content
        $this->assertStringContains('flex flex-col items-center', $content);
        $this->assertStringContains('space-y-3', $content);
        $this->assertStringContains('p-6', $content);
    }

    public function test_keyboard_navigation_accessibility()
    {
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->assignRole('admin');
        $admin->givePermissionTo('view staffs');
        
        $response = $this->actingAs($admin)
            ->get('/admin/staff');

        $response->assertStatus(200);
        
        $content = $response->getContent();
        
        // Check for keyboard navigation support
        $this->assertStringContains('tabindex', $content);
        
        // Check for focus states
        $this->assertStringContains('focus:', $content);
        $this->assertStringContains('focus:outline-none', $content);
        $this->assertStringContains('focus:ring-', $content);
        
        // Check for accessible button elements
        $this->assertStringContains('<button', $content);
        
        // Check for proper ARIA attributes (if implemented)
        // Note: This would need to be added to components for full accessibility
    }

    public function test_screen_reader_compatibility()
    {
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->assignRole('admin');
        $admin->givePermissionTo('view staffs');
        
        $response = $this->actingAs($admin)
            ->get('/admin/staff');

        $response->assertStatus(200);
        
        $content = $response->getContent();
        
        // Check for semantic HTML structure
        $this->assertStringContains('<table', $content);
        $this->assertStringContains('<thead', $content);
        $this->assertStringContains('<tbody', $content);
        $this->assertStringContains('<th', $content);
        $this->assertStringContains('<td', $content);
        
        // Check for descriptive text content
        $this->assertStringContains('Loading data', $content);
        $this->assertStringContains('No data available', $content);
        
        // Check for proper heading structure
        $this->assertStringContains('<h2', $content);
    }
}