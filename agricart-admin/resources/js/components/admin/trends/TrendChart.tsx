import { useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import dayjs from 'dayjs';
import { useTranslation } from '@/hooks/use-translation';

interface TrendChartProps {
    chartData: any[];
    selectedProducts: string[];
    timePeriod: string;
    startDate?: Date;
    endDate?: Date;
    selectedMonth?: number;
    selectedYear?: number;
}

export function TrendChart({
    chartData,
    selectedProducts,
    timePeriod,
    startDate,
    endDate,
    selectedMonth,
    selectedYear,
}: TrendChartProps) {
    const t = useTranslation();

    // Generate colors for different products
    const getProductColor = (productName: string, index: number) => {
        const colors = [
            '#16a34a', '#059669', '#047857', '#065f46', '#10b981',
            '#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0',
            '#84cc16', '#65a30d', '#4d7c0f', '#365314', '#1a2e05'
        ];
        return colors[index % colors.length];
    };

    // Get unique product-category combinations
    const uniqueProducts = useMemo(() => {
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
    }, [chartData]);

    // Check if we should show the chart
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

    if (!shouldShowChart) {
        return (
            <div className="flex items-center justify-center h-full text-gray-500">
                <p>{t('admin.no_data_select_products_categories')}</p>
            </div>
        );
    }

    return (
        <div
            key={`chart-${selectedProducts.sort().join('-')}`}
            className="w-full h-full"
            style={{
                opacity: 1,
                transition: 'opacity 0.3s ease-in-out',
            }}
        >
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={chartData}
                    margin={{ top: 10, right: 5, bottom: 50, left: -20 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                    <XAxis
                        dataKey="timestamp"
                        allowDataOverflow={false}
                        tickFormatter={(value) => {
                            const date = dayjs(value);
                            return date.format('MMM D');
                        }}
                        tick={{ fontSize: 10 }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        ticks={(() => {
                            const isMoreThanOneMonth = chartData.length > 0 && chartData[0]?.isMoreThanOneMonth;
                            if (!isMoreThanOneMonth) return undefined;

                            const monthTicks: string[] = [];
                            const seenMonths = new Set<string>();

                            chartData.forEach((item) => {
                                const date = dayjs(item.timestamp);
                                const monthKey = `${date.year()}-${date.month()}`;

                                if (!seenMonths.has(monthKey)) {
                                    seenMonths.add(monthKey);
                                    monthTicks.push(item.timestamp);
                                }
                            });

                            if (chartData.length > 0) {
                                const lastDate = chartData[chartData.length - 1].timestamp;
                                if (!monthTicks.includes(lastDate)) {
                                    monthTicks.push(lastDate);
                                }
                            }

                            return monthTicks;
                        })()}
                    />
                    <YAxis
                        tick={{ fontSize: 10 }}
                        width={40}
                        allowDataOverflow={false}
                    />
                    <Tooltip
                        animationDuration={200}
                        animationEasing="ease-out"
                        content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                                return (
                                    <div className="bg-white p-2 sm:p-3 border border-gray-200 rounded shadow-lg animate-in fade-in-0 zoom-in-95 duration-200 max-w-[280px] sm:max-w-none">
                                        <p className="font-semibold text-gray-800 text-xs sm:text-sm mb-1">
                                            {`${t('admin.date')}: ${label ? dayjs(label).format('MMM D, YYYY') : 'Unknown'}`}
                                        </p>
                                        {payload.map((entry, index) => {
                                            if (entry.value && entry.dataKey) {
                                                const match = entry.dataKey.match(/^(.+?) \((.+?)\)$/);
                                                const productName = match ? match[1] : entry.dataKey;
                                                const priceCategory = match ? match[2] : 'Unknown';

                                                return (
                                                    <p key={index} className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                                                        <span
                                                            className="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                                                            style={{ backgroundColor: entry.color }}
                                                        ></span>
                                                        <span className="font-medium text-gray-800 truncate">{productName}</span>
                                                        <span className="text-gray-600 text-xs">({priceCategory})</span>
                                                        <span className="ml-auto font-semibold text-green-600 whitespace-nowrap">₱{entry.value}</span>
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
                    <Legend
                        wrapperStyle={{ fontSize: '11px' }}
                        iconSize={10}
                    />
                    {uniqueProducts.map((product) => (
                        <Line
                            key={product.name}
                            type="linear"
                            dataKey={product.name}
                            name={product.name}
                            stroke={product.color}
                            strokeWidth={3}
                            strokeLinecap="square"
                            strokeLinejoin="miter"
                            isAnimationActive={true}
                            animationDuration={500}
                            animationEasing="ease-in-out"
                            animationBegin={0}
                            dot={(props) => {
                                const { cx, cy, payload } = props;
                                if (!payload || !payload[product.name]) {
                                    return <circle cx={cx} cy={cy} r={0} fill="transparent" />;
                                }

                                const currentValue = payload[product.name];
                                const currentIndex = chartData.findIndex(item => item.timestamp === payload.timestamp);

                                if (currentIndex === 0) {
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
                            style={{
                                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                            }}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
