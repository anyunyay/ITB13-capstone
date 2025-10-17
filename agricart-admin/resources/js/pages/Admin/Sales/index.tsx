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
  total_coop_share: number;
  total_quantity_sold: number;
}

interface SalesPageProps {
  sales: Sale[];
  summary: {
    total_revenue: number;
    total_coop_share: number;
    total_member_share: number;
    total_orders: number;
    average_order_value: number;
    average_coop_share: number;
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

  return (
    <PermissionGuard 
      permissions={['view sales', 'generate sales report']}
      pageTitle="Sales Management Access Denied"
    >
      <AppLayout>
        <Head title="Sales Management" />
        <div className="p-6">
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

          {/* Summary Cards */}
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
                <CardTitle className="text-sm font-medium">Co-op Share (10%)</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">PHP {Number(summary.total_coop_share).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <p className="text-xs text-muted-foreground">
                  Average: PHP {Number(summary.average_coop_share).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Member Share (90%)</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">PHP {Number(summary.total_member_share).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <p className="text-xs text-muted-foreground">
                  Distributed to members
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
                        <TableHead>Total Amount</TableHead>
                        <TableHead>Co-op Share</TableHead>
                        <TableHead>Member Share</TableHead>
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
                          <TableCell className="text-green-600 font-medium">PHP {Number(sale.coop_share || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                          <TableCell className="text-blue-600 font-medium">PHP {Number(sale.member_share || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                          <TableCell>{format(new Date(sale.created_at), 'MMM dd, yyyy HH:mm')}</TableCell>
                          <TableCell>{sale.admin?.name || 'N/A'}</TableCell>
                          <TableCell>{sale.logistic?.name || 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                      {sales.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-muted-foreground">
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
                        <TableHead>Co-op Share</TableHead>
                        <TableHead>Member Share</TableHead>
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
                          <TableCell className="text-green-600 font-medium">PHP {Number(member.total_coop_share || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                          <TableCell className="text-blue-600 font-medium">PHP {Number(member.total_member_share || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                          <TableCell>{member.total_quantity_sold}</TableCell>
                          <TableCell>PHP {member.total_orders > 0 ? (Number(member.total_revenue || 0) / member.total_orders).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</TableCell>
                        </TableRow>
                      ))}
                      {memberSales.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground">
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
