<?php

use App\Http\Controllers\Settings\PermissionsController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\RolePermissionController;
use App\Http\Controllers\Settings\RolesController;
use App\Http\Controllers\Settings\SecurityController;
use App\Http\Controllers\Settings\SettingsController;
use Illuminate\Auth\Middleware\RequirePassword;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::get('settings', [SettingsController::class, 'index'])->name('settings.index');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('settings/security', [SecurityController::class, 'edit'])
        ->middleware(RequirePassword::class)
        ->name('security.edit');

    Route::put('settings/password', [SecurityController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::inertia('settings/appearance', 'settings/appearance')->name('appearance.edit');
});

Route::middleware(['auth', 'verified', 'role:admin'])->group(function () {
    Route::get('settings/roles', [RolesController::class, 'index'])->name('roles.index');
    Route::post('settings/roles', [RolesController::class, 'store'])->name('roles.store');
    Route::get('settings/roles/{role}/edit', [RolesController::class, 'edit'])->name('roles.edit');
    Route::put('settings/roles/{role}', [RolesController::class, 'update'])->name('roles.update');

    Route::put('settings/roles/{role}/permissions/{permission}', [RolePermissionController::class, 'update'])
        ->name('roles.permissions.update');

    Route::get('settings/permissions', [PermissionsController::class, 'index'])->name('permissions.index');
});

Route::get('.well-known/passkey-endpoints', function () {
    return response()->json([
        'enroll' => route('security.edit'),
        'manage' => route('security.edit'),
    ]);
})->name('well-known.passkeys');
