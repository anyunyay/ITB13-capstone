<?php

use App\Http\Controllers\Admin\InventoryController;
use App\Http\Controllers\Admin\InventoryArchiveController;
use App\Http\Controllers\Admin\InventoryStockController;
use App\Http\Controllers\Admin\InventoryStockTrailController;
use App\Http\Controllers\Admin\MembershipController;
use App\Http\Controllers\Admin\LogisticController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Admin/welcome');
})->name('home');

// All authenticated routes with middleware
Route::middleware(['auth', 'verified'])->group(function () {
    // // Admin Dashboard
    // Route::get('/admin/dashboard', fn() => Inertia::render('admin.dashboard'))->name('admin.dashboard');

    // Dashboard
    Route::get('/dashboard', fn() => Inertia::render('dashboard'))->name('dashboard');
    
// Inventory Routes
    // View Inventory
    Route::middleware(['can:view inventory'])->group(function () {
        Route::get('/inventory', [InventoryController::class, 'index'])->name('inventory.index');
    });
    // Add Product
    Route::middleware(['can:create products'])->group(function () {
        Route::get('/inventory/create', [InventoryController::class, 'create'])->name('inventory.create');
        Route::post('/inventory', [InventoryController::class, 'store'])->name('inventory.store');
    });
    // Edit Product
    Route::middleware(['can:edit products'])->group(function () {
        Route::get('/inventory/{product}/edit', [InventoryController::class, 'edit'])->name('inventory.edit');
        Route::put('/inventory/{product}', [InventoryController::class, 'update'])->name('inventory.update');
    });
    // Delete Product
    Route::middleware(['can:delete products'])->delete('/inventory/{product}', [InventoryController::class, 'destroy'])->name('inventory.destroy');

// Inventory Archive Routes
    // View Archived Products
    Route::middleware(['can:view archive'])->get('/inventory/archive', [InventoryArchiveController::class, 'index'])->name('inventory.archived.index');
    // Archive Product
    Route::middleware(['can:archive products'])->post('/inventory/{product}/archive', [InventoryArchiveController::class, 'archive'])->name('inventory.archive');
    // Unarchive Product
    Route::middleware(['can:unarchive products'])->post('/inventory/archive/{product}/restore', [InventoryArchiveController::class, 'restore'])->name('inventory.archived.restore');
    // Delete Archived Product
    Route::middleware(['can:delete archived products'])->delete('/inventory/archive/{product}', [InventoryArchiveController::class, 'forceDelete'])->name('inventory.archived.forceDelete');

// Inventory Product Stock Routes
    // Add Stock
    Route::middleware(['can:create stocks'])->group(function () {
        Route::get('/inventory/{product}/add-stock', [InventoryStockController::class, 'addStock'])->name('inventory.addStock');
        Route::post('/inventory/{product}/add-stock', [InventoryStockController::class, 'storeStock'])->name('inventory.storeStock');
        Route::get('/inventory/{product}/remove-stock', [InventoryStockController::class, 'removeStock'])->name('inventory.removeStock');
        Route::post('/inventory/{product}/remove-stock', [InventoryStockController::class, 'storeRemoveStock'])->name('inventory.storeRemoveStock');
    });
    // Edit Stock
    Route::middleware(['can:edit stocks'])->group(function () {
        Route::get('/inventory/{product}/edit-stock/{stock}', [InventoryStockController::class, 'editStock'])->name('inventory.editStock');
        Route::put('/inventory/{product}/edit-stock/{stock}', [InventoryStockController::class, 'updateStock'])->name('inventory.updateStock');
    });
    // Delete Stock
    Route::middleware(['can:delete stocks'])->delete('/inventory/{product}/stock/{stock}', [InventoryStockController::class, 'destroy'])->name('inventory.removeStock');

// Inventory Stock Trail Routes
    // View Stock Trail
    Route::middleware(['can:view stock trail'])->get('/inventory/stock-trail', [InventoryStockTrailController::class, 'index'])->name('inventory.stockTrail.index');

// Membership Routes
    // View Membership
    Route::middleware(['can:view membership'])->group(function () {
        Route::get('/membership', [MembershipController::class, 'index'])->name('membership.index');
    });
    // Add Member
    Route::middleware(['can:create members'])->group(function () {
        Route::get('/membership/add', [MembershipController::class, 'add'])->name('membership.add');
        Route::post('/membership', [MembershipController::class, 'store'])->name('membership.store');
    });
    // Edit Member
    Route::middleware(['can:edit members'])->group(function () {
        Route::get('/membership/{member}/edit', [MembershipController::class, 'edit'])->name('membership.edit');
        Route::put('/membership/{member}', [MembershipController::class, 'update'])->name('membership.update');
    });
    // Delete Member
    Route::middleware(['can:delete members'])->delete('/membership/{member}', [MembershipController::class, 'destroy'])->name('membership.destroy');

// Logistics Routes
    // View Logistics
    Route::middleware(['can:view logistics'])->get('/logistics', [LogisticController::class, 'index'])->name('logistics.index');
    // Add Logistic
    Route::middleware(['can:create logistics'])->group(function () {
        Route::get('/logistics/add', [LogisticController::class, 'add'])->name('logistics.add');
        Route::post('/logistics', [LogisticController::class, 'store'])->name('logistics.store');
    });
    // Edit Logistic
    Route::middleware(['can:edit logistics'])->group(function () {
        Route::get('/logistics/{logistic}/edit', [LogisticController::class, 'edit'])->name('logistics.edit');
        Route::put('/logistics/{logistic}', [LogisticController::class, 'update'])->name('logistics.update');
    });
    // Delete Logistic
    Route::middleware(['can:delete logistics'])->delete('/logistics/{logistic}', [LogisticController::class, 'destroy'])->name('logistics.destroy');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
