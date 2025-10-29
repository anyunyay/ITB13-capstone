# System-Wide Translation Implementation Guide

This guide shows how to apply the language change functionality to every page throughout the entire system so all text updates according to the selected language.

## 🎯 **Implementation Strategy**

### **Phase 1: Core Components (Immediate Impact)**
1. **Navigation menus** - Sidebar, header, breadcrumbs
2. **Common buttons** - Save, Cancel, Delete, Edit, Add
3. **Status indicators** - Active, Pending, Completed
4. **Form labels** - Name, Email, Password, etc.

### **Phase 2: Page Structure (High Impact)**
1. **Page titles and headers**
2. **Table headers and content**
3. **Form placeholders and validation**
4. **Error and success messages**

### **Phase 3: Content Areas (Complete Coverage)**
1. **Dashboard statistics and widgets**
2. **Detailed descriptions and help text**
3. **Dynamic content and notifications**
4. **Reports and exports**

## 🔧 **Implementation Methods**

### **Method 1: Use Pre-built Translated Components**

Replace existing components with translated versions:

```typescript
// Before
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

// After
import { SmartButton } from '@/components/ui/smart-button';
import { SmartLabel } from '@/components/ui/smart-label';
```

### **Method 2: Use Page Wrappers**

Wrap entire pages with translation-aware components:

```typescript
import { TranslatedPage } from '@/components/pages/TranslatedPage';

export function InventoryPage() {
    return (
        <TranslatedPage
            titleKey="inventory.title"
            descriptionKey="inventory.description"
            breadcrumbs={[
                { labelKey: 'nav.dashboard', href: '/dashboard' },
                { labelKey: 'nav.inventory' }
            ]}
        >
            {/* Page content */}
        </TranslatedPage>
    );
}
```

### **Method 3: Use Translation Hooks**

Add translations to existing components:

```typescript
import { useTranslation } from '@/hooks/useTranslation';

export function ExistingComponent() {
    const { t, auto, common } = useTranslation();
    
    return (
        <div>
            <h1>{t('page.title', 'Default Title')}</h1>
            <Button>{auto('Save')}</Button>
            <p>{common.loading()}</p>
        </div>
    );
}
```

## 📁 **File-by-File Implementation**

### **1. Navigation Components**

Update all navigation menus:

```typescript
// resources/js/layouts/sidebar.tsx
import { TranslatedNavigation } from '@/components/navigation/TranslatedNavigation';

export function Sidebar({ userType }: { userType: string }) {
    return (
        <aside className="w-64 border-r">
            <TranslatedNavigation userType={userType} />
        </aside>
    );
}
```

### **2. Dashboard Pages**

Apply to all dashboard pages:

```typescript
// resources/js/pages/Admin/dashboard.tsx
import { TranslatedPage, TranslatedCard } from '@/components/pages/TranslatedPage';
import { useTranslation } from '@/hooks/useTranslation';

export function AdminDashboard() {
    const { t } = useTranslation();
    
    return (
        <TranslatedPage titleKey="dashboard.title">
            <div className="grid grid-cols-4 gap-6">
                <TranslatedCard titleKey="dashboard.total_orders">
                    <div className="text-2xl font-bold">150</div>
                </TranslatedCard>
                {/* More cards */}
            </div>
        </TranslatedPage>
    );
}
```

### **3. Inventory Pages**

Apply to inventory management:

```typescript
// resources/js/pages/Admin/Inventory/index.tsx
import { TranslatedTable } from '@/components/tables/TranslatedTable';
import { TranslatedPage } from '@/components/pages/TranslatedPage';

export function InventoryIndex() {
    const columns = [
        { key: 'name', labelKey: 'inventory.product_name' },
        { key: 'price', labelKey: 'common.price' },
        { key: 'stock', labelKey: 'inventory.stock_quantity' },
        { key: 'status', labelKey: 'common.status' }
    ];
    
    return (
        <TranslatedPage titleKey="inventory.title">
            <TranslatedTable columns={columns} data={products} />
        </TranslatedPage>
    );
}
```

### **4. Order Management**

Apply to order pages:

```typescript
// resources/js/pages/Admin/Orders/index.tsx
import { TranslatedPage } from '@/components/pages/TranslatedPage';
import { TranslatedTable } from '@/components/tables/TranslatedTable';

export function OrdersIndex() {
    const columns = [
        { key: 'order_number', labelKey: 'orders.order_number' },
        { key: 'customer', labelKey: 'orders.customer' },
        { key: 'total', labelKey: 'orders.total_amount' },
        { key: 'status', labelKey: 'orders.order_status' }
    ];
    
    return (
        <TranslatedPage titleKey="orders.title">
            <TranslatedTable columns={columns} data={orders} />
        </TranslatedPage>
    );
}
```

### **5. Forms and Modals**

Apply to all forms:

```typescript
// resources/js/pages/Admin/Inventory/create.tsx
import { TranslatedForm } from '@/components/forms/TranslatedForm';

export function CreateProduct() {
    const fields = [
        { key: 'name', type: 'text', labelKey: 'inventory.product_name', required: true },
        { key: 'price', type: 'number', labelKey: 'common.price', required: true },
        { key: 'category', type: 'select', labelKey: 'inventory.category', options: [...] }
    ];
    
    return (
        <TranslatedForm
            titleKey="inventory.add_product"
            fields={fields}
            data={formData}
            onSubmit={handleSubmit}
            onChange={handleChange}
        />
    );
}
```

## 🔄 **Migration Process**

### **Step 1: Identify Pages to Migrate**

Create a list of all pages in your application:

```
Admin Pages:
- /admin/dashboard
- /admin/inventory
- /admin/orders
- /admin/sales
- /admin/membership
- /admin/logistics
- /admin/staff

Customer Pages:
- /customer/home
- /customer/products
- /customer/cart
- /customer/orders
- /customer/profile

Member Pages:
- /member/dashboard
- /member/stocks
- /member/transactions

Logistic Pages:
- /logistic/dashboard
- /logistic/orders
```

### **Step 2: Prioritize by Impact**

1. **High Impact**: Navigation, Dashboard, Common Actions
2. **Medium Impact**: List pages, Form labels
3. **Low Impact**: Detailed descriptions, Help text

### **Step 3: Apply Translations Systematically**

For each page:

1. **Replace page wrapper**:
   ```typescript
   // Before
   <div>
       <h1>Page Title</h1>
       {content}
   </div>
   
   // After
   <TranslatedPage titleKey="page.title">
       {content}
   </TranslatedPage>
   ```

2. **Replace tables**:
   ```typescript
   // Before
   <table>
       <thead>
           <tr>
               <th>Name</th>
               <th>Status</th>
           </tr>
       </thead>
   </table>
   
   // After
   <TranslatedTable
       columns={[
           { key: 'name', labelKey: 'common.name' },
           { key: 'status', labelKey: 'common.status' }
       ]}
       data={data}
   />
   ```

3. **Replace forms**:
   ```typescript
   // Before
   <form>
       <label>Name</label>
       <input />
       <button>Save</button>
   </form>
   
   // After
   <TranslatedForm
       fields={[
           { key: 'name', type: 'text', labelKey: 'common.name' }
       ]}
       submitButtonKey="common.save"
   />
   ```

## 📊 **Progress Tracking**

### **Translation Coverage Checklist**

- [ ] **Navigation** (Sidebar, Header, Breadcrumbs)
- [ ] **Dashboard Pages** (All user types)
- [ ] **Inventory Management** (Products, Stock, Categories)
- [ ] **Order Management** (Orders, Status, Actions)
- [ ] **Sales & Reports** (Statistics, Exports)
- [ ] **User Management** (Customers, Members, Staff, Logistics)
- [ ] **Profile Pages** (Settings, Appearance, Help)
- [ ] **Authentication** (Login, Register, Password Reset)
- [ ] **Forms & Validation** (All input forms)
- [ ] **Error Pages** (404, 403, 500)

### **Component Migration Checklist**

- [ ] **Buttons** → `SmartButton`
- [ ] **Labels** → `SmartLabel`
- [ ] **Tables** → `TranslatedTable`
- [ ] **Forms** → `TranslatedForm`
- [ ] **Pages** → `TranslatedPage`
- [ ] **Cards** → `TranslatedCard`
- [ ] **Navigation** → `TranslatedNavigation`

## 🧪 **Testing Translation Coverage**

### **Automated Testing**

Create a test to verify translation coverage:

```typescript
// resources/js/test/translationCoverage.test.ts
import { render, screen } from '@testing-library/react';
import { TranslationProvider } from '@/components/providers/TranslationProvider';

describe('Translation Coverage', () => {
    test('all pages have translated titles', () => {
        // Test each page component
        const pages = [DashboardPage, InventoryPage, OrdersPage];
        
        pages.forEach(PageComponent => {
            render(
                <TranslationProvider>
                    <PageComponent />
                </TranslationProvider>
            );
            
            // Verify no untranslated text remains
            expect(screen.queryByText(/^[A-Z][a-z\s]+$/)).toBeNull();
        });
    });
});
```

### **Manual Testing**

1. **Switch Language**: Go to Profile > Appearance, switch to Tagalog
2. **Navigate Pages**: Visit each page and verify text is translated
3. **Test Actions**: Click buttons, submit forms, check messages
4. **Check Tables**: Verify headers and status values are translated
5. **Test Forms**: Check labels, placeholders, validation messages

## 🎯 **Expected Results**

After full implementation:

1. **Language Selector**: Changes language across entire system
2. **Navigation**: All menu items translate automatically
3. **Page Titles**: All page headers show in selected language
4. **Tables**: Headers and status values translate
5. **Forms**: Labels, placeholders, and validation translate
6. **Buttons**: All action buttons show translated text
7. **Messages**: Success/error messages appear in selected language
8. **Status**: All status indicators translate (Active → Aktibo)

## 🚀 **Deployment Strategy**

### **Phase 1: Core Infrastructure (Week 1)**
- Deploy translation system and language selector
- Update navigation components
- Apply to dashboard pages

### **Phase 2: Major Pages (Week 2)**
- Update inventory management
- Update order management
- Update user management

### **Phase 3: Forms and Details (Week 3)**
- Update all forms
- Update detailed pages
- Update reports and exports

### **Phase 4: Polish and Testing (Week 4)**
- Complete remaining pages
- Comprehensive testing
- Performance optimization

The system will provide complete language coverage across all pages while maintaining existing functionality and designs.