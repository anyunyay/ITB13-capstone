import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalItems: number;
}

export function PaginationControls({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  itemsPerPage, 
  totalItems 
}: PaginationControlsProps) {

  const getVisiblePages = (isMobile: boolean = false) => {
    const delta = isMobile ? 0 : 2; // Show fewer pages on mobile
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
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col gap-4 mt-8">
      {/* Info text - visible on all screens, positioned differently */}
      <div className="flex justify-center sm:justify-start">
        <span className="text-sm text-muted-foreground font-medium">
          {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
        </span>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center justify-center bg-card border border-border rounded-xl shadow-sm p-3 sm:p-4">
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap w-full">
          {/* Previous button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 border border-border rounded-lg bg-background text-foreground text-xs sm:text-sm font-medium transition-all hover:bg-muted hover:border-border hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground min-h-[2.25rem] sm:min-h-[2.5rem]"
          >
            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Prev</span>
          </Button>

          {/* Page numbers - Desktop view */}
          <div className="hidden sm:flex items-center gap-1">
            {getVisiblePages(false).map((page, index) => (
              <div key={index}>
                {page === '...' ? (
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground mx-1" />
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

          {/* Page numbers - Mobile view (compact) */}
          <div className="flex sm:hidden items-center gap-1">
            {getVisiblePages(true).map((page, index) => (
              <div key={index}>
                {page === '...' ? (
                  <MoreHorizontal className="h-3 w-3 text-muted-foreground mx-0.5" />
                ) : (
                  <Button
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(page as number)}
                    className={`min-w-[2.25rem] h-[2.25rem] p-0 border border-border rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center justify-center ${
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

          {/* Next button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 border border-border rounded-lg bg-background text-foreground text-xs sm:text-sm font-medium transition-all hover:bg-muted hover:border-border hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground min-h-[2.25rem] sm:min-h-[2.5rem]"
          >
            Next
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
