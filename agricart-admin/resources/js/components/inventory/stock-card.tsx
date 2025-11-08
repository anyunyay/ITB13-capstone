import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      return <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">{t('admin.removed')}</Badge>;
    } else if (stock.quantity == 0) {
      return <Badge variant="default" className="bg-secondary/10 text-secondary border-secondary/20">{t('admin.sold')}</Badge>;
    } else {
      return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">{t('admin.available')}</Badge>;
    }
  };

  return (
    <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary p-2 rounded-lg">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-lg text-foreground">{t('admin.stock_id_label', { id: stock.id })}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {t('admin.created_on', { date: dayjs(stock.created_at).format('MMM DD, YYYY HH:mm') })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(stock)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              {t('admin.product_information')}
            </h4>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium text-foreground">{t('admin.name')}:</span>
                <span className="text-muted-foreground ml-2">{stock.product.name}</span>
              </p>
              <p className="text-sm">
                <span className="font-medium text-foreground">{t('admin.type')}:</span>
                <span className="text-muted-foreground ml-2">{stock.product.produce_type}</span>
              </p>
              <p className="text-sm flex items-center">
                <span className="font-medium text-foreground">{t('admin.category')}:</span>
                <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/20">
                  {stock.category === 'Kilo' ? t('admin.category_kilo') : stock.category === 'Pc' ? t('admin.category_pc') : t('admin.category_tali')}
                </Badge>
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-secondary rounded-full"></div>
              {t('admin.stock_details')}
            </h4>
            <div className="space-y-2">
              <p className="text-sm flex items-center">
                <span className="font-medium text-foreground">{t('admin.quantity')}:</span>
                <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/20">
                  {t('admin.quantity_units', { quantity: stock.quantity })}
                </Badge>
              </p>
              <p className="text-sm">
                <span className="font-medium text-foreground">{t('admin.member')}:</span>
                <span className="text-muted-foreground ml-2">{stock.member.name}</span>
              </p>
              {stock.member.contact_number && (
                <p className="text-sm">
                  <span className="font-medium text-foreground">{t('admin.contact_number')}:</span>
                  <span className="text-muted-foreground ml-2">{stock.member.contact_number}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {stock.removed_at && (
          <div className="mt-6 p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
            <h5 className="font-semibold text-sm mb-2 text-destructive flex items-center gap-2">
              <div className="w-2 h-2 bg-destructive rounded-full"></div>
              {t('admin.removed')}
            </h5>
            <p className="text-sm text-destructive">
              {dayjs(stock.removed_at).format('MMM DD, YYYY HH:mm')}
            </p>
          </div>
        )}

        {stock.notes && (
          <div className="mt-6 p-4 bg-muted/50 border border-border rounded-lg">
            <h5 className="font-semibold text-sm mb-2 text-foreground flex items-center gap-2">
              <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
              {t('admin.notes')}
            </h5>
            <p className="text-sm text-muted-foreground">{stock.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
