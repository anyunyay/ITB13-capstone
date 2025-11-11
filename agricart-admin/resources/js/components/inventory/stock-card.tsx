import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import dayjs from 'dayjs';
import { useTranslation } from '@/hooks/use-translation';
import { Stock } from '@/types/inventory-report';

interface StockCardProps {
  stock: Stock;
}

export function StockCard({ stock }: StockCardProps) {
  const t = useTranslation();

  const getStatusBadge = (stock: Stock) => {
    if (stock.removed_at) {
      return (
        <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">
          {t('admin.removed')}
        </Badge>
      );
    } else if (stock.quantity == 0) {
      return (
        <Badge variant="default" className="bg-secondary/10 text-secondary border-secondary/20">
          {t('admin.sold')}
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
          {t('admin.available')}
        </Badge>
      );
    }
  };

  return (
    <Card className="bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        {/* Row 1: Header - Stock ID, Date, Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-sm text-foreground">
                {t('admin.stock_id_label', { id: stock.id })}
              </div>
              <div className="text-xs text-muted-foreground">
                {dayjs(stock.created_at).format('MMM DD, YYYY HH:mm')}
              </div>
            </div>
          </div>
          <div className="shrink-0 self-start sm:self-center">{getStatusBadge(stock)}</div>
        </div>

        {/* Row 2: All Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-3">
          {/* Product Name */}
          <div className="space-y-1 col-span-2 sm:col-span-1">
            <div className="text-xs font-medium text-muted-foreground">Product Name</div>
            <div className="text-sm text-foreground line-clamp-1" title={stock.product.name}>
              {stock.product.name}
            </div>
          </div>

          {/* Product Type */}
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground">{t('admin.type')}</div>
            <div className="text-sm text-foreground line-clamp-1" title={stock.product.produce_type}>
              {stock.product.produce_type}
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground">{t('admin.category')}</div>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs w-fit">
              {stock.category === 'Kilo'
                ? t('admin.category_kilo')
                : stock.category === 'Pc'
                  ? t('admin.category_pc')
                  : t('admin.category_tali')}
            </Badge>
          </div>

          {/* Quantity */}
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground">{t('admin.quantity')}</div>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs w-fit">
              {t('admin.quantity_units', { quantity: stock.quantity })}
            </Badge>
          </div>

          {/* Member */}
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground">{t('admin.member')}</div>
            <div className="text-sm text-foreground line-clamp-1" title={stock.member.name}>
              {stock.member.name}
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground">{t('admin.contact_number')}</div>
            <div
              className="text-sm text-foreground line-clamp-1"
              title={stock.member.contact_number || '-'}
            >
              {stock.member.contact_number || '-'}
            </div>
          </div>
        </div>

        {/* Additional Info: Removed Date and/or Notes */}
        {(stock.removed_at || stock.notes) && (
          <div className="mt-3 pt-3 border-t border-border flex flex-col sm:flex-row gap-2">
            {stock.removed_at && (
              <div className="flex items-center gap-2 px-3 py-2 bg-destructive/5 border border-destructive/20 rounded-md flex-1">
                <div className="w-1.5 h-1.5 bg-destructive rounded-full shrink-0"></div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-medium text-destructive">{t('admin.removed')}: </span>
                  <span className="text-xs text-destructive">
                    {dayjs(stock.removed_at).format('MMM DD, YYYY HH:mm')}
                  </span>
                </div>
              </div>
            )}

            {stock.notes && (
              <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 border border-border rounded-md flex-1">
                <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full shrink-0"></div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-medium text-foreground">{t('admin.notes')}: </span>
                  <span className="text-xs text-muted-foreground line-clamp-1" title={stock.notes}>
                    {stock.notes}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
