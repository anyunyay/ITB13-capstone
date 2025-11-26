import { Order } from '@/types/orders';

export interface OrderGroup {
    type: 'single' | 'suspicious';
    orders: Order[];
    isSuspicious: boolean;
    minutesDiff?: number;
}

/**
 * Groups orders by customer and time window for suspicious pattern detection
 * This is a frontend-only grouping that doesn't modify backend data
 */
export function groupSuspiciousOrders(orders: Order[], timeWindowMinutes: number = 10): OrderGroup[] {
    const groups: OrderGroup[] = [];
    const processedOrderIds = new Set<number>();

    // Filter out merged, approved, and rejected orders before grouping
    // Only pending and delayed orders can be suspicious
    const activeOrders = orders.filter(order => 
        order.status !== 'merged' && 
        order.status !== 'approved' && 
        order.status !== 'rejected'
    );

    // Sort orders by created_at
    const sortedOrders = [...activeOrders].sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    sortedOrders.forEach((order) => {
        // Skip if already processed
        if (processedOrderIds.has(order.id)) {
            return;
        }

        // Find all orders from the same customer within the time window
        const relatedOrders = sortedOrders.filter((otherOrder) => {
            if (processedOrderIds.has(otherOrder.id)) {
                return false;
            }

            // Must be from same customer
            if (order.customer.email !== otherOrder.customer.email) {
                return false;
            }

            // Check time window
            const orderTime = new Date(order.created_at).getTime();
            const otherOrderTime = new Date(otherOrder.created_at).getTime();
            const timeDiffMinutes = Math.abs(orderTime - otherOrderTime) / 60000;

            return timeDiffMinutes <= timeWindowMinutes;
        });

        // Mark all related orders as processed
        relatedOrders.forEach(o => processedOrderIds.add(o.id));

        // If 2 or more orders found, check if they should be considered suspicious
        if (relatedOrders.length >= 2) {
            // Filter out orders that have been explicitly cleared (is_suspicious === false)
            // This respects backend decisions while still detecting new patterns
            const suspiciousOrders = relatedOrders.filter(o => o.is_suspicious !== false);
            
            // Only create a suspicious group if at least 2 orders remain after filtering
            if (suspiciousOrders.length >= 2) {
                const firstOrderTime = new Date(suspiciousOrders[0].created_at).getTime();
                const lastOrderTime = new Date(suspiciousOrders[suspiciousOrders.length - 1].created_at).getTime();
                const minutesDiff = Math.round((lastOrderTime - firstOrderTime) / 60000);

                groups.push({
                    type: 'suspicious',
                    orders: suspiciousOrders,
                    isSuspicious: true,
                    minutesDiff
                });
            } else {
                // If less than 2 orders remain, treat remaining orders as single orders
                suspiciousOrders.forEach(o => {
                    groups.push({
                        type: 'single',
                        orders: [o],
                        isSuspicious: false
                    });
                });
            }
        } else {
            // Single order, not suspicious (unless explicitly marked)
            groups.push({
                type: 'single',
                orders: [order],
                isSuspicious: order.is_suspicious === true
            });
        }
    });

    return groups;
}

/**
 * Get statistics about suspicious order groups
 */
export function getSuspiciousOrderStats(groups: OrderGroup[]) {
    const suspiciousGroups = groups.filter(g => g.isSuspicious);
    const totalSuspiciousOrders = suspiciousGroups.reduce((sum, g) => sum + g.orders.length, 0);
    const totalSuspiciousAmount = suspiciousGroups.reduce((sum, g) => 
        sum + g.orders.reduce((orderSum, order) => orderSum + order.total_amount, 0), 0
    );

    return {
        totalGroups: groups.length,
        suspiciousGroups: suspiciousGroups.length,
        normalOrders: groups.filter(g => !g.isSuspicious).length,
        totalSuspiciousOrders,
        totalSuspiciousAmount,
        suspiciousGroupDetails: suspiciousGroups.map(g => ({
            orderCount: g.orders.length,
            customerName: g.orders[0].customer.name,
            totalAmount: g.orders.reduce((sum, order) => sum + order.total_amount, 0),
            minutesDiff: g.minutesDiff,
            orderIds: g.orders.map(o => o.id)
        }))
    };
}

/**
 * Check if a specific order is part of a suspicious group
 */
export function isOrderSuspicious(orderId: number, groups: OrderGroup[]): boolean {
    return groups.some(group => 
        group.isSuspicious && group.orders.some(order => order.id === orderId)
    );
}

/**
 * Get the suspicious group that contains a specific order
 */
export function getSuspiciousGroupForOrder(orderId: number, groups: OrderGroup[]): OrderGroup | null {
    return groups.find(group => 
        group.isSuspicious && group.orders.some(order => order.id === orderId)
    ) || null;
}
