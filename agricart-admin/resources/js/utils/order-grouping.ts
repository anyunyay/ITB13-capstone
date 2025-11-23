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

    // Filter out merged orders before grouping
    const activeOrders = orders.filter(order => order.status !== 'merged');

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

        // If 2 or more orders found, create a suspicious group
        if (relatedOrders.length >= 2) {
            const firstOrderTime = new Date(relatedOrders[0].created_at).getTime();
            const lastOrderTime = new Date(relatedOrders[relatedOrders.length - 1].created_at).getTime();
            const minutesDiff = Math.round((lastOrderTime - firstOrderTime) / 60000);

            groups.push({
                type: 'suspicious',
                orders: relatedOrders,
                isSuspicious: true,
                minutesDiff
            });
        } else {
            // Single order, not suspicious
            groups.push({
                type: 'single',
                orders: [order],
                isSuspicious: false
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
