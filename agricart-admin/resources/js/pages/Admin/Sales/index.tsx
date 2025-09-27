import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { usePermissions } from '@/hooks/use-permissions';
import { PermissionGate } from '@/components/permission-gate';
import { PermissionGuard } from '@/components/permission-guard';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Calendar, DollarSign, ShoppingCart, Users, TrendingUp } from 'lucide-react';
import { useSubsystemRefresh } from '@/hooks/useSubsystemRefresh';
import { useMemo, useState } from 'react';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { SkeletonCard, SkeletonTable } from '@/components/SkeletonLoader';
import { SmoothTransition, FadeIn } from '@/components/SmoothTransition';

interface Sale {
  id: number;
  customer: {
    name: string;
    email: string;
  };
  total_amount: number;
  created_at: string;
  admin?: {
    name: string;
  };
  logistic?: {
    name: string;
  };
}

interface MemberSale {
  member_id: number;
  member_name: string;
  member_email: string;
  total_orders: number;
  total_revenue: number;
  total_quantity_sold: number;
}

interface SalesPageProps {
  sales: Sale[];
  summary: {
    total_revenue: number;
    total_orders: number;
    average_order_value: number;
    total_customers: number;
  };
  memberSales: MemberSale[];
  filters: {
    start_date?: string;
    end_date?: string;
  };
}

export default function SalesIndex({ sales, summary, memberSales, filters }: SalesPageProps) {
  const { can } = usePermissions();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Memoize the initial data to prevent infinite loops
  const initialData = useMemo(() => ({
    sales: { data: sales, summary }
  }), [sales, summary]);

  // Memoize the options to prevent infinite loops
  const options = useMemo(() => ({
    checkInterval: 5000, // Check for changes every 5 seconds
    refreshInterval: 60000, // General refresh every 1 minute
    enableChangeDetection: true,
    enablePeriodicRefresh: true,
    refreshOnFocus: true,
    refreshOnVisibilityChange: true,
    only: ['sales'], // Only refresh sales data
  }), []);

  // Enable subsystem refresh for sales
  useSubsystemRefresh(initialData, options);

  // Handle initial load
  useMemo(() => {
    if (sales && sales.length > 0) {
      setTimeout(() => setIsInitialLoad(false), 500);
    }
  }, [sales]);

  return (
    <PermissionGuard 
      permissions={['view sales', 'generate sales report']}
      pageTitle="Sales Management Access Denied"
    >
      <LoadingOverlay 
        isLoading={isInitialLoad} 
        message="Loading sales data..." 
        excludeSidebar={true}
      />
      
      <AppLayout>
        <Head title="Sales Management" />
        <div className="p-6">
          <FadeIn delay={100}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold">Sales Management</h1>
              </div>
              <div className="flex gap-2">
                <PermissionGate permission="view sales">
                  <Link href={route('admin.sales.memberSales')}>
                    <Button variant="outline">
                      Member Sales
                    </Button>
                  </Link>
                </PermissionGate>
                               <PermissionGate permission="generate sales report">
                   <Link href={route('admin.sales.report')}>
                     <Button variant="outline">
                       View Report
                     </Button>
                   </Link>
                 </PermissionGate>
              </div>
            </div>
          </FadeIn>

          {/* Summary Cards */}
          <SmoothTransition delay={200}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">PHP {Number(summary.total_revenue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <p className="text-xs text-muted-foreground">
                  From {summary.total_orders} orders
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.total_orders}</div>
                <p className="text-xs text-muted-foreground">
                  Approved orders
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">PHP {Number(summary.average_order_value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <p className="text-xs text-muted-foreground">
                  Per order
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.total_customers}</div>
                <p className="text-xs text-muted-foreground">
                  Unique customers
                </p>
              </CardContent>
            </Card>
            </div>
          </SmoothTransition>

          <Tabs defaultValue="sales" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="sales">All Sales</TabsTrigger>
              <TabsTrigger value="members">Member Sales</TabsTrigger>
            </TabsList>

            <TabsContent value="sales" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Sales</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sale ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Processed By</TableHead>
                        <TableHead>Logistic</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sales.map((sale) => (
                        <TableRow key={sale.id}>
                          <TableCell className="font-medium">#{sale.id}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{sale.customer.name}</div>
                              <div className="text-sm text-muted-foreground">{sale.customer.email}</div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">PHP {Number(sale.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                          <TableCell>{format(new Date(sale.created_at), 'MMM dd, yyyy HH:mm')}</TableCell>
                          <TableCell>{sale.admin?.name || 'N/A'}</TableCell>
                          <TableCell>{sale.logistic?.name || 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                      {sales.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground">
                            No sales found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="members" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Member Sales Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Member</TableHead>
                        <TableHead>Total Orders</TableHead>
                        <TableHead>Total Revenue</TableHead>
                        <TableHead>Quantity Sold</TableHead>
                        <TableHead>Average Revenue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {memberSales.map((member) => (
                        <TableRow key={member.member_id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{member.member_name}</div>
                              <div className="text-sm text-muted-foreground">{member.member_email}</div>
                            </div>
                          </TableCell>
                          <TableCell>{member.total_orders}</TableCell>
                          <TableCell className="font-medium">PHP {Number(member.total_revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                          <TableCell>{member.total_quantity_sold}</TableCell>
                          <TableCell>PHP {member.total_orders > 0 ? (Number(member.total_revenue || 0) / member.total_orders).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</TableCell>
                        </TableRow>
                      ))}
                      {memberSales.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            No member sales data found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </AppLayout>
    </PermissionGuard>
  );
}
