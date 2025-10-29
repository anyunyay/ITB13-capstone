import React, { useState } from 'react';
import { TranslatedPage, commonPageActions, TranslatedCard } from '@/components/pages/TranslatedPage';
import { TranslatedTable } from '@/components/tables/TranslatedTable';
import { TranslatedForm } from '@/components/forms/TranslatedForm';
import { useTranslation } from '@/hooks/useTranslation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

/**
 * Example of a fully translated inventory page
 * Shows how to apply translations to all page elements
 */
export function TranslatedInventoryPage() {
    const { t } = useTranslation();
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({});
    const [processing, setProcessing] = useState(false);

    // Sample data - in real app this would come from props or API
    const products = [
        {
            id: 1,
            name: 'Tomatoes',
            category: 'Vegetables',
            price: 50.00,
            stock: 100,
            status: 'In Stock'
        },
        {
            id: 2,
            name: 'Carrots',
            category: 'Vegetables',
            price: 30.00,
            stock: 5,
            status: 'Low Stock'
        },
        {
            id: 3,
            name: 'Lettuce',
            category: 'Vegetables',
            price: 25.00,
            stock: 0,
            status: 'Out of Stock'
        }
    ];

    // Table columns with translation keys
    const columns = [
        {
            key: 'name',
            labelKey: 'inventory.product_name'
        },
        {
            key: 'category',
            labelKey: 'inventory.category'
        },
        {
            key: 'price',
            labelKey: 'common.price',
            render: (value: number) => `₱${value.toFixed(2)}`
        },
        {
            key: 'stock',
            labelKey: 'inventory.stock_quantity'
        },
        {
            key: 'status',
            labelKey: 'common.status'
        }
    ];

    // Table actions with translation keys
    const actions = [
        {
            key: 'edit',
            labelKey: 'common.edit',
            variant: 'outline' as const,
            onClick: (row: any) => console.log('Edit', row)
        },
        {
            key: 'delete',
            labelKey: 'common.delete',
            variant: 'destructive' as const,
            onClick: (row: any) => console.log('Delete', row)
        }
    ];

    // Form fields with translation keys
    const formFields = [
        {
            key: 'name',
            type: 'text' as const,
            labelKey: 'inventory.product_name',
            placeholderKey: 'inventory.product_name',
            required: true
        },
        {
            key: 'description',
            type: 'textarea' as const,
            labelKey: 'inventory.product_description',
            placeholderKey: 'inventory.product_description'
        },
        {
            key: 'category',
            type: 'select' as const,
            labelKey: 'inventory.category',
            required: true,
            options: [
                { value: 'vegetables', labelKey: 'categories.vegetables' },
                { value: 'fruits', labelKey: 'categories.fruits' },
                { value: 'grains', labelKey: 'categories.grains' }
            ]
        },
        {
            key: 'price',
            type: 'number' as const,
            labelKey: 'common.price',
            required: true,
            validation: { min: 0 }
        },
        {
            key: 'stock',
            type: 'number' as const,
            labelKey: 'inventory.stock_quantity',
            required: true,
            validation: { min: 0 }
        }
    ];

    // Page actions
    const pageActions = [
        commonPageActions.add(() => setShowAddForm(true)),
        commonPageActions.export(() => console.log('Export')),
        commonPageActions.filter(() => console.log('Filter'))
    ];

    // Breadcrumbs
    const breadcrumbs = [
        { labelKey: 'nav.dashboard', href: '/admin/dashboard' },
        { labelKey: 'nav.inventory' }
    ];

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        
        // Simulate API call
        setTimeout(() => {
            setProcessing(false);
            setShowAddForm(false);
            setFormData({});
        }, 2000);
    };

    const handleFormChange = (key: string, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    return (
        <TranslatedPage
            titleKey="inventory.title"
            descriptionKey="inventory.description"
            breadcrumbs={breadcrumbs}
            actions={pageActions}
        >
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <TranslatedCard titleKey="inventory.total_products">
                    <div className="text-2xl font-bold">{products.length}</div>
                </TranslatedCard>
                
                <TranslatedCard titleKey="inventory.in_stock">
                    <div className="text-2xl font-bold text-green-600">
                        {products.filter(p => p.status === 'In Stock').length}
                    </div>
                </TranslatedCard>
                
                <TranslatedCard titleKey="inventory.low_stock">
                    <div className="text-2xl font-bold text-yellow-600">
                        {products.filter(p => p.status === 'Low Stock').length}
                    </div>
                </TranslatedCard>
                
                <TranslatedCard titleKey="inventory.out_of_stock">
                    <div className="text-2xl font-bold text-red-600">
                        {products.filter(p => p.status === 'Out of Stock').length}
                    </div>
                </TranslatedCard>
            </div>

            {/* Products Table */}
            <TranslatedCard titleKey="inventory.products">
                <TranslatedTable
                    columns={columns}
                    data={products}
                    actions={actions}
                    emptyMessageKey="inventory.no_products"
                />
            </TranslatedCard>

            {/* Add Product Dialog */}
            <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{t('inventory.add_product')}</DialogTitle>
                    </DialogHeader>
                    
                    <TranslatedForm
                        fields={formFields}
                        data={formData}
                        processing={processing}
                        onSubmit={handleFormSubmit}
                        onChange={handleFormChange}
                        submitButtonKey="inventory.add_product"
                        onCancel={() => setShowAddForm(false)}
                    />
                </DialogContent>
            </Dialog>
        </TranslatedPage>
    );
}