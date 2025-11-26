import { Order } from '@/types/orders';

export interface OrderGroup {
    type: 'single' | 'suspicious';
    orders: Order[];
    isSuspicious: boolean;
    minutesDiff?: number;
}

/**
 * Groups orders by customer and time window for suspicious pattern detection
 * 
 * IMPORTANT RULES:
 * 1. If there are approved/rejected orders in the time window, treat each pending order as SINGLE suspicious
 * 2. Only group multiple PENDING orders together if there are NO approved/rejected orders in the window
 * 3. This prevents trying to merge orders after some have already been processed
 */
export function groupSuspiciousOrders(orders: Order[], timeWindowMinutes: number = 10): OrderGroup[] {
    const groups: OrderGroup[] = [];
    const processedOrderIds = new Set<number>();

    // Separate orders by status
    const pendingOrders = orders.filter(order => 
        order.status === 'pending' || order.status === 'delayed'
    );
    
    const processedOrders = orders.filter(order => 
        order.status === 'approved' || order.status === 'rejected'
    );

    // Sort orders by created_at
    const sortedPendingOrders = [...pendingOrders].sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    sortedPendingOrders.forEach((order) => {
        // Skip if already processed
        if (processedOrderIds.has(order.id)) {
            return;
        }

        // Check if there are any approved/rejected orders from same customer within time window
        const hasProcessedOrdersInWindow = processedOrders.some((processedOrder) => {
            // Must be from same customer
            if (order.customer.email !== processedOrder.customer.email) {
                return false;
            }

            // Check time window
            const orderTime = new Date(order.created_at).getTime();
            const processedOrderTime = new Date(processedOrder.created_at).getTime();
            const timeDiffMinutes = Math.abs(orderTime - processedOrderTime) / 60000;

            return timeDiffMinutes <= timeWindowMinutes;
        });

        // If there are processed orders in the window, treat this as a SINGLE suspicious order
        // Do NOT group with other pending orders (to prevent merge attempts)
        if (hasProcessedOrdersInWindow) {
            processedOrderIds.add(order.id);
            
            groups.push({
                type: 'suspicious',
                orders: [order], // Single order only
                isSuspicious: true,
                minutesDiff: 0 // Single order, no time diff
            });
            
            return; // Don't group with other orders
        }

        // No processed orders in window - check for other pending orders to group
        const relatedPendingOrders = sortedPendingOrders.filter((otherOrder) => {
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

        // Mark all related pending orders as processed
        relatedPendingOrders.forEach(o => processedOrderIds.add(o.id));

        // If 2 or more pending orders found (and no processed orders in window), create a group
        if (relatedPendingOrders.length >= 2) {
            const firstOrderTime = new Date(relatedPendingOrders[0].created_at).getTime();
            const lastOrderTime = new Date(relatedPendingOrders[relatedPendingOrders.length - 1].created_at).getTime();
            const minutesDiff = Math.round((lastOrderTime - firstOrderTime) / 60000);

            groups.push({
                type: 'suspicious',
                orders: relatedPendingOrders,
                isSuspicious: true,
                minutesDiff
            });
        } else {
            // Single pending order, check if it's suspicious (marked by backend)
            const isSuspicious = order.is_suspicious || false;
            
            groups.push({
                type: isSuspicious ? 'suspicious' : 'single',
                orders: [order],
                isSuspicious: isSuspicious,
                minutesDiff: 0
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
