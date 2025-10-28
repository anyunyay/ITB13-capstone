import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { usePermissions } from '@/hooks/use-permissions';
import { PermissionGate } from '@/components/permission-gate';
import { PermissionGuard } from '@/components/permission-guard';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { DollarSign, ShoppingCart, TrendingUp, Users, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

interface MemberSale {
  member_id: number;
  member_name: string;
  member_email: string;
  total_orders: number;
  total_revenue: number;
  total_coop_share: number;
  total_member_share: number;
  total_cogs: number;
  total_gross_profit: number;
  total_quantity_sold: number;
}

interface MemberSalesPageProps {
  memberSales: MemberSale[];
  filters: {
    start_date?: string;
    end_date?: string;
    member_id?: string;
  };
}

export default function MemberSales({ memberSales, filters }: MemberSalesPageProps) {
  const { can } = usePermissions();
  const [localFilters, setLocalFilters] = useState(filters);

  // Calculate summary statistics
  const totalRevenue = memberSales.reduce((sum, member) => sum + Number(member.total_revenue || 0), 0);
  const totalCoopShare = memberSales.reduce((sum, member) => sum + Number(member.total_coop_share || 0), 0);
  const totalMemberShare = memberSales.reduce((sum, member) => sum + Number(member.total_member_share || 0), 0);
  const totalCogs = memberSales.reduce((sum, member) => sum + Number(member.total_cogs || 0), 0);
  const totalGrossProfit = memberSales.reduce((sum, member) => sum + Number(member.total_gross_profit || 0), 0);
  const totalOrders = memberSales.reduce((sum, member) => sum + Number(member.total_orders || 0), 0);
  const totalQuantity = memberSales.reduce((sum, member) => sum + Number(member.total_quantity_sold || 0), 0);
  const averageRevenue = memberSales.length > 0 ? totalRevenue / memberSales.length : 0;

  const exportReport = (format: 'csv' | 'pdf') => {
    const params = new URLSearchParams();
    if (localFilters.start_date) params.append('start_date', localFilters.start_date);
    if (localFilters.end_date) params.append('end_date', localFilters.end_date);
    if (localFilters.member_id) params.append('member_id', localFilters.member_id);
    params.append('format', format);
    params.append('export_type', 'members');
    
    if (format === 'csv') {
      // For CSV: just download, no display
      const downloadUrl = `${route('admin.sales.report')}?${params.toString()}`;
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = `member_sales_report_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${format}`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } else {
      // For PDF: download and display
      const downloadUrl = `${route('admin.sales.report')}?${params.toString()}`;
      
      // Create display URL for viewing
      const displayParams = new URLSearchParams();
      if (localFilters.start_date) displayParams.append('start_date', localFilters.start_date);
      if (localFilters.end_date) displayParams.append('end_date', localFilters.end_date);
      if (localFilters.member_id) displayParams.append('member_id', localFilters.member_id);
      displayParams.append('format', format);
      displayParams.append('export_type', 'members');
      displayParams.append('display', 'true');
      const displayUrl = `${route('admin.sales.report')}?${displayParams.toString()}`;
      
      // Download the file
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = `member_sales_report_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${format}`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // Open display in new tab after a short delay
      setTimeout(() => {
        window.open(displayUrl, '_blank');
      }, 500);
    }
  };

  return (
    <PermissionGuard 
      permissions={['view sales']}
      pageTitle="Member Sales Access Denied"
    >
      <AppLayout>
        <Head title="Member Sales" />
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Member Sales Performance</h1>
            </div>
            <div className="flex gap-2">
              <PermissionGate permission="generate sales report">
                <div className="flex gap-1">
                  <Button onClick={() => exportReport('csv')} variant="outline" size="sm">
                    Export CSV
                  </Button>
                  <Button onClick={() => exportReport('pdf')} variant="outline" size="sm">
                    Export PDF
                  </Button>
                </div>
              </PermissionGate>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₱{Number(totalRevenue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <p className="text-xs text-muted-foreground">
                  From all members
                </p>
              </CardContent>
            </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Co-op Share (10%)</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">₱{Number(totalCoopShare).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  <p className="text-xs text-muted-foreground">
                    Added on top of product prices
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenue (100%)</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">₱{Number(totalMemberShare).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  <p className="text-xs text-muted-foreground">
                    Full product revenue to members
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">COGS</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">₱{Number(totalCogs).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  <p className="text-xs text-muted-foreground">
                    Cost of Goods Sold
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Gross Profit</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">₱{Number(totalGrossProfit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  <p className="text-xs text-muted-foreground">
                    Revenue - COGS
                  </p>
                </CardContent>
              </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalOrders}</div>
                <p className="text-xs text-muted-foreground">
                  Across all members
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₱{Number(averageRevenue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <p className="text-xs text-muted-foreground">
                  Per member
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{memberSales.length}</div>
                <p className="text-xs text-muted-foreground">
                  With sales activity
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Member Sales Table */}
          <Card>
            <CardHeader>
              <CardTitle>Member Sales Breakdown</CardTitle>
              <p className="text-sm text-muted-foreground">
                Detailed performance metrics for each member
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead>Total Orders</TableHead>
                    <TableHead className="text-right">Total Revenue</TableHead>
                    <TableHead className="text-right">Co-op Share</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">COGS</TableHead>
                    <TableHead className="text-right">Gross Profit</TableHead>
                    <TableHead>Quantity Sold</TableHead>
                    <TableHead className="text-right">Average Revenue</TableHead>
                    <TableHead>Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {memberSales.map((member, index) => {
                    const memberRevenue = Number(member.total_revenue || 0);
                    const memberOrders = Number(member.total_orders || 0);
                    const averageRevenue = memberOrders > 0 ? memberRevenue / memberOrders : 0;
                    const performancePercentage = totalRevenue > 0 ? (memberRevenue / totalRevenue) * 100 : 0;
                    
                    return (
                      <TableRow key={member.member_id}>
                        <TableCell>
                          <Badge variant={index < 3 ? "default" : "secondary"}>
                            #{index + 1}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{member.member_name}</div>
                            <div className="text-sm text-muted-foreground">{member.member_email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{member.total_orders}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="font-medium">₱{Number(member.total_revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="font-medium text-green-600">₱{Number(member.total_coop_share || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="font-medium text-blue-600">₱{Number(member.total_member_share || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="font-medium text-orange-600">₱{Number(member.total_cogs || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="font-medium text-green-600">₱{Number(member.total_gross_profit || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{member.total_quantity_sold}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="font-medium">₱{Number(averageRevenue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${Math.min(performancePercentage, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {performancePercentage.toFixed(1)}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {memberSales.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center text-muted-foreground">
                        No member sales data found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Performance Insights */}
          {memberSales.length > 0 && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-2">
              <Card>
                <CardHeader>
                  <CardTitle>Top Performers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {memberSales.slice(0, 3).map((member, index) => (
                      <div key={member.member_id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={index === 0 ? "default" : index === 1 ? "secondary" : "outline"}>
                            #{index + 1}
                          </Badge>
                          <div>
                            <div className="font-medium">{member.member_name}</div>
                            <div className="text-sm text-muted-foreground">₱{Number(member.total_revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {memberSales.slice(0, 5).map((member) => {
                      const memberRevenue = Number(member.total_revenue || 0);
                      const percentage = totalRevenue > 0 ? (memberRevenue / totalRevenue) * 100 : 0;
                      return (
                        <div key={member.member_id} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{member.member_name}</span>
                            <span className="text-muted-foreground">{percentage.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </AppLayout>
    </PermissionGuard>
  );
}
