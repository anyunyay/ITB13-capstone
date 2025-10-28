import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    itemsPerPage: number;
    totalItems: number;
    // Enhanced props for sort state management
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    onSortChange?: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
    // Enforce 10 rows per page limit
    maxItemsPerPage?: number;
}

export const PaginationControls = ({ 
    currentPage, 
    totalPages, 
    onPageChange, 
    itemsPerPage, 
    totalItems,
    sortBy,
    sortOrder,
    onSortChange,
    maxItemsPerPage = 10
}: PaginationControlsProps) => {
    // Enforce 10 rows per page limit
    const effectiveItemsPerPage = Math.min(itemsPerPage, maxItemsPerPage);
    
    const getVisiblePages = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];

        for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
            range.push(i);
        }

        if (currentPage - delta > 2) {
            rangeWithDots.push(1, '...');
        } else {
            rangeWithDots.push(1);
        }

        rangeWithDots.push(...range);

        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push('...', totalPages);
        } else {
            rangeWithDots.push(totalPages);
        }

        return rangeWithDots;
    };

    // Handle page change with automatic reset when sort changes
    const handlePageChange = (page: number) => {
        onPageChange(page);
    };

    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-center mt-8 p-4 bg-card border border-border rounded-xl shadow-sm relative">
            <span className="text-sm text-muted-foreground font-medium whitespace-nowrap absolute left-4 top-1/2 transform -translate-y-1/2">
                {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
            </span>
            
            <div className="flex items-center justify-center gap-3 flex-wrap">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm font-medium transition-all hover:bg-muted hover:border-border hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground min-h-[2.5rem]"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                </Button>
                
                <div className="flex items-center gap-1">
                    {getVisiblePages().map((page, index) => (
                        <div key={index}>
                            {page === '...' ? (
                                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                            ) : (
                                <Button
                                    variant={currentPage === page ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => onPageChange(page as number)}
                                    className={`min-w-[2.5rem] h-[2.5rem] p-0 border border-border rounded-lg text-sm font-medium transition-all cursor-pointer flex items-center justify-center ${
                                        currentPage === page 
                                            ? 'bg-background text-foreground border-foreground font-semibold' 
                                            : 'bg-background text-foreground hover:bg-muted hover:border-border hover:text-foreground'
                                    }`}
                                >
                                    {page}
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
                
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm font-medium transition-all hover:bg-muted hover:border-border hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground min-h-[2.5rem]"
                >
                    Next
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};
