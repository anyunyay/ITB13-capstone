import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

interface CustomerPaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalItems: number;
}

export function CustomerPaginationControls({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  itemsPerPage, 
  totalItems 
}: CustomerPaginationControlsProps) {
  const t = useTranslation();
  
  if (totalPages <= 1) return null;

  const isLastPage = currentPage >= totalPages;
  const isFirstPage = currentPage === 1;

  return (
    <>
      {/* Desktop/Tablet Pagination - Normal flow */}
      <div className="hidden sm:flex flex-row items-center justify-between gap-3 sm:gap-4 mt-4 sm:mt-6">
        {/* Page Info */}
        <span className="text-xs sm:text-sm text-muted-foreground font-medium">
          {t('customer.showing')} {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} {t('customer.of')} {totalItems} {t('customer.notifications')}
        </span>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={isFirstPage}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 rounded-lg shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-primary"
          >
            <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>{t('customer.previous')}</span>
          </Button>

          {/* Page Numbers - Simple display for customer */}
          <div className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-muted rounded-lg">
            <span className="text-xs sm:text-sm font-semibold text-foreground">
              {t('customer.page')} {currentPage} {t('customer.of')} {totalPages}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={isLastPage}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 rounded-lg shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-primary"
          >
            <span>{t('customer.next')}</span>
            <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>

      {/* Mobile Pagination - Fixed at bottom */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t-2 border-border shadow-lg">
        <div className="flex flex-col gap-2 p-3">
          {/* Page Info */}
          <span className="text-xs text-muted-foreground font-medium text-center">
            {t('customer.showing')} {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} {t('customer.of')} {totalItems}
          </span>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={isFirstPage}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 rounded-lg shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-primary flex-1 max-w-[120px]"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>{t('customer.previous')}</span>
            </Button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1.5 px-4 py-2.5 bg-muted rounded-lg">
              <span className="text-sm font-semibold text-foreground whitespace-nowrap">
                {currentPage} / {totalPages}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={isLastPage}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 rounded-lg shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-primary flex-1 max-w-[120px]"
            >
              <span>{t('customer.next')}</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Spacer for mobile to prevent content from being hidden behind fixed pagination */}
      <div className="sm:hidden h-24"></div>
    </>
  );
}
