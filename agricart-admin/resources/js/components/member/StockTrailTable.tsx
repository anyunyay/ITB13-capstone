import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTranslation } from '@/hooks/use-translation';
import { format } from 'date-fns';
import { History, Package, TrendingUp, TrendingDown, RefreshCw, Trash2 } from 'lucide-react';

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
    performedByUser?: {
        id: number;
        name: string;
        type: string;
    } | null;
    performed_by_user?: {
        id: number;
        name: string;
        type: string;
    } | null;
}

interface StockTrailTableProps {
    trails: StockTrail[];
    from: number;
    to: number;
    total: number;
}

export const StockTrailTable = ({ trails, from, to, total }: StockTrailTableProps) => {
    const t = useTranslation();

    // Debug: Log the first trail to see what data we're receiving
    if (trails.length > 0) {
        console.log('Stock Trail Sample:', trails[0]);
        console.log('performedByUser (camelCase):', trails[0].performedByUser);
        console.log('performed_by_user (snake_case):', (trails[0] as any).performed_by_user);
        console.log('performed_by:', trails[0].performed_by);
        console.log('performed_by_type:', trails[0].performed_by_type);
        console.log('All keys:', Object.keys(trails[0]));
    }

    const getActionIcon = (actionType: string) => {
        switch (actionType.toLowerCase()) {
            case 'added':
            case 'created':
                return <Package className="h-4 w-4" />;
            case 'updated':
            case 'edited':
                return <RefreshCw className="h-4 w-4" />;
            case 'sold':
            case 'sale':
                return <TrendingDown className="h-4 w-4" />;
            case 'removed':
            case 'deleted':
                return <Trash2 className="h-4 w-4" />;
            case 'restored':
                return <TrendingUp className="h-4 w-4" />;
            default:
                return <History className="h-4 w-4" />;
        }
    };

    const getActionBadgeVariant = (actionType: string): "default" | "secondary" | "destructive" | "outline" => {
        switch (actionType.toLowerCase()) {
            case 'added':
            case 'created':
            case 'restored':
                return 'default';
            case 'updated':
            case 'edited':
                return 'secondary';
            case 'sold':
            case 'sale':
                return 'outline';
            case 'removed':
            case 'deleted':
                return 'destructive';
            default:
                return 'secondary';
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
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        {t('member.stock_history')}
                    </CardTitle>
                    <CardDescription>{t('member.view_stock_changes')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12">
                        <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">{t('member.no_stock_trail_found')}</h3>
                        <p className="text-muted-foreground">{t('member.no_stock_changes_message')}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    {t('member.stock_history')}
                </CardTitle>
                <CardDescription>
                    {t('member.showing_entries', { from, to, total })}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="whitespace-nowrap">{t('member.date')}</TableHead>
                                <TableHead className="whitespace-nowrap">{t('member.product')}</TableHead>
                                <TableHead className="whitespace-nowrap">{t('member.action')}</TableHead>
                                <TableHead className="whitespace-nowrap">{t('member.category')}</TableHead>
                                <TableHead className="whitespace-nowrap text-right">{t('member.old_quantity')}</TableHead>
                                <TableHead className="whitespace-nowrap text-right">{t('member.new_quantity')}</TableHead>
                                <TableHead className="whitespace-nowrap">{t('member.performed_by')}</TableHead>
                                <TableHead className="whitespace-nowrap">{t('member.notes')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {trails.map((trail) => (
                                <TableRow key={trail.id} className="hover:bg-muted/50">
                                    <TableCell className="whitespace-nowrap">
                                        <div className="text-sm">
                                            {format(new Date(trail.created_at), 'MMM dd, yyyy')}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {format(new Date(trail.created_at), 'HH:mm:ss')}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">{trail.product.name}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge 
                                            variant={getActionBadgeVariant(trail.action_type)}
                                            className="flex items-center gap-1 w-fit"
                                        >
                                            {getActionIcon(trail.action_type)}
                                            {formatActionType(trail.action_type)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{trail.category}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <span className="text-muted-foreground">
                                            {formatQuantity(trail.old_quantity, trail.category)}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <span className="font-semibold">
                                            {formatQuantity(trail.new_quantity, trail.category)}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {(() => {
                                            const user = trail.performedByUser || trail.performed_by_user;
                                            const userName = user?.name || t('member.system');
                                            const userType = user?.type || trail.performed_by_type;
                                            
                                            return (
                                                <>
                                                    <div className="text-sm font-medium">
                                                        {userName}
                                                    </div>
                                                    {userType && (
                                                        <Badge variant="outline" className="text-xs capitalize mt-1">
                                                            {userType}
                                                        </Badge>
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </TableCell>
                                    <TableCell>
                                        <div className="max-w-xs truncate text-sm text-muted-foreground" title={trail.notes || ''}>
                                            {trail.notes || '-'}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};
