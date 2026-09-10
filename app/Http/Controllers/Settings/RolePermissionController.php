<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionController extends Controller
{
    /**
     * Attach or detach a permission from a role.
     */
    public function update(Request $request, Role $role, Permission $permission): RedirectResponse
    {
        $validated = $request->validate([
            'attached' => ['required', 'boolean'],
        ]);

        if ($validated['attached']) {
            $role->givePermissionTo($permission);
        } else {
            $role->revokePermissionTo($permission);
        }

        return back();
    }
}
