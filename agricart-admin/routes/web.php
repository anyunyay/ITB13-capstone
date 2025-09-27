<?php

// Admin Controllers
use App\Http\Controllers\Admin\InventoryController;
use App\Http\Controllers\Admin\InventoryArchiveController;
use App\Http\Controllers\Admin\InventoryStockController;
// use App\Http\Controllers\Admin\InventoryStockTrailController; // removed
use App\Http\Controllers\Admin\SoldStockController;
use App\Http\Controllers\Admin\TrendAnalysisController;

use App\Http\Controllers\Admin\MembershipController;
use App\Http\Controllers\Admin\LogisticController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\SalesController;
use App\Http\Controllers\Admin\StaffController;
use App\Http\Controllers\Customer\CartController;
// Customer Controllers
use App\Http\Controllers\Customer\HomeController;
use App\Http\Controllers\Customer\OrderController as CustomerOrderController;
use App\Http\Controllers\Customer\NotificationController;
use App\Http\Controllers\Member\MemberController;
use App\Http\Controllers\Api\NotificationController as ApiNotificationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [HomeController::class, 'index'])->name('home'); // View Home
Route::get('/search', [HomeController::class, 'search'])->name('search'); // Search Products
Route::get('/customer/products/{product}', [HomeController::class, 'show'])->name('products.show'); // Product Detail
Route::get('/customer/product/{product}', [HomeController::class, 'product'])->name('products.product'); // Product Page

// Password change routes (must be before other authenticated routes)
Route::middleware(['auth'])->group(function () {
    Route::get('/password/change', [\App\Http\Controllers\PasswordChangeController::class, 'show'])->name('password.change');
    Route::post('/password/change', [\App\Http\Controllers\PasswordChangeController::class, 'store'])->name('password.change.store');
});

// Authenticated routes
Route::middleware(['auth', 'verified', 'password.change.required'])->group(function () {
    // API routes for notifications
    Route::get('/api/notifications/latest', [ApiNotificationController::class, 'getLatest'])->name('api.notifications.latest');
    
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
        Route::middleware(['can:generate inventory report'])->group(function () {
            Route::get('/inventory/report', [InventoryController::class, 'generateReport'])->name('inventory.report');
        });
        
        // Archive routes
        Route::middleware(['can:view archive'])->get('/inventory/archive', [InventoryArchiveController::class, 'index'])->name('inventory.archived.index'); // View Archived Products
        Route::middleware(['can:archive products'])->post('/inventory/{product}/archive', [InventoryArchiveController::class, 'archive'])->name('inventory.archive'); // Archive Product
        Route::middleware(['can:unarchive products'])->post('/inventory/archive/{product}/restore', [InventoryArchiveController::class, 'restore'])->name('inventory.archived.restore'); // Unarchive Product
        Route::middleware(['can:delete archived products'])->delete('/inventory/archive/{product}', [InventoryArchiveController::class, 'forceDelete'])->name('inventory.archived.forceDelete'); // Delete Archived Product

        // Stock routes
        Route::middleware(['can:create stocks'])->group(function () {
            Route::get('/inventory/{product}/add-stock', [InventoryStockController::class, 'addStock'])->name('inventory.addStock'); // Add Stock (GET)
            Route::post('/inventory/{product}/add-stock', [InventoryStockController::class, 'storeStock'])->name('inventory.storeStock'); // Add Stock (POST)
            Route::get('/inventory/{product}/remove-perished-stock', [InventoryStockController::class, 'removeStock'])->name('inventory.removePerishedStock'); // Remove Perished Stock (GET)
            Route::post('/inventory/{product}/remove-perished-stock', [InventoryStockController::class, 'storeRemoveStock'])->name('inventory.storeRemovePerishedStock'); // Remove Perished Stock (POST)
        });
        Route::middleware(['can:edit stocks'])->group(function () {
            Route::get('/inventory/{product}/edit-stock/{stock}', [InventoryStockController::class, 'editStock'])->name('inventory.editStock'); // Edit Stock (GET)
            Route::put('/inventory/{product}/edit-stock/{stock}', [InventoryStockController::class, 'updateStock'])->name('inventory.updateStock'); // Edit Stock (PUT)
        });

        // Sold Stock & Removed Stock routes
        Route::middleware(['can:view sold stock'])->get('/inventory/sold-stock', [SoldStockController::class, 'index'])->name('inventory.soldStock.index');
        Route::middleware(['can:view stock trail'])->group(function () {
            Route::get('/inventory/removed-stock', [InventoryStockController::class, 'removedStocks'])->name('inventory.removedStock.index'); // View Removed Stock
            Route::post('/inventory/removed-stock/{stock}/restore', [InventoryStockController::class, 'restoreStock'])->name('inventory.removedStock.restore'); // Restore Removed Stock
        });

        // Order Management routes
        Route::middleware(['can:view orders'])->group(function () {
            Route::get('/orders', [OrderController::class, 'index'])->name('admin.orders.index');
        });
        Route::middleware(['can:view orders'])->group(function () {
            Route::get('/orders/{order}', [OrderController::class, 'show'])->whereNumber('order')->name('admin.orders.show');
            Route::get('/orders/{order}/receipt-preview', [OrderController::class, 'receiptPreview'])->whereNumber('order')->name('admin.orders.receiptPreview');
        });
        Route::middleware(['can:edit orders'])->group(function () {
            Route::post('/orders/{order}/approve', [OrderController::class, 'approve'])->whereNumber('order')->name('admin.orders.approve');
            Route::post('/orders/{order}/reject', [OrderController::class, 'reject'])->whereNumber('order')->name('admin.orders.reject');
            Route::post('/orders/{order}/process', [OrderController::class, 'process'])->whereNumber('order')->name('admin.orders.process');
            Route::post('/orders/{order}/assign-logistic', [OrderController::class, 'assignLogistic'])->whereNumber('order')->name('admin.orders.assignLogistic');
        });
        Route::middleware(['can:generate order report'])->group(function () {
            Route::get('/orders/report', [OrderController::class, 'generateReport'])->name('admin.orders.report');
        });

        // Sales routes
        Route::middleware(['can:view sales'])->group(function () {
            Route::get('/sales', [SalesController::class, 'index'])->name('admin.sales.index');
            Route::get('/sales/member-sales', [SalesController::class, 'memberSales'])->name('admin.sales.memberSales');
        });
        Route::middleware(['can:generate sales report'])->group(function () {
            Route::get('/sales/report', [SalesController::class, 'generateReport'])->name('admin.sales.report');
        });

        // Trend Analysis routes
        Route::middleware(['can:view inventory'])->group(function () {
            Route::get('/trends', [TrendAnalysisController::class, 'index'])->name('admin.trends.index');
            Route::get('/trends/data', [TrendAnalysisController::class, 'data'])->name('admin.trends.data');
            Route::get('/trends/latest-data', [TrendAnalysisController::class, 'getLatestData'])->name('admin.trends.latestData');
            Route::get('/trends/price-categories', [TrendAnalysisController::class, 'getPriceCategories'])->name('admin.trends.priceCategories');
        });

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
        Route::middleware(['can:generate membership report'])->group(function () {
            Route::get('/membership/report', [MembershipController::class, 'generateReport'])->name('membership.report');  // Export Member List (GET)
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
        Route::middleware(['can:generate logistics report'])->group(function () {
            Route::get('/logistics/report', [LogisticController::class, 'generateReport'])->name('logistics.report'); // Export Logistic List (GET)
        });
        Route::middleware(['can:delete logistics'])->delete('/logistics/{logistic}', [LogisticController::class, 'destroy'])->name('logistics.destroy'); // Delete Logistic

        // Staff routes
        Route::middleware(['can:view staffs'])->get('/staff', [StaffController::class, 'index'])->name('staff.index'); // View Staff
        Route::middleware(['can:create staffs'])->group(function () {
            Route::get('/staff/add', [StaffController::class, 'create'])->name('staff.create'); // Add Staff (GET)
            Route::post('/staff', [StaffController::class, 'store'])->name('staff.store'); // Add Staff (POST)
        });
        Route::middleware(['can:edit staffs'])->group(function () {
            Route::get('/staff/{staff}/edit', [StaffController::class, 'edit'])->name('staff.edit'); // Edit Staff (GET)
            Route::put('/staff/{staff}', [StaffController::class, 'update'])->name('staff.update'); // Edit Staff (PUT)
        });

        Route::middleware(['can:generate staff report'])->get('/staff/report', [StaffController::class, 'generateReport'])->name('admin.staff.report');
        Route::middleware(['can:delete staffs'])->delete('/staff/{staff}', [StaffController::class, 'destroy'])->name('staff.destroy'); // Delete Staff
        
        // Notification routes
        Route::get('/notifications', [\App\Http\Controllers\Admin\NotificationController::class, 'index'])->name('admin.notifications.index');
        Route::post('/notifications/mark-read', [\App\Http\Controllers\Admin\NotificationController::class, 'markRead'])->name('admin.notifications.markRead');
        Route::post('/notifications/mark-all-read', [\App\Http\Controllers\Admin\NotificationController::class, 'markAllRead'])->name('admin.notifications.markAllRead');
    });

        
    // Customer routes
    Route::prefix('/customer')->middleware(['can:access customer features'])->group(function () {
        Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
        Route::post('/cart/store', [CartController::class, 'store'])->name('cart.store');
        Route::put('/cart/update/{cartItem}', [CartController::class, 'update'])->name('cart.update');
        Route::post('/cart/checkout', [CartController::class, 'checkout'])->name('cart.checkout');
        Route::delete('/cart/remove/{cartItem}', [CartController::class, 'remove'])->name('cart.remove');

        Route::get('/orders/history', [CustomerOrderController::class, 'index'])->name('orders.history');
        Route::get('/orders/report', [CustomerOrderController::class, 'generateReport'])->name('orders.report');
        
        // Notification routes
        Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
        Route::post('/notifications/mark-read', [NotificationController::class, 'markRead'])->name('notifications.markRead');
        Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllRead'])->name('notifications.markAllRead');
    });

    // Logistic routes
    Route::prefix('/logistic')->middleware(['can:access logistic features'])->group(function () {
        Route::get('/dashboard', [\App\Http\Controllers\Logistic\LogisticController::class, 'dashboard'])->name('logistic.dashboard');
        Route::get('/orders', [\App\Http\Controllers\Logistic\LogisticController::class, 'assignedOrders'])->name('logistic.orders.index');
        Route::get('/orders/{order}', [\App\Http\Controllers\Logistic\LogisticController::class, 'showOrder'])->name('logistic.orders.show');
        Route::put('/orders/{order}/delivery-status', [\App\Http\Controllers\Logistic\LogisticController::class, 'updateDeliveryStatus'])->name('logistic.orders.updateDeliveryStatus');
        Route::get('/report', [\App\Http\Controllers\Logistic\LogisticController::class, 'generateReport'])->name('logistic.report');
        
        // Notification routes
        Route::get('/notifications', [\App\Http\Controllers\Logistic\NotificationController::class, 'index'])->name('logistic.notifications.index');
        Route::post('/notifications/mark-read', [\App\Http\Controllers\Logistic\NotificationController::class, 'markRead'])->name('logistic.notifications.markRead');
        Route::post('/notifications/mark-all-read', [\App\Http\Controllers\Logistic\NotificationController::class, 'markAllRead'])->name('logistic.notifications.markAllRead');
    });

    // Member routes
    Route::prefix('/member')->middleware(['can:access member features'])->group(function () {
        Route::get('/dashboard', [MemberController::class, 'dashboard'])->name('member.dashboard');
        Route::get('/available-stocks', [MemberController::class, 'availableStocks'])->name('member.availableStocks');
        Route::get('/all-stocks', [MemberController::class, 'allStocks'])->name('member.allStocks');
        Route::get('/sold-stocks', [MemberController::class, 'soldStocks'])->name('member.soldStocks');
        Route::get('/partial-stocks', [MemberController::class, 'partialStocks'])->name('member.partialStocks');
        Route::get('/assigned-stocks', [MemberController::class, 'assignedStocks'])->name('member.assignedStocks');
        Route::get('/revenue-report', [MemberController::class, 'generateRevenueReport'])->name('member.revenueReport');
        
        // Notification routes
        Route::get('/notifications', [\App\Http\Controllers\Member\NotificationController::class, 'index'])->name('member.notifications.index');
        Route::post('/notifications/mark-read', [\App\Http\Controllers\Member\NotificationController::class, 'markRead'])->name('member.notifications.markRead');
        Route::post('/notifications/mark-all-read', [\App\Http\Controllers\Member\NotificationController::class, 'markAllRead'])->name('member.notifications.markAllRead');
    });
});

// Auth routes
Route::get('/auth', function () {
    return redirect()->route('login');
})->name('auth');

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
