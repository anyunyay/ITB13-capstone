import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/use-translation';

interface ReportSummary {
  total_orders: number;
  total_revenue: number;
  total_subtotal: number;
  total_coop_share: number;
  total_member_share: number;
  pending_orders: number;
  approved_orders: number;
  rejected_orders: number;
  delivered_orders: number;
}

interface ReportSummaryCardsProps {
  summary: ReportSummary;
}

export function ReportSummaryCards({ summary }: ReportSummaryCardsProps) {
  const t = useTranslation();

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2">
      <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t('admin.total_orders') || 'Total Orders'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">{summary.total_orders}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {t('admin.all_orders') || 'All orders'}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t('admin.total_revenue')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">
            ₱{Number(summary.total_revenue).toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {t('admin.gross_revenue')}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t('admin.pending_orders_label')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-yellow-600">{summary.pending_orders}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {t('admin.awaiting_approval')}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t('admin.approved_orders_label')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">{summary.approved_orders}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {t('admin.approved_orders_desc')}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t('admin.rejected_orders_label')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-red-600">{summary.rejected_orders}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {t('admin.rejected_orders_desc')}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t('admin.delivered_orders_label')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-600">{summary.delivered_orders}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {t('admin.successfully_delivered')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
