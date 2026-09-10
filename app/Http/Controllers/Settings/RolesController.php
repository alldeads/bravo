<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolesController extends Controller
{
    /**
     * Show the roles list, with how many users hold each role.
     */
    public function index(): Response
    {
        $roles = Role::withCount('users')
            ->orderBy('name')
            ->get()
            ->map(fn (Role $role) => [
                'id' => $role->id,
                'name' => $role->name,
                'users_count' => $role->users_count,
            ]);

        return Inertia::render('settings/roles/index', [
            'roles' => $roles,
        ]);
    }

    /**
     * Create a new role.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('roles', 'name')],
        ]);

        Role::create(['name' => $validated['name']]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Role created.')]);

        return to_route('roles.index');
    }

    /**
     * Show a single role: rename it and toggle its permissions.
     */
    public function edit(Role $role): Response
    {
        $role->loadCount('users');
        $role->load('permissions:id,name');

        $rolePermissionNames = $role->permissions->pluck('name');

        $permissionGroups = Permission::orderBy('name')
            ->get()
            ->groupBy(fn (Permission $permission) => Str::before($permission->name, '.'))
            ->map(fn ($permissions, string $module) => [
                'module' => $module,
                'label' => Str::headline($module),
                'permissions' => $permissions
                    ->map(fn (Permission $permission) => [
                        'id' => $permission->id,
                        'name' => $permission->name,
                        'label' => Str::headline(Str::after($permission->name, '.')),
                        'attached' => $rolePermissionNames->contains($permission->name),
                    ])
                    ->values(),
            ])
            ->values();

        return Inertia::render('settings/roles/edit', [
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'users_count' => $role->users_count,
            ],
            'permissionGroups' => $permissionGroups,
        ]);
    }

    /**
     * Rename a role.
     */
    public function update(Request $request, Role $role): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('roles', 'name')->ignore($role->id)],
        ]);

        $role->update(['name' => $validated['name']]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Role updated.')]);

        return to_route('roles.edit', $role);
    }
}
