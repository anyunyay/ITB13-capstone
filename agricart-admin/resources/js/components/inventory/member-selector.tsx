import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

interface Member {
    id: number;
    name: string;
}

interface MemberSelectorProps {
    members: Member[];
    selectedMemberId: string;
    onMemberSelect: (memberId: string) => void;
    itemsPerPage?: number;
}

export const MemberSelector = ({
    members,
    selectedMemberId,
    onMemberSelect,
    itemsPerPage = 5
}: MemberSelectorProps) => {
    const t = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Filter members based on search term
    const filteredMembers = useMemo(() => {
        if (!searchTerm.trim()) return members;
        
        const lowerSearch = searchTerm.toLowerCase();
        return members.filter(member => 
            member.name.toLowerCase().includes(lowerSearch)
        );
    }, [members, searchTerm]);

    // Calculate pagination
    const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedMembers = filteredMembers.slice(startIndex, endIndex);

    // Reset to first page when search changes
    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    // Handle page navigation
    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <div className='space-y-2'>
            <Label htmlFor="member_search">
                {t('admin.assign_to_member')} <span className="text-destructive">*</span>
            </Label>
            
            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    id="member_search"
                    type="text"
                    placeholder={t('admin.search_members')}
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Member List */}
            <div className="border rounded-md overflow-hidden">
                <div className="h-[200px] overflow-y-auto">
                    {paginatedMembers.length > 0 ? (
                        <div className="p-2 space-y-1">
                            {paginatedMembers.map((member) => (
                                <button
                                    key={member.id}
                                    type="button"
                                    onClick={() => onMemberSelect(String(member.id))}
                                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                                        selectedMemberId === String(member.id)
                                            ? 'bg-primary text-primary-foreground'
                                            : 'hover:bg-muted'
                                    }`}
                                >
                                    {member.name}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            {searchTerm ? t('admin.no_members_found') : t('admin.no_members_available')}
                        </div>
                    )}
                </div>
            </div>

            {/* Pagination Controls */}
            {filteredMembers.length > itemsPerPage && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                        {t('admin.showing')} {startIndex + 1}-{Math.min(endIndex, filteredMembers.length)} {t('admin.of')} {filteredMembers.length}
                    </span>
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={goToPreviousPage}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-xs">
                            {currentPage} / {totalPages}
                        </span>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};
