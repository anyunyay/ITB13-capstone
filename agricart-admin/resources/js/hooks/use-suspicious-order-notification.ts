import { useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import { OrderGroup } from '@/utils/order-grouping';

/**
 * Hook to send notifications when suspicious order patterns are detected
 * This triggers a backend notification without modifying order data
 */
export function useSuspiciousOrderNotification(orderGroups: OrderGroup[]) {
    const notifiedGroupsRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        const suspiciousGroups = orderGroups.filter(g => g.isSuspicious);

        suspiciousGroups.forEach((group) => {
            // Create a unique key for this group based on order IDs
            const groupKey = group.orders.map(o => o.id).sort().join('-');

            // Skip if we've already notified about this group
            if (notifiedGroupsRef.current.has(groupKey)) {
                return;
            }

            // Mark as notified
            notifiedGroupsRef.current.add(groupKey);

            // Send notification request to backend
            const orderIds = group.orders.map(o => o.id);
            const customerName = group.orders[0].customer.name;
            const totalAmount = group.orders.reduce((sum, o) => sum + o.total_amount, 0);

            // Make a POST request to trigger notification
            fetch(route('admin.orders.notify-suspicious'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    order_ids: orderIds,
                    customer_name: customerName,
                    total_amount: totalAmount,
                    minutes_diff: group.minutesDiff,
                    order_count: group.orders.length
                })
            }).catch((error) => {
                console.error('Failed to send suspicious order notification:', error);
            });
        });
    }, [orderGroups]);
}
