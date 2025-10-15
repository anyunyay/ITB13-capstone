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
import styles from './staff.module.css';

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

  const itemsPerPage = staff.per_page;
  const totalPages = staff.last_page;
  const totalStaff = staff.total;

  // Filter and sort staff data
  const filteredAndSortedStaff = useMemo(() => {
    let filtered = staff.data;

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
  }, [staff.data, searchTerm, sortBy, sortOrder]);

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
        
        <div className={styles.staffContainer}>
          <div className={styles.mainContent}>
            {/* Dashboard Header */}
            <div className={styles.dashboardHeader}>
              <div className={styles.headerMain}>
                <div className={styles.headerTitleSection}>
                  <div className={styles.titleContainer}>
                    <div className={styles.headerIcon}>
                      <UsersRound className="h-6 w-6" />
                    </div>
                    <div>
                      <h1 className={styles.headerTitle}>Staff Management</h1>
                      <p className={styles.headerSubtitle}>
                        Manage staff members and their permissions with comprehensive oversight
                      </p>
                    </div>
                  </div>
                </div>
                <div className={styles.headerActions}>
                  {createStaffs && (
                    <Button asChild className={styles.primaryAction}>
                      <Link href="/admin/staff/add">
                        <UsersRound className="mr-2 h-4 w-4" />
                        Add Staff
                      </Link>
                    </Button>
                  )}
                  <PermissionGate permission="generate staff report">
                    <Button variant="outline" asChild className={styles.secondaryAction}>
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
            />
          </div>
        </div>
      </AppLayout>
    </PermissionGuard>
  );
} 