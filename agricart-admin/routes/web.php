<?php

use App\Http\Controllers\InventoryController;
use App\Http\Controllers\MembershipController;
use App\Http\Controllers\InventoryArchiveController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {return Inertia::render('dashboard');})->name('dashboard');

    // Inventory Routes
    Route::get('/inventory', [InventoryController::class, 'index'])->name('inventory.index');
    Route::post('/inventory', [InventoryController::class, 'store'])->name('inventory.store');
    Route::get('/inventory/create', [InventoryController::class, 'create'])->name('inventory.create');
    Route::get('/inventory/{product}/edit', [InventoryController::class, 'edit'])->name('inventory.edit');
    Route::put('/inventory/{product}', [InventoryController::class, 'update'])->name('inventory.update');
    Route::delete('/inventory/{product}', [InventoryController::class, 'destroy'])->name('inventory.destroy');
    
    Route::get('/archive', [InventoryArchiveController::class, 'index'])->name('inventory.archived.index');
    Route::post('/archive/{product}/restore', [InventoryArchiveController::class, 'restore'])->name('inventory.archived.restore');
    Route::delete('/archive/{product}', [InventoryArchiveController::class, 'forceDelete'])->name('inventory.archived.forceDelete');
    Route::post('/inventory/{product}/archive', [InventoryController::class, 'archive'])->name('inventory.archive');


    // Membeship Routes
    Route::get('/membership', [MembershipController::class, 'index'])->name('membership.index');
    Route::post('/membership', [MembershipController::class, 'store'])->name('membership.store');
    Route::get('/membership/add', [MembershipController::class, 'add'])->name('membership.add');
    Route::get('/membership/{member}/edit', [MembershipController::class, 'edit'])->name('membership.edit');
    Route::put('/membership/{member}', [MembershipController::class, 'update'])->name('membership.update');
    Route::delete('/membership/{member}', [MembershipController::class, 'destroy'])->name('membership.destroy');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
