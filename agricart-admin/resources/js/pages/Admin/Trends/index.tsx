import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { PermissionGuard } from '@/components/permission-guard';
import type { SharedData } from '@/types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { CalendarIcon, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { useTranslation } from '@/hooks/use-translation';

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
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
    const [priceCategoryToggles, setPriceCategoryToggles] = useState<{
        per_kilo: boolean;
        per_tali: boolean;
        per_pc: boolean;
    }>({
        per_kilo: true,
        per_tali: true,
        per_pc: true
    });
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [timePeriod, setTimePeriod] = useState<string>('specific');
    const [dateValidationError, setDateValidationError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingPriceCategories, setLoadingPriceCategories] = useState<boolean>(false);
    const [series, setSeries] = useState<any[]>([]);
    const [availableProducts, setAvailableProducts] = useState<ProductOption[]>([]);
    const [availablePriceCategories, setAvailablePriceCategories] = useState<string[]>([]);
    const [productPriceCategories, setProductPriceCategories] = useState<Record<string, string[]>>({});
    const [selectedMonth, setSelectedMonth] = useState<number | undefined>(undefined);
    const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
    
    // Store latest data for selected products - updates based on selected products
    const [latestProductData, setLatestProductData] = useState<Record<string, any>>({});

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
            if (!startDate || !endDate) {
                setDateValidationError(t('admin.select_both_dates'));
                return false;
            }
            if (startDate && endDate && dayjs(startDate).isAfter(dayjs(endDate))) {
                setDateValidationError(t('admin.start_date_cannot_after_end'));
                return false;
            }
            // Clear error if dates are valid
            setDateValidationError('');
            return true;
        }
        setDateValidationError('');
        return true;
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
            return;
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
        // Initialize available products and price categories
        setAvailableProducts(products);
        setAvailablePriceCategories(['per_kilo', 'per_tali', 'per_pc']);
        // Initialize price category toggles to be enabled by default
        setPriceCategoryToggles({
            per_kilo: true,
            per_tali: true,
            per_pc: true
        });
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
        
        // Get date range from time period selection
        let chartStartDate, chartEndDate;
        const dateRangeFromPeriod = getDateRangeFromTimePeriod();
        
        if (dateRangeFromPeriod.startDate && dateRangeFromPeriod.endDate) {
            // Use time period specified dates - chart will show exactly this range
            chartStartDate = dayjs(dateRangeFromPeriod.startDate).startOf('day');
            chartEndDate = dayjs(dateRangeFromPeriod.endDate).endOf('day');
        } else {
            // Fall back to data range only if no time period dates specified
            if (series.length === 0) {
                // If no series data and no time period, return empty
                return [];
            }
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
    }, [series, timePeriod, startDate, endDate, selectedMonth, selectedYear, interpolateData, selectedProducts, priceCategoryToggles]);

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
                    <div className="w-full flex flex-col gap-2 px-4 py-4 sm:px-6 lg:px-8">
                        {/* Dashboard Header */}
                        <div className="bg-gradient-to-br from-card to-[color-mix(in_srgb,var(--card)_95%,var(--primary)_5%)] border border-border rounded-[0.8rem] p-5 mb-2 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <div className="h-10 w-10 text-primary bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] p-2.5 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="h-6 w-6" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-foreground leading-tight m-0">{t('admin.price_trend_analysis')}</h1>
                                    <p className="text-sm text-muted-foreground mt-0.5 mb-0 leading-snug">
                                        {t('admin.visualize_product_price_fluctuations')}
                                    </p>
                                </div>
                            </div>
                        </div>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                            <CardTitle>{t('admin.filters')}</CardTitle>
                                <div className="flex items-center space-x-6">
                                    <Label className="text-base font-semibold">{t('admin.time_period')}</Label>
                                    <div className="flex space-x-4">
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                id="specific"
                                                name="timePeriod"
                                                value="specific"
                                                checked={timePeriod === 'specific'}
                                                onChange={(e) => handleTimePeriodChange(e.target.value as 'specific' | 'monthly' | 'yearly')}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                            />
                                            <Label htmlFor="specific">{t('admin.specific_date')}</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                id="monthly"
                                                name="timePeriod"
                                                value="monthly"
                                                checked={timePeriod === 'monthly'}
                                                onChange={(e) => handleTimePeriodChange(e.target.value as 'specific' | 'monthly' | 'yearly')}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                            />
                                            <Label htmlFor="monthly">{t('admin.monthly')}</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                id="yearly"
                                                name="timePeriod"
                                                value="yearly"
                                                checked={timePeriod === 'yearly'}
                                                onChange={(e) => handleTimePeriodChange(e.target.value as 'specific' | 'monthly' | 'yearly')}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                            />
                                            <Label htmlFor="yearly">{t('admin.yearly')}</Label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                                <div>
                                    <Label>{t('admin.category')}</Label>
                                    <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder={t('admin.all_categories')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">{t('admin.all_categories')}</SelectItem>
                                            <SelectItem value="fruit">{t('admin.fruit')}</SelectItem>
                                            <SelectItem value="vegetable">{t('admin.vegetable')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>{t('admin.products_max_3')}</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-start">
                                                {selectedProducts.length === 0 
                                                    ? t('admin.select_products_placeholder')
                                                    : `${selectedProducts.length} ${t('admin.products_selected')}`
                                                }
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto min-w-[400px] max-w-[800px]">
                                            <div>
                                                {(() => {
                                                    const groupedProducts = getGroupedProducts(availableProducts);
                                                    const groupTitles = {
                                                        'per_kilo_only': t('admin.per_kilo_only'),
                                                        'per_tali_only': t('admin.per_tali_only'), 
                                                        'per_pc_only': t('admin.per_pc_only'),
                                                        'per_kilo_tali': t('admin.per_kilo_tali'),
                                                        'per_kilo_pc': t('admin.per_kilo_pc'),
                                                        'per_tali_pc': t('admin.per_tali_pc'),
                                                        'all_units': t('admin.all_pricing_units')
                                                    };
                                                    
                                                    // Count total products to determine layout
                                                    const totalProducts = Object.values(groupedProducts).reduce((sum, group) => sum + group.length, 0);
                                                    const hasMultipleGroups = Object.values(groupedProducts).filter(group => group.length > 0).length > 1;
                                                    
                                                    return (
                                                        <div className={hasMultipleGroups ? "grid grid-cols-2 gap-2" : "space-y-4"}>
                                                            {Object.entries(groupedProducts).map(([groupKey, groupProducts]) => {
                                                                if (groupProducts.length === 0) return null;
                                                                
                                                                return (
                                                                    <div key={groupKey} className="space-y-2">
                                                                        <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 px-1 border-b border-gray-200 pb-1">
                                                                            {groupTitles[groupKey as keyof typeof groupTitles]}
                                                                        </div>
                                                                        <div className={groupProducts.length <= 4 ? "grid grid-cols-1 gap-1" : "grid grid-cols-2 gap-1"}>
                                                                            {groupProducts.map((product) => (
                                                                                <div key={product.name} className="flex items-center space-x-2 px-2 py-1 hover:bg-gray-50 rounded">
                                                        <Checkbox
                                                            id={product.name}
                                                            checked={selectedProducts.includes(product.name)}
                                                            onCheckedChange={(checked) => 
                                                                handleProductSelectionChange(product.name, checked as boolean)
                                                            }
                                                                                        disabled={!selectedProducts.includes(product.name) && selectedProducts.length >= 3}
                                                        />
                                                        <Label 
                                                            htmlFor={product.name} 
                                                                                        className="text-sm font-normal cursor-pointer flex-1 truncate"
                                                        >
                                                            {product.name}
                                                        </Label>
                                                    </div>
                                                ))}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                    {selectedProducts.length >= 3 && (
                                        <p className="text-sm text-amber-600 mt-1">
                                            {t('admin.maximum_products_warning')}
                                        </p>
                                    )}
                                </div>
                                {timePeriod === 'specific' && (
                                    <>
                                <div>
                                    <Label>{t('admin.start_date')}</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start text-left font-normal"
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {startDate ? format(startDate, "PPP") : t('admin.pick_date')}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={startDate}
                                                onSelect={(date) => {
                                                    setStartDate(date);
                                                    if (date) {
                                                        validateDates();
                                                    }
                                                }}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div>
                                    <Label>{t('admin.end_date')}</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start text-left font-normal"
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {endDate ? format(endDate, "PPP") : t('admin.pick_date')}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={endDate}
                                                onSelect={(date) => {
                                                    setEndDate(date);
                                                    if (date) {
                                                        validateDates();
                                                    }
                                                }}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                    </>
                                )}
                                {dateValidationError && (
                                    <div className="text-red-500 text-sm mt-2 whitespace-nowrap">
                                        {dateValidationError}
                                    </div>
                                )}
                                
                                {timePeriod === 'monthly' && (
                                    <>
                                        <div>
                                            <Label>{t('admin.select_month')}</Label>
                                            <Select 
                                                value={selectedMonth?.toString() || ""} 
                                                onValueChange={(value) => setSelectedMonth(parseInt(value))}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder={t('admin.select_month')} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="0">{t('admin.january')}</SelectItem>
                                                    <SelectItem value="1">{t('admin.february')}</SelectItem>
                                                    <SelectItem value="2">{t('admin.march')}</SelectItem>
                                                    <SelectItem value="3">{t('admin.april')}</SelectItem>
                                                    <SelectItem value="4">{t('admin.may')}</SelectItem>
                                                    <SelectItem value="5">{t('admin.june')}</SelectItem>
                                                    <SelectItem value="6">{t('admin.july')}</SelectItem>
                                                    <SelectItem value="7">{t('admin.august')}</SelectItem>
                                                    <SelectItem value="8">{t('admin.september')}</SelectItem>
                                                    <SelectItem value="9">{t('admin.october')}</SelectItem>
                                                    <SelectItem value="10">{t('admin.november')}</SelectItem>
                                                    <SelectItem value="11">{t('admin.december')}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label>{t('admin.select_year')}</Label>
                                            <Select 
                                                value={selectedYear?.toString() || ""} 
                                                onValueChange={(value) => setSelectedYear(parseInt(value))}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder={t('admin.select_year')} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Array.from({ length: 11 }, (_, i) => 2020 + i).map(year => (
                                                        <SelectItem key={year} value={year.toString()}>
                                                            {year}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </>
                                )}
                                
                                {timePeriod === 'yearly' && (
                                    <div>
                                        <Label>{t('admin.select_year')}</Label>
                                        <Select 
                                            value={selectedYear?.toString() || ""} 
                                            onValueChange={(value) => setSelectedYear(parseInt(value))}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder={t('admin.select_year')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Array.from({ length: 11 }, (_, i) => 2020 + i).map(year => (
                                                    <SelectItem key={year} value={year.toString()}>
                                                        {year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                            <CardTitle>{t('admin.price_trend')}</CardTitle>
                                <div className="flex items-center space-x-6">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="per_kilo"
                                                checked={priceCategoryToggles.per_kilo}
                                                onCheckedChange={() => handlePriceCategoryToggle('per_kilo')}
                                                disabled={selectedProducts.length === 0 || !availablePriceCategories.includes('per_kilo')}
                                            />
                                            <Label htmlFor="per_kilo" className="text-sm">{t('admin.per_kilo')}</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="per_tali"
                                                checked={priceCategoryToggles.per_tali}
                                                onCheckedChange={() => handlePriceCategoryToggle('per_tali')}
                                                disabled={selectedProducts.length === 0 || !availablePriceCategories.includes('per_tali')}
                                            />
                                            <Label htmlFor="per_tali" className="text-sm">{t('admin.per_tali')}</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="per_pc"
                                                checked={priceCategoryToggles.per_pc}
                                                onCheckedChange={() => handlePriceCategoryToggle('per_pc')}
                                                disabled={selectedProducts.length === 0 || !availablePriceCategories.includes('per_pc')}
                                            />
                                            <Label htmlFor="per_pc" className="text-sm">{t('admin.per_pc')}</Label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {selectedProducts.length === 0 && (
                                <p className="text-sm text-red-500 mt-2">{t('admin.please_select_product_chart')}</p>
                            )}
                            {timePeriod === 'monthly' && (selectedMonth === undefined || selectedYear === undefined) && (
                                <p className="text-sm text-red-500 mt-2">{t('admin.please_select_month_year_chart')}</p>
                            )}
                            {timePeriod === 'yearly' && selectedYear === undefined && (
                                <p className="text-sm text-red-500 mt-2">{t('admin.please_select_year_chart')}</p>
                            )}
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
                            <div style={{ width: '100%', height: 420 }}>
                                {(() => {
                                    // Check if we should show the chart based on time period requirements
                                    const hasValidSpecificDates = timePeriod === 'specific' && startDate && endDate && 
                                        !dayjs(startDate).isBefore(dayjs('2020-01-01')) &&
                                        !dayjs(endDate).isBefore(dayjs('2020-01-01')) &&
                                        !dayjs(startDate).isAfter(dayjs(endDate));
                                    const hasValidMonthlySelection = timePeriod === 'monthly' && selectedMonth !== undefined && selectedYear !== undefined && 
                                        !dayjs().year(selectedYear).month(selectedMonth).isAfter(dayjs()) && selectedYear >= 2020;
                                    const hasValidYearlySelection = timePeriod === 'yearly' && selectedYear !== undefined && 
                                        selectedYear <= dayjs().year() && selectedYear >= 2020;
                                    
                                    const shouldShowChart = chartData.length > 0 && (
                                        hasValidSpecificDates || 
                                        hasValidMonthlySelection ||
                                        hasValidYearlySelection
                                    );
                                    
                                    return shouldShowChart ? (
                                     <ResponsiveContainer>
                                         <LineChart 
                                             data={chartData} 
                                             margin={{ top: 10, right: 20, bottom: 10, left: 0 }}
                                             style={{
                                                 transition: 'all 0.3s ease-in-out'
                                             }}
                                         >
                                             <CartesianGrid strokeDasharray="3 3" />
                                             <XAxis 
                                                 dataKey="timestamp" 
                                                 tickFormatter={(value) => {
                                                     const date = dayjs(value);
                                                     // Check if this is a multi-month range by looking at the first data point
                                                     const isMoreThanOneMonth = chartData.length > 0 && chartData[0]?.isMoreThanOneMonth;
                                                     
                                                     if (isMoreThanOneMonth) {
                                                         // Show full month name with day when spanning more than 30 days
                                                         return date.format('MMMM D');
                                                     } else {
                                                         // Show days when within 30 days
                                                         return date.format('MMM D');
                                                     }
                                                 }}
                                                 tick={{ fontSize: 12 }}
                                                 ticks={(() => {
                                                     const isMoreThanOneMonth = chartData.length > 0 && chartData[0]?.isMoreThanOneMonth;
                                                     if (!isMoreThanOneMonth) return undefined;
                                                     
                                                     // For monthly view, show first day of each month plus the end date
                                                     const monthTicks: string[] = [];
                                                     const seenMonths = new Set<string>();
                                                     
                                                     chartData.forEach((item, index) => {
                                                         const date = dayjs(item.timestamp);
                                                         const monthKey = `${date.year()}-${date.month()}`;
                                                         
                                                         if (!seenMonths.has(monthKey)) {
                                                             seenMonths.add(monthKey);
                                                             monthTicks.push(item.timestamp);
                                                         }
                                                     });
                                                     
                                                     // Always add the last date (end date) if it's not already included
                                                     if (chartData.length > 0) {
                                                         const lastDate = chartData[chartData.length - 1].timestamp;
                                                         if (!monthTicks.includes(lastDate)) {
                                                             monthTicks.push(lastDate);
                                                         }
                                                     }
                                                     
                                                     return monthTicks;
                                                 })()}
                                             />
                                             <YAxis />
                                             <Tooltip 
                                                 content={({ active, payload, label }) => {
                                                     if (active && payload && payload.length) {
                                                         return (
                                                             <div className="bg-white p-3 border border-gray-200 rounded shadow-lg animate-in fade-in-0 zoom-in-95 duration-200">
                                                                 <p className="font-semibold text-gray-800">{`${t('admin.date')}: ${label ? dayjs(label).format('MMMM D, YYYY') : 'Unknown'}`}</p>
                                                                 {payload.map((entry, index) => {
                                                                     if (entry.value && entry.dataKey) {
                                                                         // Parse the product key to show product and category separately
                                                                         const match = entry.dataKey.match(/^(.+?) \((.+?)\)$/);
                                                                         const productName = match ? match[1] : entry.dataKey;
                                                                         const priceCategory = match ? match[2] : 'Unknown';
                                                                         
                                                                         return (
                                                                             <p key={index} className="flex items-center gap-2">
                                                                                 <span 
                                                                                     className="w-3 h-3 rounded-full" 
                                                                                     style={{ backgroundColor: entry.color }}
                                                                 ></span>
                                                                                 <span className="font-medium text-gray-800">{productName}</span>
                                                                                 <span className="text-gray-600">({priceCategory})</span>
                                                                                 <span className="ml-2 font-semibold text-green-600">₱{entry.value}</span>
                                                                             </p>
                                                                         );
                                                                     }
                                                                     return null;
                                                                 })}
                                                             </div>
                                                         );
                                                     }
                                                     return null;
                                                 }}
                                             />
                                             <Legend />
                                             {uniqueProducts.map((product, index) => (
                                                 <Line 
                                                     key={product.name}
                                                     type="linear" 
                                                     dataKey={product.name} 
                                                     name={product.name}
                                                     stroke={product.color} 
                                                     strokeWidth={3}
                                                     strokeLinecap="square"
                                                     strokeLinejoin="miter"
                                                     dot={(props) => {
                                                         // Show dots before and after price changes
                                                         const { cx, cy, payload } = props;
                                                         if (!payload || !payload[product.name]) {
                                                             return <circle cx={cx} cy={cy} r={0} fill="transparent" />;
                                                         }
                                                         
                                                         const currentValue = payload[product.name];
                                                         const currentIndex = chartData.findIndex(item => item.timestamp === payload.timestamp);
                                                         
                                                         if (currentIndex === 0) {
                                                             // First data point - always show
                                                             return (
                                                                 <circle 
                                                                     cx={cx} 
                                                                     cy={cy} 
                                                                     r={4} 
                                                                     fill={product.color}
                                                                     stroke="#fff"
                                                                     strokeWidth={2}
                                                                     filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
                                                                 />
                                                             );
                                                         }
                                                         
                                                         const prevValue = chartData[currentIndex - 1]?.[product.name];
                                                         const nextValue = chartData[currentIndex + 1]?.[product.name];
                                                         
                                                         // Show dot if:
                                                         // 1. Price changed from previous (start of new price)
                                                         // 2. Price will change to next (end of current price)
                                                         if (prevValue !== currentValue || (nextValue && nextValue !== currentValue)) {
                                                             return (
                                                                 <circle 
                                                                     cx={cx} 
                                                                     cy={cy} 
                                                                     r={4} 
                                                                     fill={product.color}
                                                                     stroke="#fff"
                                                                     strokeWidth={2}
                                                                     filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
                                                                 />
                                                             );
                                                         }
                                                         
                                                         // No price change - invisible dot
                                                         return <circle cx={cx} cy={cy} r={0} fill="transparent" />;
                                                     }}
                                                     activeDot={{ 
                                                         r: 6, 
                                                         stroke: product.color, 
                                                         strokeWidth: 2, 
                                                         fill: '#fff',
                                                         filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.15))'
                                                     }}
                                                     connectNulls={true}
                                                     animationDuration={1500}
                                                     animationEasing="ease-in-out"
                                                     style={{ 
                                                         filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                                                     }}
                                                 />
                                             ))}
                                         </LineChart>
                                     </ResponsiveContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-500">
                                            <p>{t('admin.no_data_select_products_categories')}</p>
                                    </div>
                                    );
                                })()}
                            </div>
                        </CardContent>
                    </Card>
                    </div>
                </div>
            </AppLayout>
        </PermissionGuard>
    );
}


