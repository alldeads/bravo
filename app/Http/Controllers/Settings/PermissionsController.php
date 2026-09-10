<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionsController extends Controller
{
    /**
     * Show the full roles x permissions matrix, grouped by module.
     */
    public function index(): Response
    {
        $roles = Role::orderBy('name')->get(['id', 'name']);

        $permissionGroups = Permission::with('roles:id,name')
            ->orderBy('name')
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
                        'roles' => $permission->roles->pluck('name'),
                    ])
                    ->values(),
            ])
            ->values();

        return Inertia::render('settings/permissions/index', [
            'roles' => $roles,
            'permissionGroups' => $permissionGroups,
        ]);
    }
}
