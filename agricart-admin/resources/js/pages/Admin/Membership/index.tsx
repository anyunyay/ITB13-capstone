import AppLayout from '@/layouts/app-layout';
import { type SharedData } from '@/types';
import { Head, usePage, useForm, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { useEffect, useMemo, useRef, useState } from 'react';
import { PermissionGuard } from '@/components/permission-guard';
import { DashboardHeader } from '@/components/membership/dashboard-header';
import { PasswordRequests } from '@/components/membership/password-requests';
import { MemberManagement } from '@/components/membership/member-management';
import { FlashMessages } from '@/components/membership/flash-messages';
import { DeactivationModal } from '@/components/membership/deactivation-modal';
import { PasswordApprovalModal } from '@/components/membership/password-approval-modal';
import { PasswordRejectionModal } from '@/components/membership/password-rejection-modal';
import { Member, PasswordChangeRequest, MemberStats } from '../../../types/membership';
import styles from './membership.module.css';

interface PageProps {
    flash: {
        message?: string
        error?: string
    }
    members: Member[];
    pendingPasswordRequests: PasswordChangeRequest[];
    [key: string]: unknown;
}

export default function Index() {
    const { members, flash, auth, pendingPasswordRequests } = usePage<PageProps & SharedData>().props;
    
    // State management
    const [newRequest, setNewRequest] = useState<PasswordChangeRequest | null>(null);
    const [highlightMemberId, setHighlightMemberId] = useState<number | null>(null);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [showPasswordApprovalModal, setShowPasswordApprovalModal] = useState(false);
    const [showPasswordRejectionModal, setShowPasswordRejectionModal] = useState(false);
    const [selectedPasswordRequest, setSelectedPasswordRequest] = useState<PasswordChangeRequest | null>(null);
    
    // Search state
    const [searchTerm, setSearchTerm] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    
    // View state
    const [showDeactivated, setShowDeactivated] = useState(false);
    
    // Sort state
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    
    // Reset pagination when switching views
    const toggleDeactivatedView = (show: boolean) => {
        setShowDeactivated(show);
        setCurrentPage(1); // Reset to first page when switching views
    };

    // Reset pagination when sorting changes
    const handleSortChange = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
        setCurrentPage(1); // Reset to first page when sorting changes
    };
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    
    const prevRequestIdsRef = useRef<Set<number>>(new Set());
    const requestIds = useMemo(() => new Set<number>((pendingPasswordRequests || []).map(r => r.id)), [pendingPasswordRequests]);
    
    // Check if the user is authenticated || Prevent flash-of-unauthenticated-content
    useEffect(() => {
        if (!auth?.user) {
            router.visit('/login');
        }
    }, [auth]);

    const { processing, delete: destroy, post } = useForm();

    // Calculate member statistics
    const memberStats: MemberStats = {
        totalMembers: members?.length || 0,
        activeMembers: members?.filter(m => m.active).length || 0,
        deactivatedMembers: members?.filter(m => !m.active).length || 0,
        pendingRequests: pendingPasswordRequests?.length || 0,
    };

    // Filter and sort members
    const filteredAndSortedMembers = (members || [])
        .filter(member => {
            const matchesSearch = member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                member.member_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                member.contact_number?.toLowerCase().includes(searchTerm.toLowerCase());
            
            // Filter by activation status
            const matchesView = showDeactivated ? !member.active : member.active;
            
            return matchesSearch && matchesView;
        })
        .sort((a, b) => {
            let comparison = 0;
            
            switch (sortBy) {
                case 'id':
                    comparison = a.id - b.id;
                    break;
                case 'name':
                    comparison = a.name?.localeCompare(b.name || '') || 0;
                    break;
                case 'registration_date':
                    const dateA = new Date(a.registration_date || '').getTime();
                    const dateB = new Date(b.registration_date || '').getTime();
                    comparison = dateA - dateB;
                    break;
                case 'member_id':
                    comparison = (a.member_id || '').localeCompare(b.member_id || '');
                    break;
                case 'contact_number':
                    comparison = (a.contact_number || '').localeCompare(b.contact_number || '');
                    break;
                default:
                    comparison = a.name?.localeCompare(b.name || '') || 0;
            }
            
            return sortOrder === 'asc' ? comparison : -comparison;
        });

    // Pagination for members
    const totalMembers = filteredAndSortedMembers.length;
    const totalPages = Math.ceil(totalMembers / itemsPerPage);
    const paginatedMembers = filteredAndSortedMembers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleDeactivateClick = (member: Member) => {
        if (member.can_be_deactivated) {
            setSelectedMember(member);
            setShowConfirmationModal(true);
        }
    };

    const handleReactivateClick = (member: Member) => {
        setSelectedMember(member);
        setShowConfirmationModal(true);
    };

    const handleConfirmDeactivation = () => {
        if (selectedMember) {
            destroy(route('membership.destroy', selectedMember.id));
            setShowConfirmationModal(false);
            setSelectedMember(null);
        }
    };

    const handleConfirmReactivation = () => {
        if (selectedMember) {
            post(route('membership.reactivate', selectedMember.id));
            setShowConfirmationModal(false);
            setSelectedMember(null);
        }
    };

    const handleCancelDeactivation = () => {
        setShowConfirmationModal(false);
        setSelectedMember(null);
    };

    const handleApprovePasswordChangeClick = (request: PasswordChangeRequest) => {
        setSelectedPasswordRequest(request);
        setShowPasswordApprovalModal(true);
    };

    const handleRejectPasswordChangeClick = (request: PasswordChangeRequest) => {
        setSelectedPasswordRequest(request);
        setShowPasswordRejectionModal(true);
    };

    const handleConfirmPasswordApproval = () => {
        if (selectedPasswordRequest) {
            post(route('membership.approve-password-change', selectedPasswordRequest.id));
            setShowPasswordApprovalModal(false);
            setSelectedPasswordRequest(null);
        }
    };

    const handleConfirmPasswordRejection = () => {
        if (selectedPasswordRequest) {
            post(route('membership.reject-password-change', selectedPasswordRequest.id));
            setShowPasswordRejectionModal(false);
            setSelectedPasswordRequest(null);
        }
    };

    const handleCancelPasswordAction = () => {
        setShowPasswordApprovalModal(false);
        setShowPasswordRejectionModal(false);
        setSelectedPasswordRequest(null);
    };

    // Auto-refresh pending password requests via polling
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({
                only: ['pendingPasswordRequests'],
            });
        }, 10000); // every 10s
        return () => clearInterval(interval);
    }, []);

    // Detect new incoming password change requests
    useEffect(() => {
        // Initialize previous ids if empty
        if (prevRequestIdsRef.current.size === 0 && requestIds.size > 0) {
            prevRequestIdsRef.current = new Set(requestIds);
            return;
        }

        // Find newly added request ids
        const newlyAdded: number[] = [];
        requestIds.forEach(id => {
            if (!prevRequestIdsRef.current.has(id)) newlyAdded.push(id);
        });

        if (newlyAdded.length > 0 && pendingPasswordRequests && pendingPasswordRequests.length > 0) {
            const newest = pendingPasswordRequests.find(r => r.id === newlyAdded[0]) || null;
            if (newest) setNewRequest(newest);
        }

        // Update ref for next comparison
        prevRequestIdsRef.current = new Set<number>(requestIds);
    }, [requestIds, pendingPasswordRequests]);

    const handleNavigateToMember = (memberId: number) => {
        const rowEl = document.getElementById(`member-row-${memberId}`);
        if (rowEl) {
            rowEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setHighlightMemberId(memberId);
            setTimeout(() => setHighlightMemberId(null), 5000);
        }
    };

    return (
        <PermissionGuard 
            permissions={['view membership']}
            pageTitle="Membership Management Access Denied"
        >
            <AppLayout>
                <Head title="Membership Management" />
                <div className="min-h-screen bg-background">
                    <div className="w-full flex flex-col px-4 py-4 sm:px-6 lg:px-8">
                        <DashboardHeader memberStats={memberStats} />

                        <FlashMessages
                            flash={flash}
                            newRequest={newRequest}
                            onNavigateToMember={handleNavigateToMember}
                            onDismissNewRequest={() => setNewRequest(null)}
                        />

                        <PasswordRequests
                            pendingPasswordRequests={pendingPasswordRequests}
                            processing={processing}
                            onApprove={handleApprovePasswordChangeClick}
                            onReject={handleRejectPasswordChangeClick}
                        />

                        <MemberManagement
                            members={members}
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            showSearch={showSearch}
                            setShowSearch={setShowSearch}
                            filteredAndSortedMembers={filteredAndSortedMembers}
                            paginatedMembers={paginatedMembers}
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                            totalPages={totalPages}
                            totalMembers={totalMembers}
                            itemsPerPage={itemsPerPage}
                            processing={processing}
                            onDeactivate={handleDeactivateClick}
                            onReactivate={handleReactivateClick}
                            highlightMemberId={highlightMemberId}
                            showDeactivated={showDeactivated}
                            setShowDeactivated={toggleDeactivatedView}
                            sortBy={sortBy}
                            setSortBy={setSortBy}
                            sortOrder={sortOrder}
                            setSortOrder={setSortOrder}
                        />

                        {/* Modals */}
                        <DeactivationModal
                            isOpen={showConfirmationModal}
                            onClose={() => setShowConfirmationModal(false)}
                            selectedMember={selectedMember}
                            onConfirm={selectedMember?.active ? handleConfirmDeactivation : handleConfirmReactivation}
                            processing={processing}
                            isReactivation={!selectedMember?.active}
                        />

                        <PasswordApprovalModal
                            isOpen={showPasswordApprovalModal}
                            onClose={() => setShowPasswordApprovalModal(false)}
                            selectedRequest={selectedPasswordRequest}
                            onConfirm={handleConfirmPasswordApproval}
                            processing={processing}
                        />

                        <PasswordRejectionModal
                            isOpen={showPasswordRejectionModal}
                            onClose={() => setShowPasswordRejectionModal(false)}
                            selectedRequest={selectedPasswordRequest}
                            onConfirm={handleConfirmPasswordRejection}
                            processing={processing}
                        />
                    </div>
                </div>
            </AppLayout>
        </PermissionGuard>
    );
}
