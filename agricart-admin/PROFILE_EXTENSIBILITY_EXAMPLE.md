# Profile System Extensibility Example

## Adding a New User Type: "Supplier"

This example demonstrates how easy it is to add a new user type to the refactored profile system.

## Step 1: Update Route Configuration

**File**: `resources/js/lib/utils.ts`

```typescript
export const getProfileRoutes = (userType: string) => {
    const baseRoute = userType === 'customer' ? '/customer' : 
                     userType === 'admin' || userType === 'staff' ? '/admin' :
                     userType === 'logistic' ? '/logistic' :
                     userType === 'member' ? '/member' :
                     userType === 'supplier' ? '/supplier' :  // ← Add this
                     '/customer';
    
    return {
        profile: `${baseRoute}/profile`,
        profileInfo: `${baseRoute}/profile/info`,
        password: `${baseRoute}/profile/password`,
        appearance: `${baseRoute}/profile/appearance`,
        help: `${baseRoute}/profile/help`,
        logout: `${baseRoute}/profile/logout`,
        logoutPage: `${baseRoute}/profile/logout`,
        addresses: `${baseRoute}/profile/addresses`,
        systemLogs: userType === 'admin' || userType === 'staff' ? '/admin/system-logs' : null,
        // Add supplier-specific routes
        inventory: userType === 'supplier' ? `${baseRoute}/inventory` : null,
        orders: userType === 'supplier' ? `${baseRoute}/orders` : null,
    };
};
```

## Step 2: Update Feature Access

**File**: `resources/js/lib/utils.ts`

```typescript
export const hasFeatureAccess = (userType: string, feature: string): boolean => {
    const accessMap: Record<string, string[]> = {
        'system_logs': ['admin', 'staff'],
        'address_management': ['customer'],
        'help_center': ['customer', 'admin', 'staff', 'logistic', 'member', 'supplier'], // ← Add
        'password_change': ['admin', 'staff', 'customer', 'logistic', 'member', 'supplier'], // ← Add
        'appearance_settings': ['admin', 'staff', 'customer', 'logistic', 'member', 'supplier'], // ← Add
        'logout': ['admin', 'staff', 'customer', 'logistic', 'member', 'supplier'], // ← Add
        // Add supplier-specific features
        'supplier_inventory': ['supplier'],
        'supplier_orders': ['supplier'],
        'supplier_analytics': ['supplier'],
    };
    
    return accessMap[feature]?.includes(userType) ?? false;
};
```

## Step 3: Add Supplier Tools

**File**: `resources/js/components/profile/config/profile-tools.config.ts`

```typescript
import { 
    Database, 
    MapPin, 
    Key, 
    Palette, 
    HelpCircle, 
    LogOut,
    Package,      // ← Add for inventory
    ShoppingBag,  // ← Add for orders
    BarChart3     // ← Add for analytics
} from 'lucide-react';

export const getProfileTools = (userType: string, t: (key: string) => string): ProfileTool[] => {
    const routes = getProfileRoutes(userType);
    const tools: ProfileTool[] = [];

    // ... existing tools ...

    // Supplier-specific tools
    if (hasFeatureAccess(userType, 'supplier_inventory') && routes.inventory) {
        tools.push({
            id: 'supplier_inventory',
            icon: Package,
            label: t('ui.inventory_management'),
            description: t('ui.manage_your_products'),
            route: routes.inventory,
            iconColor: 'text-primary',
        });
    }

    if (hasFeatureAccess(userType, 'supplier_orders') && routes.orders) {
        tools.push({
            id: 'supplier_orders',
            icon: ShoppingBag,
            label: t('ui.order_management'),
            description: t('ui.view_manage_orders'),
            route: routes.orders,
            iconColor: 'text-primary',
        });
    }

    if (hasFeatureAccess(userType, 'supplier_analytics') && routes.analytics) {
        tools.push({
            id: 'supplier_analytics',
            icon: BarChart3,
            label: t('ui.analytics'),
            description: t('ui.view_sales_analytics'),
            route: routes.analytics,
            iconColor: 'text-primary',
        });
    }

    // ... rest of existing tools ...

    return tools;
};
```

## Step 4: Add Translation Keys

**File**: `resources/js/translations/en.json`

```json
{
    "supplier": {
        "supplier": "Supplier"
    },
    "ui": {
        "supplier_tools": "Supplier Tools",
        "access_supplier_features": "Access supplier management features",
        "inventory_management": "Inventory Management",
        "manage_your_products": "Manage your product inventory",
        "order_management": "Order Management",
        "view_manage_orders": "View and manage incoming orders",
        "analytics": "Analytics",
        "view_sales_analytics": "View your sales analytics and reports"
    }
}
```

**File**: `resources/js/translations/tl.json`

```json
{
    "supplier": {
        "supplier": "Supplier"
    },
    "ui": {
        "supplier_tools": "Mga Kasangkapan ng Supplier",
        "access_supplier_features": "I-access ang mga feature ng supplier",
        "inventory_management": "Pamamahala ng Imbentaryo",
        "manage_your_products": "Pamahalaan ang iyong imbentaryo ng produkto",
        "order_management": "Pamamahala ng Order",
        "view_manage_orders": "Tingnan at pamahalaan ang mga papasok na order",
        "analytics": "Analytics",
        "view_sales_analytics": "Tingnan ang iyong analytics at ulat ng benta"
    }
}
```

## Step 5: Update User Type Label

**File**: `resources/js/components/profile/ProfileHeader.tsx`

```typescript
const getUserTypeLabel = (type: string) => {
    switch (type) {
        case 'admin':
            return t('admin.administrator');
        case 'staff':
            return t('staff.staff_member');
        case 'customer':
            return t('customer.customer');
        case 'logistic':
            return t('logistic.logistics');
        case 'member':
            return t('member.member');
        case 'supplier':  // ← Add this
            return t('supplier.supplier');
        default:
            return t('ui.user');
    }
};
```

## Step 6: Create Supplier-Specific Component (Optional)

**File**: `resources/js/components/profile/SupplierDashboard.tsx`

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, TrendingUp, ShoppingBag } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

interface SupplierDashboardProps {
    user: {
        id: number;
        name: string;
        type: string;
    };
    stats?: {
        totalProducts: number;
        activeOrders: number;
        monthlyRevenue: number;
    };
}

export function SupplierDashboard({ user, stats }: SupplierDashboardProps) {
    const t = useTranslation();

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('ui.supplier_dashboard')}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <Package className="h-8 w-8 text-primary" />
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    {t('ui.total_products')}
                                </p>
                                <p className="text-2xl font-bold">
                                    {stats?.totalProducts || 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <ShoppingBag className="h-8 w-8 text-primary" />
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    {t('ui.active_orders')}
                                </p>
                                <p className="text-2xl font-bold">
                                    {stats?.activeOrders || 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <TrendingUp className="h-8 w-8 text-primary" />
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    {t('ui.monthly_revenue')}
                                </p>
                                <p className="text-2xl font-bold">
                                    ₱{stats?.monthlyRevenue?.toLocaleString() || 0}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
```

## Step 7: Use in Profile Page

**File**: `resources/js/pages/Profile/profile-refactored.tsx`

```typescript
import { SupplierDashboard } from '@/components/profile/SupplierDashboard';

export default function ProfilePage() {
    const { user, supplierStats } = usePage<PageProps>().props;
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const t = useTranslation();

    const profileTools = getProfileTools(user?.type || 'customer', t);

    return (
        <ProfileWrapper title={t('ui.profile_information')}>
            <div className="space-y-6">
                <ProfileHeader 
                    user={user} 
                    onEditClick={() => setIsEditModalOpen(true)} 
                />

                {/* Supplier-specific dashboard */}
                {user.type === 'supplier' && (
                    <SupplierDashboard 
                        user={user} 
                        stats={supplierStats} 
                    />
                )}

                <ProfileDetailsCard 
                    user={user} 
                    maskPhone={maskPhone} 
                />

                {user?.type && profileTools.length > 0 && (
                    <ProfileToolsCard 
                        userType={user.type}
                        tools={profileTools}
                    />
                )}
            </div>

            <ProfileEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                user={user}
            />
        </ProfileWrapper>
    );
}
```

## Step 8: Update Backend (Laravel)

### Add Route

**File**: `routes/web.php`

```php
// Supplier routes
Route::middleware(['auth', 'verified', 'user.type:supplier'])->prefix('supplier')->name('supplier.')->group(function () {
    Route::get('/profile', [SupplierProfileController::class, 'index'])->name('profile.info');
    Route::get('/profile/password', [SupplierProfileController::class, 'password'])->name('profile.password');
    Route::get('/profile/appearance', [SupplierProfileController::class, 'appearance'])->name('profile.appearance');
    Route::get('/profile/help', [SupplierProfileController::class, 'help'])->name('profile.help');
    Route::get('/profile/logout', [SupplierProfileController::class, 'logoutPage'])->name('profile.logout');
    
    // Supplier-specific routes
    Route::get('/inventory', [SupplierInventoryController::class, 'index'])->name('inventory');
    Route::get('/orders', [SupplierOrderController::class, 'index'])->name('orders');
    Route::get('/analytics', [SupplierAnalyticsController::class, 'index'])->name('analytics');
});
```

### Create Controller

**File**: `app/Http/Controllers/Supplier/SupplierProfileController.php`

```php
<?php

namespace App\Http\Controllers\Supplier;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SupplierProfileController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Get supplier-specific stats
        $supplierStats = [
            'totalProducts' => $user->products()->count(),
            'activeOrders' => $user->orders()->where('status', 'active')->count(),
            'monthlyRevenue' => $user->orders()
                ->whereMonth('created_at', now()->month)
                ->sum('total_amount'),
        ];

        return Inertia::render('Profile/profile-refactored', [
            'user' => $user,
            'supplierStats' => $supplierStats,
        ]);
    }

    // ... other methods
}
```

## Result

Now when a supplier logs in and visits their profile, they will see:

1. **ProfileHeader** - Same as all users (avatar, name, "Supplier" badge)
2. **SupplierDashboard** - Unique to suppliers (product count, orders, revenue)
3. **ProfileDetailsCard** - Same as all users (contact & account info)
4. **ProfileToolsCard** - Supplier-specific tools:
   - Inventory Management
   - Order Management
   - Analytics
   - Password Change
   - Appearance Settings
   - Help & Support
   - Logout

## Benefits Demonstrated

### ✅ No Code Duplication
- Reused ProfileHeader, ProfileDetailsCard
- Only created supplier-specific components

### ✅ Easy Configuration
- Added 3 lines to route config
- Added 3 features to access map
- Added 3 tools to config

### ✅ Type Safety
- TypeScript ensures correct types
- Compiler catches errors early

### ✅ Maintainability
- Changes to shared components affect all user types
- Supplier-specific code is isolated

### ✅ Scalability
- Can add more user types easily
- Can add more features per type

## Time Comparison

### Old Approach (Duplicated Code)
- Create new profile page: 2-3 hours
- Copy/paste existing code
- Modify for supplier
- Test all functionality
- Fix inconsistencies

### New Approach (Refactored)
- Update configuration: 15 minutes
- Add translations: 10 minutes
- Create optional dashboard: 30 minutes
- Test: 15 minutes
- **Total: ~1 hour**

## Conclusion

The refactored profile system makes adding new user types:
- **3x faster** to implement
- **Easier to maintain** (no duplication)
- **More consistent** (shared components)
- **Type-safe** (TypeScript)
- **Scalable** (configuration-based)

This demonstrates the power of the component-based, configuration-driven architecture!
