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
        // Always reset to page 1 when sort parameters are present and different
        onPageChange(page);
    };

    if (totalPages <= 1) return null;

    return (
        <div className="flex flex-col gap-3 mt-8 px-4 py-3 sm:px-6 sm:py-4 bg-card border border-border rounded-xl shadow-sm sm:flex-row sm:items-center sm:justify-center sm:relative">
            <span className="text-xs sm:text-sm text-muted-foreground font-medium text-center sm:absolute sm:left-6 sm:top-1/2 sm:transform sm:-translate-y-1/2 sm:whitespace-nowrap">
                {((currentPage - 1) * effectiveItemsPerPage) + 1}-{Math.min(currentPage * effectiveItemsPerPage, totalItems)} of {totalItems}
                {sortBy && (
                    <span className="ml-2 text-xs text-primary">
                        (sorted by {sortBy} {sortOrder})
                    </span>
                )}
            </span>
            
            <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 border border-border rounded-lg bg-background text-foreground text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer min-h-[2.25rem] sm:min-h-[2.5rem] hover:bg-muted hover:border-border hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
                >
                    <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Previous</span>
                    <span className="sm:hidden">Prev</span>
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
                                    onClick={() => handlePageChange(page as number)}
                                    className={`min-w-[2.25rem] sm:min-w-[2.5rem] h-[2.25rem] sm:h-[2.5rem] p-0 border border-border rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer flex items-center justify-center ${
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
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 border border-border rounded-lg bg-background text-foreground text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer min-h-[2.25rem] sm:min-h-[2.5rem] hover:bg-muted hover:border-border hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
                >
                    <span className="hidden sm:inline">Next</span>
                    <span className="sm:hidden">Next</span>
                    <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
            </div>
        </div>
    );
};
