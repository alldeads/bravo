<?php

namespace Tests\Feature\Settings;

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PermissionsTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_the_permissions_matrix()
    {
        $this->seed(RolePermissionSeeder::class);

        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $response = $this
            ->actingAs($admin)
            ->get(route('permissions.index'));

        $response
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('settings/permissions/index')
                ->where('permissionGroups', fn ($groups) => collect($groups)
                    ->firstWhere('module', 'users')['permissions'][0]['roles'] !== null)
            );
    }

    public function test_non_admin_cannot_view_the_permissions_matrix()
    {
        $this->seed(RolePermissionSeeder::class);

        $user = User::factory()->create();
        $user->assignRole('user');

        $response = $this
            ->actingAs($user)
            ->get(route('permissions.index'));

        $response->assertForbidden();
    }

    public function test_guest_is_redirected_to_login()
    {
        $response = $this->get(route('permissions.index'));

        $response->assertRedirect(route('login'));
    }
}
