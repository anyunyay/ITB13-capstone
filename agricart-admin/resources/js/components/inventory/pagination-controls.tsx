import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    itemsPerPage: number;
    totalItems: number;
}

export const PaginationControls = ({ 
    currentPage, 
    totalPages, 
    onPageChange, 
    itemsPerPage, 
    totalItems
}: PaginationControlsProps) => {
    const t = useTranslation();
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

    if (totalPages <= 1) return null;

    return (
        <div className="flex flex-col gap-3 mt-8 px-4 py-3 sm:px-6 sm:py-4 bg-card border border-border rounded-xl shadow-sm sm:flex-row sm:items-center sm:justify-center sm:relative">
            <span className="text-xs sm:text-sm text-muted-foreground font-medium text-center sm:absolute sm:left-6 sm:top-1/2 sm:transform sm:-translate-y-1/2 sm:whitespace-nowrap">
                {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
            </span>
            
            <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 border border-border rounded-lg bg-background text-foreground text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer min-h-[2.25rem] sm:min-h-[2.5rem] hover:bg-muted hover:border-border hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
                >
                    <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">{t('admin.previous')}</span>
                    <span className="sm:hidden">{t('admin.prev')}</span>
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
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 border border-border rounded-lg bg-background text-foreground text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer min-h-[2.25rem] sm:min-h-[2.5rem] hover:bg-muted hover:border-border hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
                >
                    <span className="hidden sm:inline">{t('admin.next')}</span>
                    <span className="sm:hidden">{t('admin.next')}</span>
                    <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
            </div>
        </div>
    );
};
