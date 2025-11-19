import { Head, Link, usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { UsersRound, BarChart3 } from 'lucide-react';
import { type SharedData } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { PermissionGuard } from '@/components/common/permission-guard';
import { PermissionGate } from '@/components/common/permission-gate';
import { FlashMessage } from '@/components/common/feedback/flash-message';
import { StatsOverview } from '@/components/staff/stats-overview';
import { StaffManagement } from '@/components/staff/staff-management';
import { Staff, StaffStats, StaffFilters, StaffPagination } from '@/types/staff';
import { useState, useMemo } from 'react';
import { route } from 'ziggy-js';
import { useTranslation } from '@/hooks/use-translation';

interface Props {
  staff: StaffPagination;
  staffStats: StaffStats;
  filters: StaffFilters;
  flash?: {
    message?: string;
    error?: string;
  };
}

export default function StaffIndex({ staff, staffStats, filters, flash }: Props) {
  const t = useTranslation();
  const { props } = usePage<SharedData>();
  const { createStaffs, editStaffs, deleteStaffs } = props.permissions || {};

  // State for search and pagination (client-side)
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [processing, setProcessing] = useState(false);
  const [highlightStaffId, setHighlightStaffId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showSearch, setShowSearch] = useState(false);

  const itemsPerPage = 10;

  // Helper function to determine staff category based on permissions
  const getStaffCategory = (member: Staff): string => {
    const permissions = member.permissions.map(p => p.name);
    
    // Check for specific category permissions
    const hasInventory = permissions.some(p => 
      p.includes('inventory') || p.includes('products') || p.includes('stocks')
    );
    const hasOrders = permissions.some(p => p.includes('order'));
    const hasSales = permissions.some(p => p.includes('sales'));
    const hasLogistics = permissions.some(p => p.includes('logistic'));
    const hasTrends = permissions.some(p => p.includes('trend'));
    
    // Return the primary category (prioritize order of appearance)
    if (hasOrders) return 'orders';
    if (hasInventory) return 'inventory';
    if (hasLogistics) return 'logistics';
    if (hasSales) return 'sales';
    if (hasTrends) return 'trends';
    return 'general';
  };

  // Filter staff data
  const filteredStaff = useMemo(() => {
    let filtered = staff.data;

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(member => getStaffCategory(member) === selectedCategory);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.contact_number && member.contact_number.includes(searchTerm))
      );
    }

    return filtered;
  }, [staff.data, selectedCategory, searchTerm]);

  // Sort staff data (client-side)
  const sortedStaff = useMemo(() => {
    return [...filteredStaff].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'id':
          comparison = a.id - b.id;
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'status':
          comparison = (a.email_verified_at ? 1 : 0) - (b.email_verified_at ? 1 : 0);
          break;
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        default:
          return 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredStaff, sortBy, sortOrder]);

  // Paginate the sorted results (client-side)
  const totalPages = Math.ceil(sortedStaff.length / itemsPerPage);
  const paginatedStaff = useMemo(() => {
    return sortedStaff.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [sortedStaff, currentPage, itemsPerPage]);

  // Handle search (client-side)
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  // Handle page change (client-side)
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle sorting (client-side)
  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  // Handle staff deletion
  const handleDeleteStaff = (staffMember: Staff) => {
    if (confirm(t('admin.confirm_delete_staff'))) {
      setProcessing(true);
      router.delete(route('staff.destroy', staffMember.id), {
        onSuccess: () => {
          setProcessing(false);
          setHighlightStaffId(null);
        },
        onError: () => {
          setProcessing(false);
        },
      });
    }
  };

  // Handle staff deactivation
  const handleDeactivateStaff = (staffMember: Staff) => {
    if (confirm(t('admin.confirm_deactivate_staff'))) {
      setProcessing(true);
      router.post(route('staff.deactivate', staffMember.id), {}, {
        onSuccess: () => {
          setProcessing(false);
          setHighlightStaffId(staffMember.id);
          setTimeout(() => setHighlightStaffId(null), 3000);
        },
        onError: () => {
          setProcessing(false);
        },
      });
    }
  };

  // Handle staff reactivation
  const handleReactivateStaff = (staffMember: Staff) => {
    if (confirm(t('admin.confirm_reactivate_staff'))) {
      setProcessing(true);
      router.post(route('staff.reactivate', staffMember.id), {}, {
        onSuccess: () => {
          setProcessing(false);
          setHighlightStaffId(staffMember.id);
          setTimeout(() => setHighlightStaffId(null), 3000);
        },
        onError: () => {
          setProcessing(false);
        },
      });
    }
  };

  return (
    <PermissionGuard 
      permissions={['view staffs', 'create staffs', 'edit staffs', 'delete staffs']}
      pageTitle={t('admin.access_denied')}
    >
      <AppLayout>
        <Head title={t('admin.staff_management')} />
        
        <div className="min-h-screen bg-background">
          <div className="w-full flex flex-col gap-2 px-2 py-2 sm:px-4 sm:py-4 lg:px-8">
            {/* Flash Messages */}
            <FlashMessage flash={flash} />
            
            {/* Dashboard Header */}
            <div className="bg-gradient-to-br from-card to-[color-mix(in_srgb,var(--card)_95%,var(--primary)_5%)] border border-border rounded-[0.8rem] p-3 sm:p-5 mb-2 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] flex flex-col gap-2">
              <div className="flex flex-col gap-3 mb-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 text-primary bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] p-2 sm:p-2.5 rounded-lg flex items-center justify-center">
                      <UsersRound className="h-4 w-4 sm:h-6 sm:w-6" />
                    </div>
                    <div>
                      <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight m-0">{t('staff.staff_management')}</h1>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 mb-0 leading-snug">
                        {t('staff.staff_management_description')}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                  {createStaffs && (
                    <Button asChild className="bg-primary text-primary-foreground border-0 px-4 sm:px-5 py-2 sm:py-2.5 rounded-md font-semibold transition-all duration-200 shadow-sm hover:bg-primary/90 hover:-translate-y-0.5 hover:shadow-md">
                      <Link href="/admin/staff/add" className="flex items-center justify-center w-full">
                        <UsersRound className="mr-2 h-4 w-4" />
                        <span className="text-sm sm:text-base">{t('staff.add_staff_member')}</span>
                      </Link>
                    </Button>
                  )}
                  <PermissionGate permission="generate staff report">
                    <Button variant="outline" asChild className="bg-background text-foreground border border-border px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all hover:bg-muted hover:border-primary hover:-translate-y-0.5 hover:shadow-lg">
                      <Link href={route('admin.staff.report')} className="flex items-center justify-center w-full">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        <span className="text-sm sm:text-base">{t('staff.generate_report')}</span>
                      </Link>
                    </Button>
                  </PermissionGate>
                </div>
              </div>
            </div>

            {/* Statistics Overview */}
            <StatsOverview staffStats={staffStats} />

            {/* Staff Management Section */}
            <StaffManagement
              staff={staff.data}
              searchTerm={searchTerm}
              setSearchTerm={handleSearchChange}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              filteredStaff={filteredStaff}
              paginatedStaff={paginatedStaff}
              currentPage={currentPage}
              setCurrentPage={handlePageChange}
              totalPages={totalPages}
              totalStaff={sortedStaff.length}
              itemsPerPage={itemsPerPage}
              processing={processing}
              onDelete={handleDeleteStaff}
              onDeactivate={handleDeactivateStaff}
              onReactivate={handleReactivateStaff}
              highlightStaffId={highlightStaffId}
              sortBy={sortBy}
              setSortBy={handleSortChange}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              showSearch={showSearch}
              setShowSearch={setShowSearch}
            />
          </div>
        </div>
      </AppLayout>
    </PermissionGuard>
  );
} 