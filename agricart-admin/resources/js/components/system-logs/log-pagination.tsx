import React from 'react';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { useTranslation } from '@/hooks/use-translation';

interface LogPaginationProps {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
    search: string;
    level: string;
    eventType: string;
    userType: string;
    dateFrom: string;
    dateTo: string;
}

export const LogPagination: React.FC<LogPaginationProps> = ({
    currentPage,
    lastPage,
    perPage,
    total,
    search,
    level,
    eventType,
    userType,
    dateFrom,
    dateTo
}) => {
    const t = useTranslation();

    const navigateToPage = (page: number) => {
        router.get('/admin/system-logs', {
            search,
            level,
            event_type: eventType,
            user_type: userType,
            date_from: dateFrom,
            date_to: dateTo,
            per_page: perPage,
            page
        });
    };

    if (lastPage <= 1) return null;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-4 border-t">
            <div className="text-sm text-muted-foreground text-center sm:text-left">
                {t('ui.showing')} <span className="font-medium">{((currentPage - 1) * perPage) + 1}</span>-
                <span className="font-medium">{Math.min(currentPage * perPage, total)}</span> {t('ui.of')}{' '}
                <span className="font-medium">{total}</span>
            </div>

            <div className="flex items-center gap-1">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateToPage(1)}
                    disabled={currentPage === 1}
                    className="h-9 px-3"
                >
                    {t('ui.first')}
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-9 px-3"
                >
                    {t('ui.previous')}
                </Button>

                {/* Page numbers - hidden on mobile */}
                <div className="hidden sm:flex items-center gap-1">
                    {Array.from({ length: Math.min(5, lastPage) }, (_, i) => {
                        let pageNum;
                        if (lastPage <= 5) {
                            pageNum = i + 1;
                        } else if (currentPage <= 3) {
                            pageNum = i + 1;
                        } else if (currentPage >= lastPage - 2) {
                            pageNum = lastPage - 4 + i;
                        } else {
                            pageNum = currentPage - 2 + i;
                        }
                        return (
                            <Button
                                key={pageNum}
                                variant={currentPage === pageNum ? "default" : "outline"}
                                size="sm"
                                onClick={() => navigateToPage(pageNum)}
                                className="h-9 w-9 p-0"
                            >
                                {pageNum}
                            </Button>
                        );
                    })}
                </div>

                {/* Current page indicator - visible on mobile */}
                <div className="sm:hidden px-3 py-1.5 text-sm font-medium">
                    {currentPage} / {lastPage}
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateToPage(currentPage + 1)}
                    disabled={currentPage === lastPage}
                    className="h-9 px-3"
                >
                    {t('ui.next')}
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateToPage(lastPage)}
                    disabled={currentPage === lastPage}
                    className="h-9 px-3"
                >
                    {t('ui.last')}
                </Button>
            </div>
        </div>
    );
};
