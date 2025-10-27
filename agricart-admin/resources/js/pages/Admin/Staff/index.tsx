import { Head, Link, usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { UsersRound, BarChart3 } from 'lucide-react';
import { type SharedData } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { PermissionGuard } from '@/components/permission-guard';
import { PermissionGate } from '@/components/permission-gate';
import { StatsOverview } from '@/components/staff/stats-overview';
import { StaffManagement } from '@/components/staff/staff-management';
import { Staff, StaffStats, StaffFilters, StaffPagination } from '@/types/staff';
import { useState, useMemo } from 'react';
import { route } from 'ziggy-js';

interface Props {
  staff: StaffPagination;
  staffStats: StaffStats;
  filters: StaffFilters;
}

export default function StaffIndex({ staff, staffStats, filters }: Props) {
  const { props } = usePage<SharedData>();
  const { createStaffs, editStaffs, deleteStaffs } = props.permissions || {};

  // State for search and pagination
  const [searchTerm, setSearchTerm] = useState(filters.search);
  const [currentPage, setCurrentPage] = useState(staff.current_page);
  const [sortBy, setSortBy] = useState(filters.sort_by);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(filters.sort_order);
  const [processing, setProcessing] = useState(false);
  const [highlightStaffId, setHighlightStaffId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showSearch, setShowSearch] = useState(false);

  const itemsPerPage = staff.per_page;
  const totalPages = staff.last_page;
  const totalStaff = staff.total;

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

  // Filter and sort staff data
  const filteredAndSortedStaff = useMemo(() => {
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

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'created_at':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        default:
          aValue = a.id;
          bValue = b.id;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [staff.data, searchTerm, sortBy, sortOrder, selectedCategory]);

  // Paginate the filtered results
  const paginatedStaff = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedStaff.slice(startIndex, endIndex);
  }, [filteredAndSortedStaff, currentPage, itemsPerPage]);

  // Handle search with debouncing
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
    
    // Update URL with search parameter
    router.get(route('staff.index'), {
      search: term,
      sort_by: sortBy,
      sort_order: sortOrder,
      per_page: itemsPerPage,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    
    router.get(route('staff.index'), {
      search: searchTerm,
      sort_by: sortBy,
      sort_order: sortOrder,
      per_page: itemsPerPage,
      page: page,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  // Handle sorting
  const handleSortChange = (field: string) => {
    const newSortOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(field);
    setSortOrder(newSortOrder);
    setCurrentPage(1);
    
    router.get(route('staff.index'), {
      search: searchTerm,
      sort_by: field,
      sort_order: newSortOrder,
      per_page: itemsPerPage,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  // Handle staff deletion
  const handleDeleteStaff = (staffMember: Staff) => {
    if (confirm('Are you sure you want to delete this staff member?')) {
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

  return (
    <PermissionGuard 
      permissions={['view staffs', 'create staffs', 'edit staffs', 'delete staffs']}
      pageTitle="Staff Management Access Denied"
    >
      <AppLayout>
        <Head title="Staff Management" />
        
        <div className="min-h-screen bg-background">
          <div className="w-full flex flex-col gap-2 px-4 py-4 sm:px-6 lg:px-8">
            {/* Dashboard Header */}
            <div className="bg-gradient-to-br from-card to-[color-mix(in_srgb,var(--card)_95%,var(--primary)_5%)] border border-border rounded-[0.8rem] p-5 mb-2 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] flex flex-col gap-2">
              <div className="flex flex-col gap-2 mb-3 md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 text-primary bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] p-2.5 rounded-lg flex items-center justify-center">
                      <UsersRound className="h-6 w-6" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-foreground leading-tight m-0">Staff Management</h1>
                      <p className="text-sm text-muted-foreground mt-0.5 mb-0 leading-snug">
                        Manage staff members and their permissions with comprehensive oversight
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  {createStaffs && (
                    <Button asChild className="bg-primary text-primary-foreground border-0 px-5 py-2.5 rounded-md font-semibold transition-all duration-200 shadow-sm hover:bg-primary/90 hover:-translate-y-0.5 hover:shadow-md">
                      <Link href="/admin/staff/add">
                        <UsersRound className="mr-2 h-4 w-4" />
                        Add Staff
                      </Link>
                    </Button>
                  )}
                  <PermissionGate permission="generate staff report">
                    <Button variant="outline" asChild className="bg-background text-foreground border border-border px-6 py-3 rounded-lg font-medium transition-all hover:bg-muted hover:border-primary hover:-translate-y-0.5 hover:shadow-lg">
                      <Link href={route('admin.staff.report')}>
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Generate Report
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
              filteredAndSortedStaff={filteredAndSortedStaff}
              paginatedStaff={paginatedStaff}
              currentPage={currentPage}
              setCurrentPage={handlePageChange}
              totalPages={totalPages}
              totalStaff={totalStaff}
              itemsPerPage={itemsPerPage}
              processing={processing}
              onDelete={handleDeleteStaff}
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