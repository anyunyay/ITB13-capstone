import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PermissionGuard } from '@/components/common/permission-guard';
import type { SharedData } from '@/types';
import { TrendingUp } from 'lucide-react';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { useTranslation } from '@/hooks/use-translation';
import {
    TrendChart,
    TimePeriodSelector,
    DateSelector,
    ProductSelector,
    PriceCategoryToggles,
} from '@/components/admin/trends';

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

type ProductOption = { 
    name: string; 
    price_categories: string[]; 
    unit_types: string[]; 
};

interface DateRange {
    min_date: string;
    max_date: string;
}

interface PageProps {
    products: ProductOption[];
    dateRange: DateRange;
}

export default function TrendsIndex({ products, dateRange }: PageProps) {
    const t = useTranslation();
    const { auth } = usePage<SharedData>().props;
    
    // Storage key for persisting state
    const STORAGE_KEY = 'trends_page_state';
    
    // Helper function to load persisted state
    const loadPersistedState = useCallback(() => {
        try {
            const stored = sessionStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                return {
                    ...parsed,
                    startDate: parsed.startDate ? new Date(parsed.startDate) : undefined,
                    endDate: parsed.endDate ? new Date(parsed.endDate) : undefined,
                };
            }
        } catch (error) {
            console.error('Error loading persisted state:', error);
        }
        return null;
    }, [STORAGE_KEY]);
    
    const [persistedState] = useState(() => loadPersistedState());
    
    const [selectedCategory, setSelectedCategory] = useState<string>(persistedState?.selectedCategory || '');
    const [selectedProducts, setSelectedProducts] = useState<string[]>(persistedState?.selectedProducts || []);
    const [priceCategoryToggles, setPriceCategoryToggles] = useState<{
        per_kilo: boolean;
        per_tali: boolean;
        per_pc: boolean;
    }>(persistedState?.priceCategoryToggles || {
        per_kilo: true,
        per_tali: true,
        per_pc: true
    });
    const [startDate, setStartDate] = useState<Date | undefined>(persistedState?.startDate || undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(persistedState?.endDate || undefined);
    const [timePeriod, setTimePeriod] = useState<string>(persistedState?.timePeriod || 'specific');
    const [dateValidationError, setDateValidationError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingPriceCategories, setLoadingPriceCategories] = useState<boolean>(false);
    const [series, setSeries] = useState<any[]>(persistedState?.series || []);
    const [availableProducts, setAvailableProducts] = useState<ProductOption[]>(persistedState?.availableProducts || []);
    const [availablePriceCategories, setAvailablePriceCategories] = useState<string[]>(persistedState?.availablePriceCategories || []);
    const [productPriceCategories, setProductPriceCategories] = useState<Record<string, string[]>>(persistedState?.productPriceCategories || {});
    const [selectedMonth, setSelectedMonth] = useState<number | undefined>(persistedState?.selectedMonth);
    const [selectedYear, setSelectedYear] = useState<number | undefined>(persistedState?.selectedYear);
    
    // Store latest data for selected products - updates based on selected products
    const [latestProductData, setLatestProductData] = useState<Record<string, any>>(persistedState?.latestProductData || {});

    // Define product categories
    const fruitProducts = ['Pakwan', 'Mais'];
    const vegetableProducts = ['Ampalaya', 'Kalabasa', 'Sitaw', 'Talong', 'Pipino', 'Pechay', 'Siling Labuyo', 'Siling Haba', 'Kamatis', 'Tanglad', 'Talbos ng Kamote', 'Alugbati', 'Kangkong'];

    // Fetch latest data for selected products
    const fetchLatestProductData = useCallback(async () => {
        if (selectedProducts.length === 0) {
            setLatestProductData({});
            return;
        }

        try {
            const params = new URLSearchParams();
            selectedProducts.forEach(product => {
                params.append('product_names[]', product);
            });
            
            // Get latest data for each product
            const res = await fetch(`/admin/trends/latest-data?${params.toString()}`, { 
                headers: { 'Accept': 'application/json' } 
            });
            const json = await res.json();
            
            if (json.data) {
                setLatestProductData(json.data);
            }
        } catch (error) {
            console.error('Error fetching latest product data:', error);
        }
    }, [selectedProducts]);

    // Interpolation function to fill missing data using latest available data
    const interpolateData = useCallback((data: any[], startDate: dayjs.Dayjs, endDate: dayjs.Dayjs) => {
        const currentDate = dayjs();
        
        // If no data, don't create interpolated data
        // This prevents showing data when dates are not properly filled
        if (data.length === 0) {
            return [];
        }

        // Group data by product and price category
        const groupedData = data.reduce((acc, item) => {
            const key = `${item.product} (${item.price_category || 'Unknown'})`;
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push({
                ...item,
                date: dayjs(item.timestamp)
            });
            return acc;
        }, {} as Record<string, any[]>);

        // Sort each group by date
        Object.keys(groupedData).forEach(key => {
            groupedData[key].sort((a: any, b: any) => a.date.valueOf() - b.date.valueOf());
        });

        // Find the actual start date of the data
        const actualDataStartDate = dayjs(Math.min(...data.map(item => dayjs(item.timestamp).valueOf())));

        // Generate date range
        const dateRange = [];
        let currentDateInLoop = startDate.clone();
        while (currentDateInLoop.isSameOrBefore(endDate, 'day')) {
            dateRange.push(currentDateInLoop.format('YYYY-MM-DD'));
            currentDateInLoop = currentDateInLoop.add(1, 'day');
        }

        // Create interpolated data
        const interpolatedData = dateRange.map(date => {
            const dataPoint: any = { 
                timestamp: date, 
                isMoreThanOneMonth: endDate.diff(startDate, 'day') > 30 
            };

            // Interpolate data for dates in the range up to current date only
            // This ensures continuous lines even when there are gaps in data, but doesn't show future dates
            // Also don't interpolate before the actual data starts
            const dateObj = dayjs(date);
            const currentDate = dayjs();
            const shouldInterpolate = dateObj.isSameOrAfter(startDate, 'day') && 
                                    dateObj.isSameOrBefore(endDate, 'day') &&
                                    dateObj.isSameOrBefore(currentDate, 'day') &&
                                    dateObj.isSameOrAfter(actualDataStartDate, 'day');

            // Only process data for dates up to current date
            if (shouldInterpolate) {
                // Always try to find historical data first
                Object.keys(groupedData).forEach(key => {
                    const productData = groupedData[key];
                    const currentDateObj = dayjs(date);
                    
                    // Find the latest data point on or before this date
                    let latestData = null;
                    for (let i = productData.length - 1; i >= 0; i--) {
                        if (productData[i].date.isSameOrBefore(currentDateObj, 'day')) {
                            latestData = productData[i];
                            break;
                        }
                    }

                    // If no historical data found, use the latest available data from latestProductData
                    if (!latestData) {
                        const productName = key.split(' (')[0];
                        const priceCategory = key.split(' (')[1]?.replace(')', '');
                        
                        if (latestProductData[productName]) {
                            const unitType = priceCategory === 'Per Kilo' ? 'kg' : 
                                           priceCategory === 'Per Tali' ? 'tali' : 'pc';
                            const latestPrice = latestProductData[productName][`price_per_${unitType === 'kg' ? 'kg' : unitType === 'tali' ? 'tali' : 'pc'}`];
                            
                            if (latestPrice !== null && latestPrice !== undefined) {
                                dataPoint[key] = latestPrice;
                            } else {
                                dataPoint[key] = null;
                            }
                        } else {
                            dataPoint[key] = null;
                        }
                    } else {
                        // Use the historical data that was actually active on this date
                        dataPoint[key] = latestData.price;
                    }
                });

                // Also handle products that might not be in groupedData but are selected
                selectedProducts.forEach(productName => {
                    if (latestProductData[productName]) {
                        const productData = latestProductData[productName];
                        
                        // Add data for each enabled price category that doesn't already exist in groupedData
                        if (priceCategoryToggles.per_kilo && productData.price_per_kg !== null && productData.price_per_kg !== undefined) {
                            const key = `${productName} (Per Kilo)`;
                            if (!dataPoint[key]) {
                                dataPoint[key] = productData.price_per_kg;
                            }
                        }
                        if (priceCategoryToggles.per_tali && productData.price_per_tali !== null && productData.price_per_tali !== undefined) {
                            const key = `${productName} (Per Tali)`;
                            if (!dataPoint[key]) {
                                dataPoint[key] = productData.price_per_tali;
                            }
                        }
                        if (priceCategoryToggles.per_pc && productData.price_per_pc !== null && productData.price_per_pc !== undefined) {
                            const key = `${productName} (Per Piece)`;
                            if (!dataPoint[key]) {
                                dataPoint[key] = productData.price_per_pc;
                            }
                        }
                    }
                });
            }

            return dataPoint;
        });

        return interpolatedData;
    }, [latestProductData, selectedProducts, priceCategoryToggles]);

    // Filter products based on selected category
    const getFilteredProducts = (category: string) => {
        if (category === 'fruit') {
            return products.filter(p => fruitProducts.includes(p.name));
        } else if (category === 'vegetable') {
            return products.filter(p => vegetableProducts.includes(p.name));
        } else if (category === 'all') {
            return products;
        }
        return products;
    };

    // Group products by their pricing units
    const getGroupedProducts = (products: ProductOption[]) => {
        const groups: { [key: string]: ProductOption[] } = {
            'per_kilo_only': [],
            'per_tali_only': [],
            'per_pc_only': [],
            'per_kilo_tali': [],
            'per_kilo_pc': [],
            'per_tali_pc': [],
            'all_units': []
        };

        products.forEach(product => {
            const { price_categories } = product;
            const hasKilo = price_categories.includes('per_kilo');
            const hasTali = price_categories.includes('per_tali');
            const hasPc = price_categories.includes('per_pc');

            if (hasKilo && hasTali && hasPc) {
                groups.all_units.push(product);
            } else if (hasKilo && hasTali) {
                groups.per_kilo_tali.push(product);
            } else if (hasKilo && hasPc) {
                groups.per_kilo_pc.push(product);
            } else if (hasTali && hasPc) {
                groups.per_tali_pc.push(product);
            } else if (hasKilo) {
                groups.per_kilo_only.push(product);
            } else if (hasTali) {
                groups.per_tali_only.push(product);
            } else if (hasPc) {
                groups.per_pc_only.push(product);
            }
        });

        return groups;
    };

    // Get available price categories based on selected product from product data
    const getAvailablePriceCategories = (productName: string) => {
        if (!productName || productName === 'all') return ['per_kilo', 'per_tali', 'per_pc'];
        
        const product = products.find(p => p.name === productName);
        const categories = product?.price_categories || ['per_kilo', 'per_tali', 'per_pc'];
        return categories;
    };

    // Get available price categories for all products in the selected category
    const getAvailablePriceCategoriesForCategory = (category: string) => {
        if (category === 'all') return ['per_kilo', 'per_tali', 'per_pc'];
        
        const productsInCategory = getFilteredProducts(category);
        if (productsInCategory.length === 0) return [];
        
        // Combine all unique price categories from products in this category
        const allCategories = productsInCategory.flatMap(product => product.price_categories || []);
            const uniqueCategories = [...new Set(allCategories)];
            
            return uniqueCategories;
    };

    // Handle category change
    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
        setSelectedProducts([]);
        setSeries([]); // Clear chart data when category changes
        setAvailableProducts(getFilteredProducts(category));
        setProductPriceCategories({});
        
        // Get available price categories for this category
        const availableCategories = getAvailablePriceCategoriesForCategory(category);
        setAvailablePriceCategories(availableCategories);
        
        // Reset toggles based on available categories
        setPriceCategoryToggles({
            per_kilo: availableCategories.includes('per_kilo'),
            per_tali: availableCategories.includes('per_tali'),
            per_pc: availableCategories.includes('per_pc')
        });
    };

    // Handle product selection change
    const handleProductSelectionChange = (productName: string, checked: boolean) => {
        let newSelectedProducts;
        if (checked) {
            if (selectedProducts.length >= 3) {
                return; // Max 3 products
            }
            newSelectedProducts = [...selectedProducts, productName];
        } else {
            newSelectedProducts = selectedProducts.filter(p => p !== productName);
        }
        
        setSelectedProducts(newSelectedProducts);
        
        // Get price categories for selected products
        if (newSelectedProducts.length > 0) {
            const productCategories: Record<string, string[]> = {};
            for (const productName of newSelectedProducts) {
                const categories = getAvailablePriceCategories(productName);
                productCategories[productName] = categories;
            }
            setProductPriceCategories(productCategories);
            
            // Update available price categories based on selected products
            const allCategories = Object.values(productCategories).flat();
            const uniqueCategories = [...new Set(allCategories)];
            setAvailablePriceCategories(uniqueCategories);
            
            // Set toggles based on available categories for selected products
            const commonCategories = uniqueCategories;
            
            if (newSelectedProducts.length === 1) {
                // Single product: show all available categories, allow toggling off
                const newToggles = {
                    per_kilo: commonCategories.includes('per_kilo'),
                    per_tali: commonCategories.includes('per_tali'),
                    per_pc: commonCategories.includes('per_pc')
                };
                setPriceCategoryToggles(newToggles);
            } else if (newSelectedProducts.length >= 2) {
                // Multiple products: only allow one category to be selected
                // Find the first available category and enable only that one
                const firstAvailableCategory = commonCategories.find(cat => 
                    cat === 'per_kilo' || cat === 'per_tali' || cat === 'per_pc'
                );
                
                const newToggles = {
                    per_kilo: firstAvailableCategory === 'per_kilo',
                    per_tali: firstAvailableCategory === 'per_tali',
                    per_pc: firstAvailableCategory === 'per_pc'
                };
                setPriceCategoryToggles(newToggles);
            }
        } else {
            setAvailablePriceCategories([]);
            setPriceCategoryToggles({
                per_kilo: true,
                per_tali: true,
                per_pc: true
            });
        }
    };

    // Convert time period selections to date ranges
    const getDateRangeFromTimePeriod = () => {
        if (timePeriod === 'specific') {
            // For specific time period, require both start and end dates
            if (!startDate || !endDate) {
                return { startDate: undefined, endDate: undefined };
            }
            return {
                startDate: dayjs(startDate).format('YYYY-MM-DD'),
                endDate: dayjs(endDate).format('YYYY-MM-DD')
            };
        } else if (timePeriod === 'monthly' && selectedMonth !== undefined && selectedYear !== undefined) {
            const startOfMonth = dayjs().year(selectedYear).month(selectedMonth).startOf('month');
            const endOfMonth = dayjs().year(selectedYear).month(selectedMonth).endOf('month');
            return {
                startDate: startOfMonth.format('YYYY-MM-DD'),
                endDate: endOfMonth.format('YYYY-MM-DD')
            };
        } else if (timePeriod === 'yearly' && selectedYear !== undefined) {
            const startOfYear = dayjs().year(selectedYear).startOf('year');
            const endOfYear = dayjs().year(selectedYear).endOf('year');
            return {
                startDate: startOfYear.format('YYYY-MM-DD'),
                endDate: endOfYear.format('YYYY-MM-DD')
            };
        }
        return { startDate: undefined, endDate: undefined };
    };

    // Handle time period change to clear previous data
    const handleTimePeriodChange = (newTimePeriod: 'specific' | 'monthly' | 'yearly') => {
        setTimePeriod(newTimePeriod);
        setDateValidationError(''); // Clear any date validation errors when switching time periods
        
        // Clear previous trend data when switching to monthly or yearly, but keep selected products
        if (newTimePeriod === 'monthly' || newTimePeriod === 'yearly') {
            setSeries([]);
            // Keep selectedProducts - don't clear them
            setProductPriceCategories({});
            setAvailablePriceCategories([]);
            setPriceCategoryToggles({
                per_kilo: true,
                per_tali: true,
                per_pc: true
            });
        }
        
        // Reset date selections when switching time periods
        if (newTimePeriod === 'specific') {
            setSelectedMonth(undefined);
            setSelectedYear(undefined);
        } else if (newTimePeriod === 'monthly') {
            setStartDate(undefined);
            setEndDate(undefined);
            setSelectedYear(undefined);
        } else if (newTimePeriod === 'yearly') {
            setStartDate(undefined);
            setEndDate(undefined);
            setSelectedMonth(undefined);
        }
    };

    // Validate dates when specific time period is selected
    const validateDates = () => {
        if (timePeriod === 'specific') {
            // Only validate if both dates are selected
            if (startDate && endDate) {
                const today = dayjs();
                
                // Check if start date is in the future
                if (dayjs(startDate).isAfter(today, 'day')) {
                    setDateValidationError(t('admin.start_date_cannot_be_future'));
                    return false;
                }
                
                // Check if end date is in the future
                if (dayjs(endDate).isAfter(today, 'day')) {
                    setDateValidationError(t('admin.end_date_cannot_be_future'));
                    return false;
                }
                
                // Check if start date is after end date
                if (dayjs(startDate).isAfter(dayjs(endDate))) {
                    setDateValidationError(t('admin.start_date_cannot_after_end'));
                    return false;
                }
                
                // Clear error if dates are valid
                setDateValidationError('');
                return true;
            }
            // If only one date is selected, don't show error yet
            // Only show error when trying to load data without both dates
            return false;
        }
        setDateValidationError('');
        return true;
    };

    // Handle clear filters
    const handleClearFilters = () => {
        // Clear all filters and reset to default state
        setSelectedCategory('');
        setSelectedProducts([]);
        setPriceCategoryToggles({
            per_kilo: true,
            per_tali: true,
            per_pc: true
        });
        setStartDate(undefined);
        setEndDate(undefined);
        setTimePeriod('specific');
        setSelectedMonth(undefined);
        setSelectedYear(undefined);
        setSeries([]);
        setAvailableProducts(products);
        setAvailablePriceCategories(['per_kilo', 'per_tali', 'per_pc']);
        setProductPriceCategories({});
        setLatestProductData({});
        setDateValidationError('');
        
        // Clear persisted state
        try {
            sessionStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.error('Error clearing persisted state:', error);
        }
    };

    // Handle price category toggle
    const handlePriceCategoryToggle = (category: keyof typeof priceCategoryToggles) => {
        if (selectedProducts.length === 1) {
            // Single product: allow toggling any available category, but prevent turning off the last one
            const currentToggles = { ...priceCategoryToggles };
            const newToggles = {
                ...currentToggles,
                [category]: !currentToggles[category]
            };
            
            // Check if this would result in no toggles being active
            const activeToggles = Object.values(newToggles).filter(Boolean).length;
            if (activeToggles === 0) {
                // Don't allow turning off the last toggle
                return;
            }
            
            setPriceCategoryToggles(newToggles);
        } else if (selectedProducts.length >= 2) {
            // Multiple products: only allow one category to be selected at a time
            // Check if trying to turn off the only active toggle
            const currentActiveToggles = Object.values(priceCategoryToggles).filter(Boolean).length;
            if (currentActiveToggles === 1 && priceCategoryToggles[category]) {
                // Don't allow turning off the last toggle
                return;
            }
            
            setPriceCategoryToggles({
                per_kilo: category === 'per_kilo' ? !priceCategoryToggles.per_kilo : false,
                per_tali: category === 'per_tali' ? !priceCategoryToggles.per_tali : false,
                per_pc: category === 'per_pc' ? !priceCategoryToggles.per_pc : false
            });
        }
    };

    const loadData = useCallback(async () => {
        // Don't load if no products selected or no price categories enabled
        if (selectedProducts.length === 0 || !Object.values(priceCategoryToggles).some(toggle => toggle)) {
            setSeries([]);
            // Clear validation error when no products selected
            setDateValidationError('');
            return;
        }
        
        // Validate specific time period dates when products are selected
        if (timePeriod === 'specific') {
            const today = dayjs();
            
            // Check if both dates are provided
            if (!startDate || !endDate) {
                setDateValidationError(t('admin.select_both_dates'));
                setSeries([]);
                return;
            }
            
            // Check if start date is in the future
            if (dayjs(startDate).isAfter(today, 'day')) {
                setDateValidationError(t('admin.start_date_cannot_be_future'));
                setSeries([]);
                return;
            }
            
            // Check if end date is in the future
            if (dayjs(endDate).isAfter(today, 'day')) {
                setDateValidationError(t('admin.end_date_cannot_be_future'));
                setSeries([]);
                return;
            }
            
            // Check if start date is after end date
            if (dayjs(startDate).isAfter(dayjs(endDate))) {
                setDateValidationError(t('admin.start_date_cannot_after_end'));
                setSeries([]);
                return;
            }
            
            // Clear error if dates are valid
            setDateValidationError('');
        }
        
        // Validate time period selections before loading data
        const hasValidSpecificDates = timePeriod === 'specific' && startDate && endDate && 
            !dayjs(startDate).isBefore(dayjs('2020-01-01')) &&
            !dayjs(endDate).isBefore(dayjs('2020-01-01')) &&
            !dayjs(startDate).isAfter(dayjs(endDate));
        const hasValidMonthlySelection = timePeriod === 'monthly' && selectedMonth !== undefined && selectedYear !== undefined && 
            !dayjs().year(selectedYear).month(selectedMonth).isAfter(dayjs()) && selectedYear >= 2020;
        const hasValidYearlySelection = timePeriod === 'yearly' && selectedYear !== undefined && 
            selectedYear <= dayjs().year() && selectedYear >= 2020;
        
        if (!hasValidSpecificDates && !hasValidMonthlySelection && !hasValidYearlySelection) {
            setSeries([]);
            return; // Don't load data if validation fails
        }

        setLoading(true);
        try {
            const params = new URLSearchParams();
            
            // Add selected products
            if (selectedProducts.length > 0) {
                selectedProducts.forEach(product => {
                    params.append('product_names[]', product);
                });
            }
            
            if (selectedCategory && selectedCategory !== 'all') params.append('category', selectedCategory);
            
            // Add selected price categories
            const selectedPriceCategories = Object.entries(priceCategoryToggles)
                .filter(([_, enabled]) => enabled)
                .map(([category, _]) => category);
            
            if (selectedPriceCategories.length > 0) {
                selectedPriceCategories.forEach(category => {
                    params.append('price_categories[]', category);
                });
            }
            
            const dateRange = getDateRangeFromTimePeriod();
            if (dateRange.startDate) params.append('start_date', dateRange.startDate);
            if (dateRange.endDate) params.append('end_date', dateRange.endDate);
            
            const res = await fetch(`/admin/trends/data?${params.toString()}`, { headers: { 'Accept': 'application/json' } });
            const json = await res.json();
            // Flatten grouped data into one array with product name and price category on each point
            const flattened = json.data.flatMap((g: any) =>
                g.series.map((p: any) => {
                    // Map unit_type to price category name
                    let priceCategory = 'Unknown';
                    if (p.unit_type === 'kg') {
                        priceCategory = 'Per Kilo';
                    } else if (p.unit_type === 'tali') {
                        priceCategory = 'Per Tali';
                    } else if (p.unit_type === 'pc') {
                        priceCategory = 'Per Piece';
                    }
                    
                    return { 
                        ...p, 
                        product: g.product || 'Unknown',
                        price_category: priceCategory
                    };
                })
            );
            setSeries(flattened);
        } finally {
            setLoading(false);
        }
    }, [selectedProducts, selectedCategory, priceCategoryToggles, timePeriod, startDate, endDate, selectedMonth, selectedYear]);

    useEffect(() => {
        // Only initialize if no persisted state exists
        if (!persistedState) {
            setAvailableProducts(products);
            setAvailablePriceCategories(['per_kilo', 'per_tali', 'per_pc']);
            setPriceCategoryToggles({
                per_kilo: true,
                per_tali: true,
                per_pc: true
            });
        }
        // Load data on mount if we have persisted state with selected products
        if (persistedState && persistedState.selectedProducts?.length > 0) {
            loadData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    // Persist state to sessionStorage whenever relevant state changes (debounced)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const stateToSave = {
                selectedCategory,
                selectedProducts,
                priceCategoryToggles,
                startDate: startDate?.toISOString(),
                endDate: endDate?.toISOString(),
                timePeriod,
                series,
                availableProducts,
                availablePriceCategories,
                productPriceCategories,
                selectedMonth,
                selectedYear,
                latestProductData,
            };
            
            try {
                sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
            } catch (error) {
                console.error('Error persisting state:', error);
            }
        }, 300); // Debounce for 300ms
        
        return () => clearTimeout(timeoutId);
    }, [
        selectedCategory,
        selectedProducts,
        priceCategoryToggles,
        startDate,
        endDate,
        timePeriod,
        series,
        availableProducts,
        availablePriceCategories,
        productPriceCategories,
        selectedMonth,
        selectedYear,
        latestProductData,
    ]);

    // Auto-load data when monthly or yearly selections are complete and valid
    useEffect(() => {
        const hasValidMonthlySelection = timePeriod === 'monthly' && selectedMonth !== undefined && selectedYear !== undefined && 
            !dayjs().year(selectedYear).month(selectedMonth).isAfter(dayjs()) && selectedYear >= 2020;
        const hasValidYearlySelection = timePeriod === 'yearly' && selectedYear !== undefined && 
            selectedYear <= dayjs().year() && selectedYear >= 2020;
        
        if (hasValidMonthlySelection && selectedProducts.length > 0) {
            loadData();
        } else if (hasValidYearlySelection && selectedProducts.length > 0) {
            loadData();
        }
    }, [timePeriod, selectedMonth, selectedYear, selectedProducts, loadData]);

    // Auto-reload data when price category toggles change
    useEffect(() => {
        // Only reload if we have selected products and at least one toggle is enabled
        if (selectedProducts.length > 0 && Object.values(priceCategoryToggles).some(toggle => toggle)) {
            loadData();
        }
    }, [loadData]);

    // Fetch latest data when selected products change
    useEffect(() => {
        fetchLatestProductData();
    }, [fetchLatestProductData]);

    const chartData = useMemo(() => {
        // Only recalculate when series data actually changes
        if (series.length === 0) {
            return [];
        }
        
        // Get date range from time period selection
        let chartStartDate, chartEndDate;
        const dateRangeFromPeriod = getDateRangeFromTimePeriod();
        
        if (dateRangeFromPeriod.startDate && dateRangeFromPeriod.endDate) {
            // Use time period specified dates - chart will show exactly this range
            chartStartDate = dayjs(dateRangeFromPeriod.startDate).startOf('day');
            chartEndDate = dayjs(dateRangeFromPeriod.endDate).endOf('day');
        } else {
            // Fall back to data range only if no time period dates specified
            const allDates = series.map(item => dayjs(item.timestamp).format('YYYY-MM-DD'));
            const sortedDates = allDates.sort((a, b) => dayjs(a).valueOf() - dayjs(b).valueOf());
            if (sortedDates.length === 0) return [];
            
            const dataStartDate = dayjs(Math.min(...sortedDates.map(d => dayjs(d).valueOf())));
            const dataEndDate = dayjs(Math.max(...sortedDates.map(d => dayjs(d).valueOf())));
            chartStartDate = dataStartDate.startOf('day');
            chartEndDate = dataEndDate.endOf('day');
        }
        
        // Use interpolation function to fill missing data
        const interpolatedData = interpolateData(series, chartStartDate, chartEndDate);
        
        return interpolatedData;
    }, [series, interpolateData]);

    // Generate colors for different products using theme colors
    const getProductColor = (productName: string, index: number) => {
        const colors = [
            '#16a34a', '#059669', '#047857', '#065f46', '#10b981', // Green variations
            '#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0', // Emerald variations
            '#84cc16', '#65a30d', '#4d7c0f', '#365314', '#1a2e05'  // Additional green tones
        ];
        return colors[index % colors.length];
    };

    // Get unique product-category combinations for legend
    const uniqueProducts = useMemo(() => {
        // If we have series data, use it
        if (series.length > 0) {
            const productKeys = [...new Set(series.map(item => `${item.product} (${item.price_category || 'Unknown'})`))];
            return productKeys.map((productKey, index) => ({
                name: productKey,
                color: getProductColor(productKey, index)
            }));
        }
        
        // If no series data but we have chart data, extract keys from chart data
        if (chartData.length > 0) {
            const allKeys = new Set<string>();
            chartData.forEach(dataPoint => {
                Object.keys(dataPoint).forEach(key => {
                    if (key !== 'timestamp' && key !== 'isMoreThanOneMonth') {
                        allKeys.add(key);
                    }
                });
            });
            
            const productKeys = Array.from(allKeys);
            return productKeys.map((productKey, index) => ({
                name: productKey,
                color: getProductColor(productKey, index)
            }));
        }
        
        return [];
    }, [series, chartData]);

    return (
        <PermissionGuard permissions={['view inventory']} pageTitle={t('admin.access_denied')}>
            <AppLayout>
                <Head title={t('admin.trends_management')} />
                <div className="min-h-screen bg-background">
                    <div className="w-full flex flex-col gap-2 px-2 py-2 sm:px-4 sm:py-4 lg:px-8">
                        {/* Dashboard Header */}
                        <div className="bg-gradient-to-br from-card to-[color-mix(in_srgb,var(--card)_95%,var(--primary)_5%)] border border-border rounded-[0.8rem] p-3 sm:p-5 mb-2 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 sm:h-10 sm:w-10 text-primary bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] p-2 sm:p-2.5 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6" />
                                </div>
                                <div>
                                    <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight m-0">{t('admin.price_trend_analysis')}</h1>
                                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 mb-0 leading-snug">
                                        {t('admin.visualize_product_price_fluctuations')}
                                    </p>
                                </div>
                            </div>
                        </div>

                    <Card>
                        <CardHeader>
                            <div className="flex flex-col items-center gap-3 lg:flex-row lg:gap-4">
                                <CardTitle className="text-base md:text-lg lg:text-xl lg:mr-auto">{t('admin.filters')}</CardTitle>
                                {(selectedProducts.length > 0 || selectedCategory || startDate || endDate || selectedMonth !== undefined || selectedYear !== undefined) && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleClearFilters}
                                        className="text-xs sm:text-sm"
                                    >
                                        {t('admin.clear_filters')}
                                    </Button>
                                )}
                                <TimePeriodSelector
                                    timePeriod={timePeriod}
                                    onTimePeriodChange={handleTimePeriodChange}
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                                <ProductSelector
                                    selectedCategory={selectedCategory}
                                    selectedProducts={selectedProducts}
                                    availableProducts={availableProducts}
                                    onCategoryChange={handleCategoryChange}
                                    onProductSelectionChange={handleProductSelectionChange}
                                />
                                <DateSelector
                                    timePeriod={timePeriod}
                                    startDate={startDate}
                                    endDate={endDate}
                                    selectedMonth={selectedMonth}
                                    selectedYear={selectedYear}
                                    dateValidationError={dateValidationError}
                                    onStartDateChange={setStartDate}
                                    onEndDateChange={setEndDate}
                                    onMonthChange={setSelectedMonth}
                                    onYearChange={(year) => {
                                        setSelectedYear(year);
                                        const currentYear = dayjs().year();
                                        const currentMonth = dayjs().month();
                                        if (year === currentYear && selectedMonth !== undefined && selectedMonth > currentMonth) {
                                            setSelectedMonth(undefined);
                                        }
                                    }}
                                    onValidateDates={validateDates}
                                />
                                {dateValidationError && (
                                    <div className="text-red-500 text-sm mt-2 whitespace-nowrap">
                                        {dateValidationError}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <CardTitle className="text-base md:text-lg lg:text-xl">{t('admin.price_trend')}</CardTitle>
                                <PriceCategoryToggles
                                    priceCategoryToggles={priceCategoryToggles}
                                    availablePriceCategories={availablePriceCategories}
                                    selectedProducts={selectedProducts}
                                    onToggle={handlePriceCategoryToggle}
                                />
                            </div>
                            {/* Only show validation errors, not missing field warnings */}
                            {timePeriod === 'specific' && startDate && endDate && dayjs(startDate).isAfter(dayjs(endDate)) && (
                                <p className="text-sm text-red-500 mt-2">{t('admin.start_date_cannot_after_end')}</p>
                            )}
                            {timePeriod === 'monthly' && selectedMonth !== undefined && selectedYear !== undefined && dayjs().year(selectedYear).month(selectedMonth).isAfter(dayjs()) && (
                                <p className="text-sm text-red-500 mt-2">{t('admin.selected_month_cannot_future')}</p>
                            )}
                            {timePeriod === 'yearly' && selectedYear !== undefined && selectedYear > dayjs().year() && (
                                <p className="text-sm text-red-500 mt-2">{t('admin.selected_year_cannot_future')}</p>
                            )}
                            {timePeriod === 'specific' && startDate && dayjs(startDate).isBefore(dayjs('2020-01-01')) && (
                                <p className="text-sm text-red-500 mt-2">{t('admin.start_date_cannot_before_2020')}</p>
                            )}
                            {timePeriod === 'specific' && endDate && dayjs(endDate).isBefore(dayjs('2020-01-01')) && (
                                <p className="text-sm text-red-500 mt-2">{t('admin.end_date_cannot_before_2020')}</p>
                            )}
                            {timePeriod === 'monthly' && selectedYear !== undefined && selectedYear < 2020 && (
                                <p className="text-sm text-red-500 mt-2">{t('admin.selected_year_cannot_before_2020')}</p>
                            )}
                            {timePeriod === 'yearly' && selectedYear !== undefined && selectedYear < 2020 && (
                                <p className="text-sm text-red-500 mt-2">{t('admin.selected_year_cannot_before_2020')}</p>
                            )}
                        </CardHeader>
                        <CardContent>
                            <div className="w-full h-[280px] sm:h-[350px] md:h-[400px] lg:h-[420px]">
                                <TrendChart
                                    chartData={chartData}
                                    selectedProducts={selectedProducts}
                                    timePeriod={timePeriod}
                                    startDate={startDate}
                                    endDate={endDate}
                                    selectedMonth={selectedMonth}
                                    selectedYear={selectedYear}
                                />
                            </div>
                        </CardContent>
                    </Card>
                    </div>
                </div>
            </AppLayout>
        </PermissionGuard>
    );
}


