import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import dayjs from 'dayjs';
import { useState } from 'react';
import { PermissionGuard } from '@/components/permission-guard';

interface Logistic {
  id: number;
  name: string;
  email: string;
  contact_number?: string;
  address?: string;
  registration_date?: string;
  email_verified_at?: string;
  created_at: string;
}

interface ReportSummary {
  total_logistics: number;
  active_logistics: number;
  pending_verification: number;
  recent_registrations: number;
}

interface ReportFilters {
  start_date?: string;
  end_date?: string;
}

interface ReportPageProps {
  logistics: Logistic[];
  summary: ReportSummary;
  filters: ReportFilters;
}

export default function LogisticReport({ logistics, summary, filters }: ReportPageProps) {
  const [localFilters, setLocalFilters] = useState<ReportFilters>(filters);

  const handleFilterChange = (key: keyof ReportFilters, value: string) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (localFilters.start_date) params.append('start_date', localFilters.start_date);
    if (localFilters.end_date) params.append('end_date', localFilters.end_date);
    
    router.get(route('logistics.report'), Object.fromEntries(params));
  };

  const exportReport = (format: 'csv' | 'pdf') => {
    const params = new URLSearchParams();
    if (localFilters.start_date) params.append('start_date', localFilters.start_date);
    if (localFilters.end_date) params.append('end_date', localFilters.end_date);
    params.append('format', format);
    
    window.open(`${route('logistics.report')}?${params.toString()}`, '_blank');
  };

  return (
    <PermissionGuard 
      permission="generate logistics report"
      pageTitle="Logistics Report Access Denied"
    >
      <AppLayout>
        <Head title="Logistics Report" />
        <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Logistics Report</h1>
          <div className="flex gap-2">
            <Button onClick={() => exportReport('csv')} variant="outline">
              Export CSV
            </Button>
            <Button onClick={() => exportReport('pdf')} variant="outline">
              Export PDF
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={localFilters.start_date || ''}
                  onChange={(e) => handleFilterChange('start_date', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={localFilters.end_date || ''}
                  onChange={(e) => handleFilterChange('end_date', e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={applyFilters} className="w-full">
                  Apply Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Logistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_logistics}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Logistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{summary.active_logistics}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{summary.pending_verification}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Recent Registrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{summary.recent_registrations}</div>
            </CardContent>
          </Card>
        </div>

        {/* Logistics List */}
        <Card>
          <CardHeader>
            <CardTitle>Logistics Members ({logistics.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {logistics.map((logistic) => (
                <LogisticCard key={logistic.id} logistic={logistic} />
              ))}
              {logistics.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  No logistics found for the selected filters.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
    </PermissionGuard>
  );
}

function LogisticCard({ logistic }: { logistic: Logistic }) {
  const getVerificationBadge = (verified: boolean) => {
    if (verified) {
      return <Badge variant="default">Verified</Badge>;
    } else {
      return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{logistic.name}</CardTitle>
            <p className="text-sm text-gray-500">
              {dayjs(logistic.created_at).format('MMM DD, YYYY HH:mm')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {getVerificationBadge(!!logistic.email_verified_at)}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2">Contact Information</h4>
            <p className="text-sm">
              <span className="font-medium">Email:</span> {logistic.email}
            </p>
            <p className="text-sm">
              <span className="font-medium">Contact:</span> {logistic.contact_number || 'N/A'}
            </p>
            <p className="text-sm">
              <span className="font-medium">Address:</span> {logistic.address || 'N/A'}
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Registration Details</h4>
            <p className="text-sm">
              <span className="font-medium">Registration Date:</span> {logistic.registration_date ? dayjs(logistic.registration_date).format('MMM DD, YYYY') : 'N/A'}
            </p>
            <p className="text-sm">
              <span className="font-medium">Email Verified:</span> {logistic.email_verified_at ? dayjs(logistic.email_verified_at).format('MMM DD, YYYY') : 'Not verified'}
            </p>
            <p className="text-sm">
              <span className="font-medium">Member ID:</span> #{logistic.id}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 