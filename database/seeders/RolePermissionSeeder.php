<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    /**
     * The role => permissions matrix.
     *
     * Each role is granted exactly the permissions listed for it, except
     * `admin`, which is always granted every permission that exists.
     *
     * @var array<string, list<string>>
     */
    protected const MATRIX = [
        'admin' => [], // gets every permission, see run()
        'manager' => [
            'dashboard.view',
            'users.view',
            'users.create',
            'users.edit',
            'roles.view',
            'settings.view',
            'products.view',
            'products.create',
            'products.edit',
        ],
        'user' => [
            'dashboard.view',
            'settings.view',
        ],
    ];

    /**
     * All permissions in the system, grouped by resource for readability.
     *
     * @var list<string>
     */
    protected const PERMISSIONS = [
        'dashboard.view',
        'users.view',
        'users.create',
        'users.edit',
        'users.delete',
        'roles.view',
        'roles.create',
        'roles.edit',
        'roles.delete',
        'settings.view',
        'settings.edit',
        'products.view',
        'products.create',
        'products.edit',
        'products.delete',
    ];

    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        foreach (self::PERMISSIONS as $permission) {
            Permission::findOrCreate($permission);
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        foreach (array_keys(self::MATRIX) as $roleName) {
            $role = Role::findOrCreate($roleName);

            $permissions = $roleName === 'admin'
                ? self::PERMISSIONS
                : self::MATRIX[$roleName];

            $role->syncPermissions($permissions);
        }
    }
}
