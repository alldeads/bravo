<?php

namespace Tests\Feature\Settings;

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class RolesTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_the_roles_list()
    {
        $this->seed(RolePermissionSeeder::class);

        $admin = User::factory()->create();
        $admin->assignRole('admin');

        User::factory()->create()->assignRole('user');
        User::factory()->create()->assignRole('user');

        $response = $this
            ->actingAs($admin)
            ->get(route('roles.index'));

        $response
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('settings/roles/index')
                ->where('roles', fn ($roles) => collect($roles)
                    ->firstWhere('name', 'user')['users_count'] === 2)
            );
    }

    public function test_non_admin_cannot_view_the_roles_list()
    {
        $this->seed(RolePermissionSeeder::class);

        $user = User::factory()->create();
        $user->assignRole('user');

        $response = $this
            ->actingAs($user)
            ->get(route('roles.index'));

        $response->assertForbidden();
    }

    public function test_guest_is_redirected_to_login()
    {
        $response = $this->get(route('roles.index'));

        $response->assertRedirect(route('login'));
    }

    public function test_admin_can_create_a_role()
    {
        $this->seed(RolePermissionSeeder::class);

        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $response = $this
            ->actingAs($admin)
            ->post(route('roles.store'), ['name' => 'editor']);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('roles.index'));

        $this->assertTrue(Role::where('name', 'editor')->exists());
    }

    public function test_role_name_must_be_unique()
    {
        $this->seed(RolePermissionSeeder::class);

        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $response = $this
            ->actingAs($admin)
            ->post(route('roles.store'), ['name' => 'admin']);

        $response->assertSessionHasErrors('name');
    }

    public function test_non_admin_cannot_create_a_role()
    {
        $this->seed(RolePermissionSeeder::class);

        $user = User::factory()->create();
        $user->assignRole('user');

        $response = $this
            ->actingAs($user)
            ->post(route('roles.store'), ['name' => 'editor']);

        $response->assertForbidden();
    }

    public function test_admin_can_view_a_roles_edit_page()
    {
        $this->seed(RolePermissionSeeder::class);

        $admin = User::factory()->create();
        $admin->assignRole('admin');

        User::factory()->create()->assignRole('manager');

        $role = Role::findByName('manager');

        $response = $this
            ->actingAs($admin)
            ->get(route('roles.edit', $role));

        $response
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('settings/roles/edit')
                ->where('role.name', 'manager')
                ->where('role.users_count', 1)
                ->where('permissionGroups', fn ($groups) => collect($groups)
                    ->firstWhere('module', 'users')['permissions'][0]['attached'] === true)
            );
    }

    public function test_admin_can_rename_a_role()
    {
        $this->seed(RolePermissionSeeder::class);

        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $role = Role::findByName('manager');

        $response = $this
            ->actingAs($admin)
            ->put(route('roles.update', $role), ['name' => 'supervisor']);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('roles.edit', $role));

        $this->assertSame('supervisor', $role->fresh()->name);
    }

    public function test_role_name_must_be_unique_when_renaming()
    {
        $this->seed(RolePermissionSeeder::class);

        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $role = Role::findByName('manager');

        $response = $this
            ->actingAs($admin)
            ->put(route('roles.update', $role), ['name' => 'admin']);

        $response->assertSessionHasErrors('name');
    }

    public function test_admin_can_attach_a_permission_to_a_role()
    {
        $this->seed(RolePermissionSeeder::class);

        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $role = Role::findByName('user');
        $permission = Permission::findByName('users.delete');

        $this->assertFalse($role->hasPermissionTo($permission));

        $response = $this
            ->actingAs($admin)
            ->put(route('roles.permissions.update', [$role, $permission]), ['attached' => true]);

        $response->assertSessionHasNoErrors();
        $this->assertTrue($role->fresh()->hasPermissionTo($permission));
    }

    public function test_admin_can_detach_a_permission_from_a_role()
    {
        $this->seed(RolePermissionSeeder::class);

        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $role = Role::findByName('manager');
        $permission = Permission::findByName('users.view');

        $this->assertTrue($role->hasPermissionTo($permission));

        $response = $this
            ->actingAs($admin)
            ->put(route('roles.permissions.update', [$role, $permission]), ['attached' => false]);

        $response->assertSessionHasNoErrors();
        $this->assertFalse($role->fresh()->hasPermissionTo($permission));
    }
}
