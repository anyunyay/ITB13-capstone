import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import dayjs from 'dayjs';
import { Users, Shield, CheckCircle, UserCheck } from 'lucide-react';

interface Staff {
  id: number;
  name: string;
  email: string;
  created_at: string;
  email_verified_at: string | null;
  permissions: Array<{ name: string }>;
}

interface ReportSummary {
  total_staff: number;
  total_permissions: number;
  active_staff: number;
  staff_with_permissions: number;
}

interface ReportPageProps {
  staff: Staff[];
  summary: ReportSummary;
}

export default function StaffReport({ staff, summary }: ReportPageProps) {
  const exportReport = (format: 'csv' | 'pdf') => {
    const params = new URLSearchParams();
    params.append('format', format);
    
    window.open(`${route('admin.staff.report')}?${params.toString()}`, '_blank');
  };

  return (
    <AppLayout>
      <Head title="Staff Report" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Staff Report</h1>
          <div className="flex gap-2">
            <Button onClick={() => exportReport('csv')} variant="outline">
              Export CSV
            </Button>
            <Button onClick={() => exportReport('pdf')} variant="outline">
              Export PDF
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_staff}</div>
              <p className="text-xs text-muted-foreground">
                Staff members
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{summary.active_staff}</div>
              <p className="text-xs text-muted-foreground">
                Email verified
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">With Permissions</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{summary.staff_with_permissions}</div>
              <p className="text-xs text-muted-foreground">
                Have assigned permissions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Permissions</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{summary.total_permissions}</div>
              <p className="text-xs text-muted-foreground">
                Available permissions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Staff Table */}
        <Card className="mb-8">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Staff Members ({staff.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-3 py-2 text-left font-medium text-gray-700 text-xs uppercase tracking-wider">ID</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-700 text-xs uppercase tracking-wider">Name</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-700 text-xs uppercase tracking-wider">Email</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-700 text-xs uppercase tracking-wider">Permissions</th>
                    <th className="px-3 py-2 text-center font-medium text-gray-700 text-xs uppercase tracking-wider">Status</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-700 text-xs uppercase tracking-wider">Created</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {staff.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2 whitespace-nowrap text-xs font-mono text-gray-600">#{member.id}</td>
                      <td className="px-3 py-2 max-w-xs">
                        <div className="text-sm font-medium text-gray-900 truncate" title={member.name}>
                          {member.name}
                        </div>
                      </td>
                      <td className="px-3 py-2 max-w-xs">
                        <div className="text-sm text-gray-900 truncate" title={member.email}>
                          {member.email}
                        </div>
                      </td>
                      <td className="px-3 py-2 max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {member.permissions.slice(0, 3).map((permission) => (
                            <Badge key={permission.name} variant="secondary" className="text-xs">
                              {permission.name}
                            </Badge>
                          ))}
                          {member.permissions.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{member.permissions.length - 3} more
                            </Badge>
                          )}
                          {member.permissions.length === 0 && (
                            <span className="text-muted-foreground text-xs">No permissions</span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center">
                        {member.email_verified_at ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            Pending
                          </Badge>
                        )}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">
                        {dayjs(member.created_at).format('MMM DD, YYYY')}
                        <div className="text-xs text-gray-400">{dayjs(member.created_at).format('HH:mm')}</div>
                      </td>
                    </tr>
                  ))}
                  {staff.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                            <Users className="w-6 h-6 text-gray-400" />
                          </div>
                          <p className="text-sm">No staff members found.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
