import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { CalendarIcon, Download, TrendingUp, DollarSign, ShoppingCart, Percent } from 'lucide-react';
import { useState } from 'react';

interface Sale {
  id: number;
  customer: {
    name: string;
    email: string;
  };
  total_amount: number;
  operational_expense: number;
  status: string;
  created_at: string;
  admin?: {
    name: string;
  };
}

interface MonthlyExpense {
  month: string;
  total_expense: number;
  order_count: number;
}

interface Summary {
  total_operational_expenses: number;
  total_orders: number;
  average_operational_expense: number;
  total_revenue: number;
}

interface OperationalExpensesPageProps {
  sales: Sale[];
  summary: Summary;
  monthlyExpenses: MonthlyExpense[];
  filters: {
    start_date?: string;
    end_date?: string;
  };
}

export default function OperationalExpensesPage({ 
  sales, 
  summary, 
  monthlyExpenses, 
  filters 
}: OperationalExpensesPageProps) {
  const [startDate, setStartDate] = useState(filters.start_date || '');
  const [endDate, setEndDate] = useState(filters.end_date || '');

  const handleFilter = () => {
    router.get(route('admin.operational-expenses.index'), {
      start_date: startDate,
      end_date: endDate,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    router.get(route('admin.operational-expenses.report'), {
      start_date: startDate,
      end_date: endDate,
      format: format,
    });
  };

  const expensePercentage = summary.total_revenue > 0 
    ? (summary.total_operational_expenses / summary.total_revenue) * 100 
    : 0;

  return (
    <AppSidebarLayout>
      <Head title="Operational Expenses" />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Operational Expenses</h1>
            <p className="text-muted-foreground">
              Track and manage operational expenses from sales
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExport('csv')}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={() => handleExport('pdf')}>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Operational Expenses</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₱{summary.total_operational_expenses.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">
                From {summary.total_orders} orders
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average per Order</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₱{summary.average_operational_expense.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">
                Per approved order
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₱{summary.total_revenue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">
                From all orders
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expense Percentage</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {expensePercentage.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Of total revenue
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter by Date Range</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <Button onClick={handleFilter}>
                <CalendarIcon className="h-4 w-4 mr-2" />
                Apply Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Expenses Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Operational Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyExpenses.map((expense) => (
                <div key={expense.month} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">
                      {format(new Date(expense.month + '-01'), 'MMMM yyyy')}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {expense.order_count} orders
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">
                      ₱{expense.total_expense.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sales Table */}
        <Card>
          <CardHeader>
            <CardTitle>Operational Expenses by Order</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Order ID</th>
                    <th className="text-left p-2">Customer</th>
                    <th className="text-left p-2">Date</th>
                    <th className="text-right p-2">Total Amount</th>
                    <th className="text-right p-2">Operational Expense</th>
                    <th className="text-right p-2">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => {
                    const percentage = sale.total_amount > 0 
                      ? (sale.operational_expense / sale.total_amount) * 100 
                      : 0;
                    
                    return (
                      <tr key={sale.id} className="border-b">
                        <td className="p-2">
                          <Link 
                            href={route('admin.orders.show', sale.id)}
                            className="text-blue-600 hover:underline"
                          >
                            #{sale.id}
                          </Link>
                        </td>
                        <td className="p-2">{sale.customer.name}</td>
                        <td className="p-2">
                          {format(new Date(sale.created_at), 'MMM dd, yyyy')}
                        </td>
                        <td className="p-2 text-right">
                          ₱{sale.total_amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-2 text-right font-semibold">
                          ₱{sale.operational_expense.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-2 text-right">
                          {percentage.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              {sales.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No operational expenses found for the selected period.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppSidebarLayout>
  );
}
