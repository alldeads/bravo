<?php

use App\Http\Controllers\InvoiceController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('invoices', [InvoiceController::class, 'index'])
        ->middleware('permission:invoices.view')
        ->name('invoices.index');

    Route::get('invoices/create', [InvoiceController::class, 'create'])
        ->middleware('permission:invoices.create')
        ->name('invoices.create');

    Route::post('invoices', [InvoiceController::class, 'store'])
        ->middleware('permission:invoices.create')
        ->name('invoices.store');

    Route::get('invoices/{invoice}', [InvoiceController::class, 'show'])
        ->middleware('permission:invoices.view')
        ->name('invoices.show');

    Route::get('invoices/{invoice}/edit', [InvoiceController::class, 'edit'])
        ->middleware('permission:invoices.edit')
        ->name('invoices.edit');

    Route::put('invoices/{invoice}', [InvoiceController::class, 'update'])
        ->middleware('permission:invoices.edit')
        ->name('invoices.update');

    Route::delete('invoices/{invoice}', [InvoiceController::class, 'destroy'])
        ->middleware('permission:invoices.delete')
        ->name('invoices.destroy');
});
