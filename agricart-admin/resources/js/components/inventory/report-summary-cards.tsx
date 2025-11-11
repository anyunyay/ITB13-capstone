import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/use-translation';
import { ReportSummary } from '@/types/inventory-report';

interface ReportSummaryCardsProps {
  summary: ReportSummary;
}

export function ReportSummaryCards({ summary }: ReportSummaryCardsProps) {
  const t = useTranslation();

  const summaryItems = [
    { key: 'total_stocks', value: summary.total_stocks, label: t('admin.total_stocks'), desc: t('admin.all_inventory_items'), color: 'text-foreground' },
    { key: 'total_quantity', value: summary.total_quantity, label: t('admin.total_quantity'), desc: t('admin.available_plus_sold_units'), color: 'text-primary' },
    { key: 'available_stocks', value: summary.available_stocks, label: t('admin.available_stocks'), desc: t('admin.units_available_count', { count: summary.available_quantity }), color: 'text-primary' },
    { key: 'sold_stocks', value: summary.sold_stocks, label: t('admin.sold_stocks'), desc: t('admin.units_sold_count', { count: summary.sold_quantity }), color: 'text-secondary' },
    { key: 'completely_sold', value: summary.completely_sold_stocks, label: t('admin.completely_sold'), desc: t('admin.fully_depleted_items'), color: 'text-accent' },
    { key: 'removed_stocks', value: summary.removed_stocks, label: t('admin.removed_stocks'), desc: t('admin.removed_items'), color: 'text-destructive' },
    { key: 'total_products', value: summary.total_products, label: t('admin.total_products'), desc: t('admin.unique_products'), color: 'text-accent' },
    { key: 'total_members', value: summary.total_members, label: t('admin.total_members'), desc: t('admin.active_members'), color: 'text-muted-foreground' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2">
      {summaryItems.map((item) => (
        <Card key={item.key} className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">{item.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${item.color}`}>{item.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
