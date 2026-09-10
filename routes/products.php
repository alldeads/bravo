<?php

use App\Http\Controllers\ProductComponentController;
use App\Http\Controllers\ProductController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('products', [ProductController::class, 'index'])
        ->middleware('permission:products.view')
        ->name('products.index');

    Route::get('products/create', [ProductController::class, 'create'])
        ->middleware('permission:products.create')
        ->name('products.create');

    Route::post('products', [ProductController::class, 'store'])
        ->middleware('permission:products.create')
        ->name('products.store');

    Route::get('products/{product}/edit', [ProductController::class, 'edit'])
        ->middleware('permission:products.edit')
        ->name('products.edit');

    Route::put('products/{product}', [ProductController::class, 'update'])
        ->middleware('permission:products.edit')
        ->name('products.update');

    Route::delete('products/{product}', [ProductController::class, 'destroy'])
        ->middleware('permission:products.delete')
        ->name('products.destroy');

    Route::post('products/{product}/components', [ProductComponentController::class, 'store'])
        ->middleware('permission:products.edit')
        ->name('products.components.store');

    Route::put('products/{product}/components/{component}', [ProductComponentController::class, 'update'])
        ->middleware('permission:products.edit')
        ->name('products.components.update');

    Route::delete('products/{product}/components/{component}', [ProductComponentController::class, 'destroy'])
        ->middleware('permission:products.edit')
        ->name('products.components.destroy');
});
