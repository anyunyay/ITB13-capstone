import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/use-translation';
import { format } from 'date-fns';
import { History, Package, TrendingUp, TrendingDown, RefreshCw, Trash2, Clock, User } from 'lucide-react';

interface StockTrail {
    id: number;
    stock_id: number;
    product_id: number;
    member_id: number;
    performed_by: number;
    action_type: string;
    old_quantity: number | null;
    new_quantity: number | null;
    category: string;
    notes: string | null;
    performed_by_type: string | null;
    created_at: string;
    product: {
        id: number;
        name: string;
    };
    member: {
        id: number;
        name: string;
    };
    performedByUser: {
        id: number;
        name: string;
        type: string;
    } | null;
}

interface StockTrailCardsProps {
    trails: StockTrail[];
    from: number;
    to: number;
    total: number;
}

export const StockTrailCards = ({ trails, from, to, total }: StockTrailCardsProps) => {
    const t = useTranslation();

    const getActionIcon = (actionType: string) => {
        switch (actionType.toLowerCase()) {
            case 'added':
            case 'created':
                return <Package className="h-5 w-5" />;
            case 'updated':
            case 'edited':
                return <RefreshCw className="h-5 w-5" />;
            case 'sold':
            case 'sale':
                return <TrendingDown className="h-5 w-5" />;
            case 'removed':
            case 'deleted':
                return <Trash2 className="h-5 w-5" />;
            case 'restored':
                return <TrendingUp className="h-5 w-5" />;
            default:
                return <History className="h-5 w-5" />;
        }
    };

    const getActionColor = (actionType: string) => {
        switch (actionType.toLowerCase()) {
            case 'added':
            case 'created':
            case 'restored':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'updated':
            case 'edited':
                return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'sold':
            case 'sale':
                return 'text-purple-600 bg-purple-50 border-purple-200';
            case 'removed':
            case 'deleted':
                return 'text-red-600 bg-red-50 border-red-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const formatActionType = (actionType: string) => {
        const formatted = actionType.replace(/_/g, ' ');
        return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    };

    const formatQuantity = (quantity: number | null, category: string) => {
        if (quantity === null) return 'N/A';
        
        if (category === 'Kilo') {
            return `${quantity} kg`;
        } else if (category === 'Pc') {
            return `${Math.floor(quantity)} pc`;
        } else if (category === 'Tali') {
            return `${Math.floor(quantity)} tali`;
        }
        return quantity.toString();
    };

    if (trails.length === 0) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <History className="h-5 w-5" />
                        {t('member.stock_history')}
                    </h2>
                </div>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center py-12">
                            <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <h3 className="text-lg font-semibold mb-2">{t('member.no_stock_trail_found')}</h3>
                            <p className="text-muted-foreground">{t('member.no_stock_changes_message')}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <History className="h-5 w-5" />
                    {t('member.stock_history')}
                </h2>
                <p className="text-sm text-muted-foreground">
                    {t('member.showing_entries', { from, to, total })}
                </p>
            </div>

            <div className="space-y-3">
                {trails.map((trail) => (
                    <Card key={trail.id} className="overflow-hidden">
                        <div className={`p-4 border-l-4 ${getActionColor(trail.action_type)}`}>
                            {/* Header with Action and Date */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    {getActionIcon(trail.action_type)}
                                    <div>
                                        <div className="font-semibold text-base">
                                            {formatActionType(trail.action_type)}
                                        </div>
                                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                            <Clock className="h-3 w-3" />
                                            {format(new Date(trail.created_at), 'MMM dd, yyyy HH:mm')}
                                        </div>
                                    </div>
                                </div>
                                <Badge variant="outline" className="ml-2">
                                    {trail.category}
                                </Badge>
                            </div>

                            {/* Product Name */}
                            <div className="mb-3">
                                <div className="text-sm text-muted-foreground mb-1">{t('member.product')}</div>
                                <div className="font-medium text-base">{trail.product.name}</div>
                            </div>

                            {/* Quantity Change */}
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <div>
                                    <div className="text-xs text-muted-foreground mb-1">{t('member.old_quantity')}</div>
                                    <div className="text-sm font-medium text-muted-foreground">
                                        {formatQuantity(trail.old_quantity, trail.category)}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground mb-1">{t('member.new_quantity')}</div>
                                    <div className="text-base font-semibold">
                                        {formatQuantity(trail.new_quantity, trail.category)}
                                    </div>
                                </div>
                            </div>

                            {/* Performed By */}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                <User className="h-3.5 w-3.5" />
                                <span>
                                    {trail.performedByUser?.name || t('member.system')}
                                    {trail.performed_by_type && (
                                        <span className="capitalize"> ({trail.performed_by_type})</span>
                                    )}
                                </span>
                            </div>

                            {/* Notes */}
                            {trail.notes && (
                                <div className="mt-3 pt-3 border-t">
                                    <div className="text-xs text-muted-foreground mb-1">{t('member.notes')}</div>
                                    <div className="text-sm">{trail.notes}</div>
                                </div>
                            )}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};
