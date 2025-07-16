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

// Shared Auth Middleware (Dashboard)
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', fn() => Inertia::render('dashboard'))->name('dashboard');
});

// Inventory Product Routes
    //  View Products
    Route::middleware(['auth', 'verified', 'can:view products'])->group(function () {
        Route::get('/inventory', [InventoryController::class, 'index'])->name('inventory.index');
    });
    // Create Product
    Route::middleware(['auth', 'verified', 'can:create products'])->group(function () {
        Route::get('/inventory/create', [InventoryController::class, 'create'])->name('inventory.create');
        Route::post('/inventory', [InventoryController::class, 'store'])->name('inventory.store');
    });
    // Edit Product
    Route::middleware(['auth', 'verified', 'can:edit products'])->group(function () {
        Route::get('/inventory/{product}/edit', [InventoryController::class, 'edit'])->name('inventory.edit');
        Route::put('/inventory/{product}', [InventoryController::class, 'update'])->name('inventory.update');
    });
    // Delete Product
    Route::middleware(['auth', 'verified', 'can:delete products'])->delete('/inventory/{product}', [InventoryController::class, 'destroy'])->name('inventory.destroy');


// Inventory Archive Routes
    // View Archived Products
    Route::middleware(['auth', 'verified', 'can:view archive'])->get('/inventory/archive', [InventoryArchiveController::class, 'index'])->name('inventory.archived.index');
    // Archive Product
    Route::middleware(['auth', 'verified', 'can:archive products'])->post('/inventory/{product}/archive', [InventoryArchiveController::class, 'archive'])->name('inventory.archive');
    // Unarchive Product
    Route::middleware(['auth', 'verified', 'can:unarchive products'])->post('/inventory/archive/{product}/restore', [InventoryArchiveController::class, 'restore'])->name('inventory.archived.restore');
    // Delete Archived Product
    Route::middleware(['auth', 'verified', 'can:delete archived products'])->delete('/inventory/archive/{product}', [InventoryArchiveController::class, 'forceDelete'])->name('inventory.archived.forceDelete');


// Inventory Product Stock Routes
    // Add Stock
    Route::middleware(['auth', 'verified', 'can:create stocks'])->group(function () {
        Route::get('/inventory/{product}/add-stock', [InventoryStockController::class, 'addStock'])->name('inventory.addStock');
        Route::post('/inventory/{product}/add-stock', [InventoryStockController::class, 'storeStock'])->name('inventory.storeStock');
    });
    // Edit Stock
    Route::middleware(['auth', 'verified', 'can:edit stocks'])->group(function () {
        Route::get('/inventory/{product}/edit-stock/{stock}', [InventoryStockController::class, 'editStock'])->name('inventory.editStock');
        Route::put('/inventory/{product}/edit-stock/{stock}', [InventoryStockController::class, 'updateStock'])->name('inventory.updateStock');
    });
    // Remove Stock
    Route::middleware(['auth', 'verified', 'can:create stocks'])->group(function () {
        Route::get('/inventory/{product}/remove-stock', [InventoryStockController::class, 'removeStock'])->name('inventory.removeStock');
        Route::post('/inventory/{product}/remove-stock', [InventoryStockController::class, 'storeRemoveStock'])->name('inventory.storeRemoveStock');
    });
    // Delete Stock
    Route::middleware(['auth', 'verified', 'can:delete stocks'])->delete('/inventory/{product}/stock/{stock}', [InventoryStockController::class, 'destroy'])->name('inventory.removeStock');


// Inventory Stock Trail Routes
    // View Stock Trail
    Route::middleware(['auth', 'verified', 'can:view stock trail'])->get('/inventory/stock-trail', [InventoryStockTrailController::class, 'index'])->name('inventory.stockTrail.index');

// Membeship Routes
    // View Membership
    Route::middleware(['auth', 'verified', 'can:view membership'])->group(function () {
        Route::get('/membership', [MembershipController::class, 'index'])->name('membership.index');
    });
    // Add Member
    Route::middleware(['auth', 'verified', 'can:create members'])->group(function () {
        Route::get('/membership/add', [MembershipController::class, 'add'])->name('membership.add');
        Route::post('/membership', [MembershipController::class, 'store'])->name('membership.store');
    });
    // Edit Member
    Route::middleware(['auth', 'verified', 'can:edit members'])->group(function () {
        Route::get('/membership/{member}/edit', [MembershipController::class, 'edit'])->name('membership.edit');
        Route::put('/membership/{member}', [MembershipController::class, 'update'])->name('membership.update');
    });
    // Delete Member
    Route::middleware(['auth', 'verified', 'can:delete members'])->delete('/membership/{member}', [MembershipController::class, 'destroy'])->name('membership.destroy');


// Logistics Routes
    // View Logistics
    Route::middleware(['auth', 'verified', 'can:view logistics'])->get('/logistics', [LogisticController::class, 'index'])->name('logistics.index');
    // Add Logistic
    Route::middleware(['auth', 'verified', 'can:create logistics'])->group(function () {
        Route::get('/logistics/add', [LogisticController::class, 'add'])->name('logistics.add');
        Route::post('/logistics', [LogisticController::class, 'store'])->name('logistics.store');
    });
    // Edit Logistic
    Route::middleware(['auth', 'verified', 'can:edit logistics'])->group(function () {
        Route::get('/logistics/{logistic}/edit', [LogisticController::class, 'edit'])->name('logistics.edit');
        Route::put('/logistics/{logistic}', [LogisticController::class, 'update'])->name('logistics.update');
    });
    // Delete Logistic
    Route::middleware(['auth', 'verified', 'can:delete logistics'])->delete('/logistics/{logistic}', [LogisticController::class, 'destroy'])->name('logistics.destroy');

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
