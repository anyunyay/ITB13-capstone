import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { useState } from 'react';
import { PermissionGuard } from '@/components/permission-guard';
import { SafeImage } from '@/lib/image-utils';

interface Member {
  id: number;
  name: string;
  email: string;
  contact_number?: string;
  address?: string;
  registration_date?: string;
  document?: string;
  email_verified_at?: string;
  created_at: string;
}

interface ReportSummary {
  total_members: number;
  active_members: number;
  pending_verification: number;
  recent_registrations: number;
}

interface ReportFilters {
  start_date?: string;
  end_date?: string;
}

interface ReportPageProps {
  members: Member[];
  summary: ReportSummary;
  filters: ReportFilters;
}

export default function MembershipReport({ members, summary, filters }: ReportPageProps) {
  const [localFilters, setLocalFilters] = useState<ReportFilters>(filters);

  const handleFilterChange = (key: keyof ReportFilters, value: string) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (localFilters.start_date) params.append('start_date', localFilters.start_date);
    if (localFilters.end_date) params.append('end_date', localFilters.end_date);
    
    router.get(route('membership.report'), Object.fromEntries(params));
  };

  const exportReport = (format: 'csv' | 'pdf') => {
    const params = new URLSearchParams();
    if (localFilters.start_date) params.append('start_date', localFilters.start_date);
    if (localFilters.end_date) params.append('end_date', localFilters.end_date);
    params.append('format', format);
    
    window.open(`${route('membership.report')}?${params.toString()}`, '_blank');
  };

  const getVerificationBadge = (verified: boolean) => {
    return verified ? (
      <Badge variant="default">Verified</Badge>
    ) : (
      <Badge variant="secondary">Pending</Badge>
    );
  };

  return (
    <PermissionGuard 
      permission="generate membership report"
      pageTitle="Membership Report Access Denied"
    >
      <AppLayout>
        <Head title="Membership Report" />
        <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Membership Report</h1>
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
              <CardTitle className="text-sm font-medium text-gray-600">Total Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_members}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{summary.active_members}</div>
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
              <CardTitle className="text-sm font-medium text-gray-600">Recent (30 days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{summary.recent_registrations}</div>
            </CardContent>
          </Card>
        </div>

        {/* Members List */}
        <Card>
          <CardHeader>
            <CardTitle>Members ({members.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {members.map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
              {members.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  No members found for the selected filters.
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

function MemberCard({ member }: { member: Member }) {
  const getVerificationBadge = (verified: boolean) => {
    return verified ? (
      <Badge variant="default">Verified</Badge>
    ) : (
      <Badge variant="secondary">Pending</Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Member #{member.id}</CardTitle>
            <p className="text-sm text-gray-500">
              {format(new Date(member.created_at), 'MMM dd, yyyy HH:mm')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {getVerificationBadge(!!member.email_verified_at)}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2">Member Information</h4>
            <p className="text-sm">
              <span className="font-medium">Name:</span> {member.name}
            </p>
            <p className="text-sm">
              <span className="font-medium">Email:</span> {member.email}
            </p>
            {member.contact_number && (
              <p className="text-sm">
                <span className="font-medium">Contact:</span> {member.contact_number}
              </p>
            )}
            {member.address && (
              <p className="text-sm">
                <span className="font-medium">Address:</span> {member.address}
              </p>
            )}
          </div>
          <div>
            <h4 className="font-semibold mb-2">Registration Details</h4>
            <p className="text-sm">
              <span className="font-medium">Registration Date:</span> {member.registration_date ? format(new Date(member.registration_date), 'MMM dd, yyyy') : 'N/A'}
            </p>
            <p className="text-sm">
              <span className="font-medium">Email Verified:</span> {member.email_verified_at ? 'Yes' : 'No'}
            </p>
            {member.email_verified_at && (
              <p className="text-sm">
                <span className="font-medium">Verified On:</span> {format(new Date(member.email_verified_at), 'MMM dd, yyyy')}
              </p>
            )}
          </div>
        </div>
        
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Document</h4>
          <div className="flex justify-center">
            <SafeImage 
              src={member.document} 
              alt={`Document for ${member.name}`}
              className="max-w-xs max-h-32 object-contain border rounded"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 