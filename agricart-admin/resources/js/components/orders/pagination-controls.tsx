import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MoreHorizontal, Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    itemsPerPage: number;
    totalItems: number;
    isLoading?: boolean;
    hasMore?: boolean;
    onLoadMore?: () => void;
}

export const PaginationControls = ({ 
    currentPage, 
    totalPages, 
    onPageChange, 
    itemsPerPage, 
    totalItems,
    isLoading = false,
    hasMore = false,
    onLoadMore
}: PaginationControlsProps) => {
    const t = useTranslation();

    const getVisiblePages = () => {
        const isMobile = window.innerWidth < 768;
        const maxVisible = isMobile ? 3 : 5;
        const pages: (number | string)[] = [];

        if (totalPages <= maxVisible + 2) {
            // Show all pages if total is small
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            let start = Math.max(2, currentPage - Math.floor(maxVisible / 2));
            let end = Math.min(totalPages - 1, start + maxVisible - 1);

            // Adjust start if we're near the end
            if (end === totalPages - 1) {
                start = Math.max(2, end - maxVisible + 1);
            }

            // Add dots after first page if needed
            if (start > 2) {
                pages.push('...');
            }

            // Add middle pages
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            // Add dots before last page if needed
            if (end < totalPages - 1) {
                pages.push('...');
            }

            // Always show last page
            if (totalPages > 1) {
                pages.push(totalPages);
            }
        }

        return pages;
    };

    if (totalPages <= 1 && !hasMore) return null;

    return (
        <div className="flex flex-col gap-3 mt-8 p-3 md:p-4 bg-card border border-border rounded-xl shadow-sm md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground font-medium text-center md:text-left">
                    {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} {t('admin.of')} {totalItems}
                </span>
                {isLoading && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Loading more...</span>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-center gap-1 md:gap-2 overflow-x-auto">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-2 py-2 md:px-3 border border-border rounded-lg bg-background text-foreground text-sm font-medium transition-all hover:bg-muted hover:border-border hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground h-9 shrink-0"
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">{t('ui.previous')}</span>
                </Button>

                <div className="flex items-center gap-1 shrink-0">
                    {getVisiblePages().map((page, index) => (
                        <div key={index} className="shrink-0">
                            {page === '...' ? (
                                <div className="px-1 md:px-2 flex items-center">
                                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                </div>
                            ) : (
                                <Button
                                    variant={currentPage === page ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => onPageChange(page as number)}
                                    className={`w-9 h-9 md:w-10 md:h-10 p-0 border border-border rounded-lg text-xs md:text-sm font-medium transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                                        currentPage === page
                                            ? 'bg-primary text-primary-foreground border-primary font-semibold'
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
                    className="flex items-center gap-1 px-2 py-2 md:px-3 border border-border rounded-lg bg-background text-foreground text-sm font-medium transition-all hover:bg-muted hover:border-border hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground h-9 shrink-0"
                >
                    <span className="hidden sm:inline">{t('ui.next')}</span>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};
