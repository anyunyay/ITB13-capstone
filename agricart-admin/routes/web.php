<?php

use App\Http\Controllers\InventoryController;
use App\Http\Controllers\InventoryArchiveController;
use App\Http\Controllers\InventoryStockController;
use App\Http\Controllers\InventoryStockTrailController;
use App\Http\Controllers\MembershipController;
use App\Http\Controllers\LogisticController;
use App\Models\InventoryStockTrail;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {return Inertia::render('dashboard');})->name('dashboard');

    // Inventory Product Routes
    Route::get('/inventory', [InventoryController::class, 'index'])->name('inventory.index');
    Route::post('/inventory', [InventoryController::class, 'store'])->name('inventory.store');
    Route::get('/inventory/create', [InventoryController::class, 'create'])->name('inventory.create');
    Route::get('/inventory/{product}/edit', [InventoryController::class, 'edit'])->name('inventory.edit');
    Route::put('/inventory/{product}', [InventoryController::class, 'update'])->name('inventory.update');
    Route::delete('/inventory/{product}', [InventoryController::class, 'destroy'])->name('inventory.destroy');
    
    // Inventory Archive Routes
    Route::get('/inventory/archive', [InventoryArchiveController::class, 'index'])->name('inventory.archived.index');
    Route::post('/inventory/archive/{product}/restore', [InventoryArchiveController::class, 'restore'])->name('inventory.archived.restore');
    Route::delete('/inventory/archive/{product}', [InventoryArchiveController::class, 'forceDelete'])->name('inventory.archived.forceDelete');
    Route::post('/inventory/{product}/archive', [InventoryArchiveController::class, 'archive'])->name('inventory.archive');

    // Inventory Product Stock Routes
    Route::get('/inventory/{product}/add-stock', [InventoryStockController::class, 'addStock'])->name('inventory.addStock');
    Route::post('/inventory/{product}/add-stock', [InventoryStockController::class, 'storeStock'])->name('inventory.storeStock');
    Route::get('/inventory/{product}/edit-stock/{stock}', [InventoryStockController::class, 'editStock'])->name('inventory.editStock');
    Route::put('/inventory/{product}/edit-stock/{stock}', [InventoryStockController::class, 'updateStock'])->name('inventory.updateStock');
    Route::get('/inventory/{product}/remove-stock', [InventoryStockController::class, 'removeStock'])->name('inventory.removeStock');
    Route::post('/inventory/{product}/remove-stock', [InventoryStockController::class, 'storeRemoveStock'])->name('inventory.storeRemoveStock');
    Route::delete('/inventory/{product}/stock/{stock}', [InventoryStockController::class, 'destroy'])->name('inventory.removeStock');

    // Inventory Stock Trail Routes
    Route::get('/inventory/stock-trail', [InventoryStockTrailController::class, 'index'])->name('inventory.stockTrail.index');
    Route::get('/inventory{stock}/stock-trail', [InventoryStockTrailController::class, 'storeRemovedStock'])->name('inventory.stockTrail.store');

    // Membeship Routes
    Route::get('/membership', [MembershipController::class, 'index'])->name('membership.index');
    Route::get('/membership/add', [MembershipController::class, 'add'])->name('membership.add');
    Route::post('/membership', [MembershipController::class, 'store'])->name('membership.store');
    Route::get('/membership/{member}/edit', [MembershipController::class, 'edit'])->name('membership.edit');
    Route::put('/membership/{member}', [MembershipController::class, 'update'])->name('membership.update');
    Route::delete('/membership/{member}', [MembershipController::class, 'destroy'])->name('membership.destroy');

    // Logistics Routes
    Route::get('/logistics', [LogisticController::class, 'index'])->name('logistics.index');
    Route::get('/logistics/add', [LogisticController::class, 'add'])->name('logistics.add');
    Route::post('/logistics', [LogisticController::class, 'store'])->name('logistics.store');
    Route::get('/logistics/{logistic}/edit', [LogisticController::class, 'edit'])->name('logistics.edit');
    Route::put('/logistics/{logistic}', [LogisticController::class, 'update'])->name('logistics.update');
    Route::delete('/logistics/{logistic}', [LogisticController::class, 'destroy'])->name('logistics.destroy');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
