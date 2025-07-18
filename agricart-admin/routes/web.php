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
    return Inertia::render('Customer/Home/index');
})->name('home');

// Authenticated routes
Route::middleware(['auth', 'verified'])->group(function () {
    // Admin || Staff routes
    Route::prefix('/admin')->group(function () {
        // Dashboard routes
        Route::get('/dashboard', fn() => Inertia::render('Admin/dashboard'))->name('admin.dashboard'); // Admin Dashboard

        // Inventory routes
        Route::middleware(['can:view inventory'])->group(function () {
            Route::get('/inventory', [InventoryController::class, 'index'])->name('inventory.index'); // View Inventory
        });
        Route::middleware(['can:create products'])->group(function () {
            Route::get('/inventory/create', [InventoryController::class, 'create'])->name('inventory.create'); // Add Product (GET)
            Route::post('/inventory', [InventoryController::class, 'store'])->name('inventory.store'); // Add Product (POST)
        });
        Route::middleware(['can:edit products'])->group(function () {
            Route::get('/inventory/{product}/edit', [InventoryController::class, 'edit'])->name('inventory.edit'); // Edit Product (GET)
            Route::put('/inventory/{product}', [InventoryController::class, 'update'])->name('inventory.update'); // Edit Product (PUT)
        });
        Route::middleware(['can:delete products'])->delete('/inventory/{product}', [InventoryController::class, 'destroy'])->name('inventory.destroy'); // Delete Product

        // Archive routes
        Route::middleware(['can:view archive'])->get('/inventory/archive', [InventoryArchiveController::class, 'index'])->name('inventory.archived.index'); // View Archived Products
        Route::middleware(['can:archive products'])->post('/inventory/{product}/archive', [InventoryArchiveController::class, 'archive'])->name('inventory.archive'); // Archive Product
        Route::middleware(['can:unarchive products'])->post('/inventory/archive/{product}/restore', [InventoryArchiveController::class, 'restore'])->name('inventory.archived.restore'); // Unarchive Product
        Route::middleware(['can:delete archived products'])->delete('/inventory/archive/{product}', [InventoryArchiveController::class, 'forceDelete'])->name('inventory.archived.forceDelete'); // Delete Archived Product

        // Stock routes
        Route::middleware(['can:create stocks'])->group(function () {
            Route::get('/inventory/{product}/add-stock', [InventoryStockController::class, 'addStock'])->name('inventory.addStock'); // Add Stock (GET)
            Route::post('/inventory/{product}/add-stock', [InventoryStockController::class, 'storeStock'])->name('inventory.storeStock'); // Add Stock (POST)
            Route::get('/inventory/{product}/remove-stock', [InventoryStockController::class, 'removeStock'])->name('inventory.removeStock'); // Remove Stock (GET)
            Route::post('/inventory/{product}/remove-stock', [InventoryStockController::class, 'storeRemoveStock'])->name('inventory.storeRemoveStock'); // Remove Stock (POST)
        });
        Route::middleware(['can:edit stocks'])->group(function () {
            Route::get('/inventory/{product}/edit-stock/{stock}', [InventoryStockController::class, 'editStock'])->name('inventory.editStock'); // Edit Stock (GET)
            Route::put('/inventory/{product}/edit-stock/{stock}', [InventoryStockController::class, 'updateStock'])->name('inventory.updateStock'); // Edit Stock (PUT)
        });
        Route::middleware(['can:delete stocks'])->delete('/inventory/{product}/stock/{stock}', [InventoryStockController::class, 'destroy'])->name('inventory.removeStock'); // Delete Stock

        // Stock Trail routes
        Route::middleware(['can:view stock trail'])->get('/inventory/stock-trail', [InventoryStockTrailController::class, 'index'])->name('inventory.stockTrail.index'); // View Stock Trail

        // Membership routes
        Route::middleware(['can:view membership'])->group(function () {
            Route::get('/membership', [MembershipController::class, 'index'])->name('membership.index'); // View Membership
        });
        Route::middleware(['can:create members'])->group(function () {
            Route::get('/membership/add', [MembershipController::class, 'add'])->name('membership.add'); // Add Member (GET)
            Route::post('/membership', [MembershipController::class, 'store'])->name('membership.store'); // Add Member (POST)
        });
        Route::middleware(['can:edit members'])->group(function () {
            Route::get('/membership/{member}/edit', [MembershipController::class, 'edit'])->name('membership.edit'); // Edit Member (GET)
            Route::put('/membership/{member}', [MembershipController::class, 'update'])->name('membership.update'); // Edit Member (PUT)
        });
        Route::middleware(['can:delete members'])->delete('/membership/{member}', [MembershipController::class, 'destroy'])->name('membership.destroy'); // Delete Member

        // Logistic routes
        Route::middleware(['can:view logistics'])->get('/logistics', [LogisticController::class, 'index'])->name('logistics.index'); // View Logistics
        Route::middleware(['can:create logistics'])->group(function () {
            Route::get('/logistics/add', [LogisticController::class, 'add'])->name('logistics.add'); // Add Logistic (GET)
            Route::post('/logistics', [LogisticController::class, 'store'])->name('logistics.store'); // Add Logistic (POST)
        });
        Route::middleware(['can:edit logistics'])->group(function () {
            Route::get('/logistics/{logistic}/edit', [LogisticController::class, 'edit'])->name('logistics.edit'); // Edit Logistic (GET)
            Route::put('/logistics/{logistic}', [LogisticController::class, 'update'])->name('logistics.update'); // Edit Logistic (PUT)
        });
        Route::middleware(['can:delete logistics'])->delete('/logistics/{logistic}', [LogisticController::class, 'destroy'])->name('logistics.destroy'); // Delete Logistic
    });

    // Customer routes
    Route::prefix('/customer')->group(function () {
        // Add more customer routes here as needed
    });

    // Logistic routes
    Route::prefix('/logistic')->group(function () {
        Route::get('/welcome', fn() => Inertia::render('Customer/dashboard'))->name('customer.dashboard'); // Customer Dashboard
        // Add more logistic routes here as needed
    });

    // Member routes
    Route::prefix('/member')->group(function () {
        Route::get('/welcome', fn() => Inertia::render('Customer/dashboard'))->name('customer.dashboard'); // Customer Dashboard
        // Add more member routes here as needed
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
