<?php

// Admin Controllers
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\InventoryController;
use App\Http\Controllers\Admin\InventoryArchiveController;
use App\Http\Controllers\Admin\InventoryStockController;
// use App\Http\Controllers\Admin\InventoryStockTrailController; // removed
use App\Http\Controllers\Admin\SoldStockController;
use App\Http\Controllers\Admin\TrendAnalysisController;

use App\Http\Controllers\Admin\MembershipController;
use App\Http\Controllers\Admin\LogisticController as AdminLogisticController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\SalesController;
use App\Http\Controllers\Admin\StaffController;
use App\Http\Controllers\Admin\NotificationController as AdminNotificationController;
use App\Http\Controllers\Customer\CartController;
// Customer Controllers
use App\Http\Controllers\Customer\HomeController;
use App\Http\Controllers\Customer\OrderController as CustomerOrderController;
use App\Http\Controllers\Customer\NotificationController;
use App\Http\Controllers\Customer\ProfileController;
use App\Http\Controllers\Customer\AddressController;
use App\Http\Controllers\Customer\AppearanceController;
use App\Http\Controllers\Member\MemberController;
use App\Http\Controllers\Member\NotificationController as MemberNotificationController;
use App\Http\Controllers\Logistic\LogisticController;
use App\Http\Controllers\Logistic\NotificationController as LogisticNotificationController;
use App\Http\Controllers\Security\SingleSessionController;
use App\Http\Controllers\Security\EmailPreviewController;
use App\Http\Controllers\Security\ComprehensiveEmailPreviewController;
use App\Http\Controllers\Security\DirectEmailTemplateController;
use App\Http\Controllers\Security\EmailChangeController;
use App\Http\Controllers\Security\PhoneChangeController;
use App\Http\Controllers\Security\PasswordChangeController;
use App\Http\Controllers\Security\CredentialsController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [HomeController::class, 'index'])->name('home'); // View Home
Route::get('/search', [HomeController::class, 'search'])->name('search'); // Search Products
Route::get('/customer/produce', [HomeController::class, 'produce'])->name('produce'); // View All Products
Route::get('/customer/products/{product}', [HomeController::class, 'show'])->name('products.show'); // Product Detail
Route::get('/customer/product/{product}', [HomeController::class, 'product'])->name('products.product'); // Product Page

// Password change routes (must be before other authenticated routes)
Route::middleware(['auth'])->group(function () {
    Route::get('/password/change', [PasswordChangeController::class, 'show'])->name('password.change');
    Route::post('/password/change', [PasswordChangeController::class, 'store'])->name('password.change.store');
});

// Credentials update routes for default users (must be before other authenticated routes)
Route::middleware(['auth'])->group(function () {
    Route::get('/credentials/update', [CredentialsController::class, 'show'])->name('credentials.update.show');
    Route::post('/credentials/update', [CredentialsController::class, 'update'])->name('credentials.update');
});

// Single session routes
Route::middleware(['auth'])->group(function () {
    Route::get('/single-session/restricted', [SingleSessionController::class, 'showRestricted'])->name('single-session.restricted');
    Route::post('/single-session/logout', [SingleSessionController::class, 'forceLogoutAndLogin'])->name('single-session.logout');
});

// Authenticated routes
Route::middleware(['auth', 'verified', 'password.change.required'])->group(function () {
    // Admin || Staff routes
    Route::prefix('/admin')->middleware(['role:admin|staff'])->group(function () {
        // Dashboard routes
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('admin.dashboard'); // Admin Dashboard
        
        // Admin Profile routes
        Route::get('/profile/info', [ProfileController::class, 'profile'])->name('admin.profile.info');
        Route::get('/profile/password', [ProfileController::class, 'password'])->name('admin.profile.password');
        Route::patch('/profile/name', [ProfileController::class, 'updateName'])->name('admin.profile.updateName');
        Route::get('/profile/appearance', [AppearanceController::class, 'index'])->name('admin.profile.appearance');
        Route::patch('/profile/appearance', [AppearanceController::class, 'update'])->name('admin.profile.appearance.update');
        Route::get('/profile/help', [ProfileController::class, 'help'])->name('admin.profile.help');
        Route::get('/profile/logout', [ProfileController::class, 'logoutPage'])->name('admin.profile.logout.page');
        
        // Admin Email Change routes (modal-based)
        Route::post('/profile/email-change/send-otp', [EmailChangeController::class, 'sendOtp'])->name('admin.profile.email-change.send-otp');
        Route::get('/profile/email-change/verify/{requestId}', [EmailChangeController::class, 'showVerify'])->name('admin.profile.email-change.verify');
        Route::post('/profile/email-change/verify/{requestId}', [EmailChangeController::class, 'verifyOtp'])->name('admin.profile.email-change.verify-otp');
        Route::post('/profile/email-change/resend/{requestId}', [EmailChangeController::class, 'resendOtp'])->name('admin.profile.email-change.resend');
        Route::post('/profile/email-change/cancel/{requestId}', [EmailChangeController::class, 'cancel'])->name('admin.profile.email-change.cancel');

        // Admin Phone Change routes (modal-based)
        Route::post('/profile/phone-change/send-otp', [PhoneChangeController::class, 'sendOtp'])->name('admin.profile.phone-change.send-otp');
        Route::get('/profile/phone-change/verify/{requestId}', [PhoneChangeController::class, 'showVerify'])->name('admin.profile.phone-change.verify');
        Route::post('/profile/phone-change/verify/{requestId}', [PhoneChangeController::class, 'verifyOtp'])->name('admin.profile.phone-change.verify-otp');
        Route::post('/profile/phone-change/resend/{requestId}', [PhoneChangeController::class, 'resendOtp'])->name('admin.profile.phone-change.resend');
        Route::post('/profile/phone-change/cancel/{requestId}', [PhoneChangeController::class, 'cancel'])->name('admin.profile.phone-change.cancel');

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
            Route::post('/orders/{order}/mark-urgent', [OrderController::class, 'markUrgent'])->whereNumber('order')->name('admin.orders.markUrgent');
            Route::post('/orders/{order}/unmark-urgent', [OrderController::class, 'unmarkUrgent'])->whereNumber('order')->name('admin.orders.unmarkUrgent');
        });
        Route::middleware(['can:mark orders ready for pickup'])->group(function () {
            Route::post('/orders/{order}/mark-ready', [OrderController::class, 'markReady'])->whereNumber('order')->name('admin.orders.markReady');
            Route::post('/orders/{order}/mark-picked-up', [OrderController::class, 'markPickedUp'])->whereNumber('order')->name('admin.orders.markPickedUp');
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
        Route::middleware(['can:deactivate members'])->delete('/membership/{member}', [MembershipController::class, 'destroy'])->name('membership.destroy'); // Deactivate Member
        Route::middleware(['can:edit members'])->delete('/membership/{member}/document', [MembershipController::class, 'deleteDocument'])->name('membership.delete-document'); // Delete Member Document
        Route::middleware(['can:view membership'])->get('/membership/deactivated', [MembershipController::class, 'deactivated'])->name('membership.deactivated'); // View Deactivated Members
        Route::middleware(['can:reactivate members'])->post('/membership/{member}/reactivate', [MembershipController::class, 'reactivate'])->name('membership.reactivate'); // Reactivate Member
        
        // Password change request routes
        Route::middleware(['can:edit members'])->group(function () {
            Route::post('/membership/password-change/{requestId}/approve', [MembershipController::class, 'approvePasswordChange'])->name('membership.approve-password-change');
            Route::post('/membership/password-change/{requestId}/reject', [MembershipController::class, 'rejectPasswordChange'])->name('membership.reject-password-change');
        });

        // Logistic routes
        Route::middleware(['can:view logistics'])->get('/logistics', [AdminLogisticController::class, 'index'])->name('logistics.index'); // View Logistics
        Route::middleware(['can:create logistics'])->group(function () {
            Route::get('/logistics/add', [AdminLogisticController::class, 'add'])->name('logistics.add'); // Add Logistic (GET)
            Route::post('/logistics', [AdminLogisticController::class, 'store'])->name('logistics.store'); // Add Logistic (POST)
        });
        Route::middleware(['can:edit logistics'])->group(function () {
            Route::get('/logistics/{logistic}/edit', [AdminLogisticController::class, 'edit'])->name('logistics.edit'); // Edit Logistic (GET)
            Route::put('/logistics/{logistic}', [AdminLogisticController::class, 'update'])->name('logistics.update'); // Edit Logistic (PUT)
        });
        Route::middleware(['can:generate logistics report'])->group(function () {
            Route::get('/logistics/report', [AdminLogisticController::class, 'generateReport'])->name('logistics.report'); // Export Logistic List (GET)
        });
        Route::middleware(['can:deactivate logistics'])->delete('/logistics/{logistic}', [AdminLogisticController::class, 'destroy'])->name('logistics.destroy'); // Deactivate Logistic
        Route::middleware(['can:view logistics'])->get('/logistics/deactivated', [AdminLogisticController::class, 'deactivated'])->name('logistics.deactivated'); // View Deactivated Logistics
        Route::middleware(['can:reactivate logistics'])->post('/logistics/{logistic}/reactivate', [AdminLogisticController::class, 'reactivate'])->name('logistics.reactivate'); // Reactivate Logistic

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
        Route::get('/notifications', [AdminNotificationController::class, 'index'])->name('admin.notifications.index');
        Route::post('/notifications/mark-read', [AdminNotificationController::class, 'markRead'])->name('admin.notifications.markRead');
        Route::post('/notifications/mark-all-read', [AdminNotificationController::class, 'markAllRead'])->name('admin.notifications.markAllRead');
    });

        
    // Customer routes
    Route::prefix('/customer')->middleware(['role:customer'])->group(function () {
        Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
        Route::post('/cart/store', [CartController::class, 'store'])->name('cart.store');
        Route::put('/cart/update/{cartItem}', [CartController::class, 'update'])->name('cart.update');
        Route::post('/cart/checkout', [CartController::class, 'checkout'])->name('cart.checkout');
        Route::delete('/cart/remove/{cartItem}', [CartController::class, 'remove'])->name('cart.remove');

        Route::get('/orders/history', [CustomerOrderController::class, 'index'])->name('orders.history');
        Route::get('/orders/report', [CustomerOrderController::class, 'generateReport'])->name('orders.report');
        Route::post('/orders/{order}/cancel', [CustomerOrderController::class, 'cancel'])->name('customer.orders.cancel');
        Route::post('/orders/{order}/confirm-received', [CustomerOrderController::class, 'confirmReceived'])->name('customer.orders.confirmReceived');
        
        // Customer Profile routes - Individual pages only
        Route::put('/profile', [ProfileController::class, 'update'])->name('customer.profile.update');
        Route::patch('/profile', [ProfileController::class, 'update'])->name('customer.profile.update.patch');
        Route::patch('/profile/name', [ProfileController::class, 'updateName'])->name('customer.profile.updateName');
        Route::post('/profile/change-password', [ProfileController::class, 'changePassword'])->name('customer.profile.changePassword');
        Route::post('/profile/avatar/upload', [ProfileController::class, 'uploadAvatar'])->name('customer.profile.avatar.upload');
        Route::delete('/profile/avatar/delete', [ProfileController::class, 'deleteAvatar'])->name('customer.profile.avatar.delete');
        Route::post('/profile/logout', [ProfileController::class, 'logout'])->name('customer.profile.logout');
        
        // Address management routes
        Route::get('/profile/addresses', [AddressController::class, 'index'])->name('customer.profile.addresses.index');
        Route::post('/profile/addresses', [AddressController::class, 'store'])->name('customer.profile.addresses.store');
        Route::get('/profile/addresses/{address}', [AddressController::class, 'show'])->name('customer.profile.addresses.show');
        Route::put('/profile/addresses/{address}', [AddressController::class, 'update'])->name('customer.profile.addresses.update');
        Route::delete('/profile/addresses/{address}', [AddressController::class, 'destroy'])->name('customer.profile.addresses.destroy');
        Route::post('/profile/addresses/{address}/set-default', [AddressController::class, 'setDefault'])->name('customer.profile.addresses.setDefault');
        Route::post('/profile/addresses/{address}/set-active', [AddressController::class, 'setActive'])->name('customer.profile.addresses.setActive');
        Route::post('/profile/addresses/{address}/update-main', [AddressController::class, 'updateMainAddress'])->name('customer.profile.addresses.updateMain');
        Route::put('/profile/main-address', [AddressController::class, 'updateMainAddressFields'])->name('customer.profile.main-address.update');
        Route::get('/profile/current-address', [AddressController::class, 'getCurrentAddress'])->name('customer.profile.currentAddress');
        
        
        // Email Change routes (modal-based)
        Route::post('/profile/email-change/send-otp', [EmailChangeController::class, 'sendOtp'])->name('customer.profile.email-change.send-otp');
        Route::get('/profile/email-change/verify/{requestId}', [EmailChangeController::class, 'showVerify'])->name('customer.profile.email-change.verify');
        Route::post('/profile/email-change/verify/{requestId}', [EmailChangeController::class, 'verifyOtp'])->name('customer.profile.email-change.verify-otp');
        Route::post('/profile/email-change/resend/{requestId}', [EmailChangeController::class, 'resendOtp'])->name('customer.profile.email-change.resend');
        Route::post('/profile/email-change/cancel/{requestId}', [EmailChangeController::class, 'cancel'])->name('customer.profile.email-change.cancel');
        
        // Phone Change routes (modal-based)
        Route::post('/profile/phone-change/send-otp', [PhoneChangeController::class, 'sendOtp'])->name('customer.profile.phone-change.send-otp');
        Route::get('/profile/phone-change/verify/{requestId}', [PhoneChangeController::class, 'showVerify'])->name('customer.profile.phone-change.verify');
        Route::post('/profile/phone-change/verify/{requestId}', [PhoneChangeController::class, 'verifyOtp'])->name('customer.profile.phone-change.verify-otp');
        Route::post('/profile/phone-change/resend/{requestId}', [PhoneChangeController::class, 'resendOtp'])->name('customer.profile.phone-change.resend');
        Route::post('/profile/phone-change/cancel/{requestId}', [PhoneChangeController::class, 'cancel'])->name('customer.profile.phone-change.cancel');
        
        // Individual profile section pages
        Route::get('/profile/info', [ProfileController::class, 'profile'])->name('customer.profile.info');
        Route::get('/profile/password', [ProfileController::class, 'password'])->name('customer.profile.password');
        Route::get('/profile/appearance', [AppearanceController::class, 'index'])->name('customer.profile.appearance');
        Route::patch('/profile/appearance', [AppearanceController::class, 'update'])->name('customer.profile.appearance.update');
        Route::get('/profile/help', [ProfileController::class, 'help'])->name('customer.profile.help');
        Route::get('/profile/logout', [ProfileController::class, 'logoutPage'])->name('customer.profile.logout.page');
        
        // Notification routes
        Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
        Route::post('/notifications/mark-read', [NotificationController::class, 'markRead'])->name('notifications.markRead');
        Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllRead'])->name('notifications.markAllRead');
    });

    // Logistic routes
    Route::prefix('/logistic')->middleware(['role:logistic'])->group(function () {
        Route::get('/dashboard', [LogisticController::class, 'dashboard'])->name('logistic.dashboard');
        Route::get('/orders', [LogisticController::class, 'assignedOrders'])->name('logistic.orders.index');
        Route::get('/orders/{order}', [LogisticController::class, 'showOrder'])->name('logistic.orders.show');
        Route::put('/orders/{order}/delivery-status', [LogisticController::class, 'updateDeliveryStatus'])->name('logistic.orders.updateDeliveryStatus');
        Route::post('/orders/{order}/mark-delivered', [LogisticController::class, 'markDelivered'])->name('logistic.orders.markDelivered');
        Route::get('/report', [LogisticController::class, 'generateReport'])->name('logistic.report');
        
        // Logistic Profile routes
        Route::get('/profile/info', [ProfileController::class, 'profile'])->name('logistic.profile.info');
        Route::get('/profile/password', [ProfileController::class, 'password'])->name('logistic.profile.password');
        Route::patch('/profile/name', [ProfileController::class, 'updateName'])->name('logistic.profile.updateName');
        Route::get('/profile/appearance', [AppearanceController::class, 'index'])->name('logistic.profile.appearance');
        Route::patch('/profile/appearance', [AppearanceController::class, 'update'])->name('logistic.profile.appearance.update');
        Route::get('/profile/help', [ProfileController::class, 'help'])->name('logistic.profile.help');
        Route::get('/profile/logout', [ProfileController::class, 'logoutPage'])->name('logistic.profile.logout.page');
        
        // Logistic Email Change routes (modal-based)
        Route::post('/profile/email-change/send-otp', [EmailChangeController::class, 'sendOtp'])->name('logistic.profile.email-change.send-otp');
        Route::get('/profile/email-change/verify/{requestId}', [EmailChangeController::class, 'showVerify'])->name('logistic.profile.email-change.verify');
        Route::post('/profile/email-change/verify/{requestId}', [EmailChangeController::class, 'verifyOtp'])->name('logistic.profile.email-change.verify-otp');
        Route::post('/profile/email-change/resend/{requestId}', [EmailChangeController::class, 'resendOtp'])->name('logistic.profile.email-change.resend');
        Route::post('/profile/email-change/cancel/{requestId}', [EmailChangeController::class, 'cancel'])->name('logistic.profile.email-change.cancel');
        
        // Logistic Phone Change routes (modal-based)
        Route::post('/profile/phone-change/send-otp', [PhoneChangeController::class, 'sendOtp'])->name('logistic.profile.phone-change.send-otp');
        Route::get('/profile/phone-change/verify/{requestId}', [PhoneChangeController::class, 'showVerify'])->name('logistic.profile.phone-change.verify');
        Route::post('/profile/phone-change/verify/{requestId}', [PhoneChangeController::class, 'verifyOtp'])->name('logistic.profile.phone-change.verify-otp');
        Route::post('/profile/phone-change/resend/{requestId}', [PhoneChangeController::class, 'resendOtp'])->name('logistic.profile.phone-change.resend');
        Route::post('/profile/phone-change/cancel/{requestId}', [PhoneChangeController::class, 'cancel'])->name('logistic.profile.phone-change.cancel');
        
        // Notification routes
        Route::get('/notifications', [LogisticNotificationController::class, 'index'])->name('logistic.notifications.index');
        Route::post('/notifications/mark-read', [LogisticNotificationController::class, 'markRead'])->name('logistic.notifications.markRead');
        Route::post('/notifications/mark-all-read', [LogisticNotificationController::class, 'markAllRead'])->name('logistic.notifications.markAllRead');
    });

    // Member routes
    Route::prefix('/member')->middleware(['role:member'])->group(function () {
        Route::get('/dashboard', [MemberController::class, 'dashboard'])->name('member.dashboard');
        Route::get('/available-stocks', [MemberController::class, 'availableStocks'])->name('member.availableStocks');
        Route::get('/all-stocks', [MemberController::class, 'allStocks'])->name('member.allStocks');
        Route::get('/sold-stocks', [MemberController::class, 'soldStocks'])->name('member.soldStocks');
        Route::get('/partial-stocks', [MemberController::class, 'partialStocks'])->name('member.partialStocks');
        Route::get('/assigned-stocks', [MemberController::class, 'assignedStocks'])->name('member.assignedStocks');
        Route::get('/revenue-report', [MemberController::class, 'generateRevenueReport'])->name('member.revenueReport');
        
        // Member Profile routes
        Route::get('/profile/info', [ProfileController::class, 'profile'])->name('member.profile.info');
        Route::get('/profile/password', [ProfileController::class, 'password'])->name('member.profile.password');
        Route::patch('/profile/name', [ProfileController::class, 'updateName'])->name('member.profile.updateName');
        Route::get('/profile/appearance', [AppearanceController::class, 'index'])->name('member.profile.appearance');
        Route::patch('/profile/appearance', [AppearanceController::class, 'update'])->name('member.profile.appearance.update');
        Route::get('/profile/help', [ProfileController::class, 'help'])->name('member.profile.help');
        Route::get('/profile/logout', [ProfileController::class, 'logoutPage'])->name('member.profile.logout.page');
        
        // Member Email Change routes removed - members don't need email functionality
        
        // Member Phone Change routes (modal-based)
        Route::post('/profile/phone-change/send-otp', [PhoneChangeController::class, 'sendOtp'])->name('member.profile.phone-change.send-otp');
        Route::get('/profile/phone-change/verify/{requestId}', [PhoneChangeController::class, 'showVerify'])->name('member.profile.phone-change.verify');
        Route::post('/profile/phone-change/verify/{requestId}', [PhoneChangeController::class, 'verifyOtp'])->name('member.profile.phone-change.verify-otp');
        Route::post('/profile/phone-change/resend/{requestId}', [PhoneChangeController::class, 'resendOtp'])->name('member.profile.phone-change.resend');
        Route::post('/profile/phone-change/cancel/{requestId}', [PhoneChangeController::class, 'cancel'])->name('member.profile.phone-change.cancel');
        
        // Notification routes
        Route::get('/notifications', [MemberNotificationController::class, 'index'])->name('member.notifications.index');
        Route::post('/notifications/mark-read', [MemberNotificationController::class, 'markRead'])->name('member.notifications.markRead');
        Route::post('/notifications/mark-all-read', [MemberNotificationController::class, 'markAllRead'])->name('member.notifications.markAllRead');
    });
});

// Email Preview routes (for development/testing)
Route::prefix('email-preview')->name('email.preview.')->group(function () {
    Route::get('/', [EmailPreviewController::class, 'index'])->name('index');
    Route::get('/approval', [EmailPreviewController::class, 'approval'])->name('approval');
    Route::get('/rejection', [EmailPreviewController::class, 'rejection'])->name('rejection');
    Route::get('/approval/custom', [EmailPreviewController::class, 'approvalCustom'])->name('approval.custom');
    Route::get('/rejection/custom', [EmailPreviewController::class, 'rejectionCustom'])->name('rejection.custom');
    Route::get('/types', [EmailPreviewController::class, 'types'])->name('types');
    Route::get('/{type}', [EmailPreviewController::class, 'preview'])->name('type');
});

// Comprehensive Email Preview routes
Route::prefix('comprehensive-email-preview')->name('comprehensive.')->group(function () {
    Route::get('/', [ComprehensiveEmailPreviewController::class, 'index'])->name('index');
    Route::get('/types', [ComprehensiveEmailPreviewController::class, 'types'])->name('types');
    Route::get('/{type}', [ComprehensiveEmailPreviewController::class, 'preview'])->name('preview');
});

// Direct Email Template routes (shows actual templates directly)
Route::prefix('direct-email-templates')->name('direct.')->group(function () {
    Route::get('/', [DirectEmailTemplateController::class, 'index'])->name('templates');
    Route::get('/{type}', [DirectEmailTemplateController::class, 'show'])->name('template');
});

// Auth routes
Route::get('/auth', function () {
    return redirect()->route('login');
})->name('auth');

// CSRF token route for AJAX requests
Route::get('/csrf-token', function () {
    return response()->json(['csrf_token' => csrf_token()]);
});


require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';