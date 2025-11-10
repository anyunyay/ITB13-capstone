import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';

interface PaginationData {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface PaginationControlsProps {
    pagination: PaginationData;
    onPageChange: (page: number) => void;
}

export function PaginationControls({ pagination, onPageChange }: PaginationControlsProps) {
    const t = useTranslation();

    if (pagination.last_page <= 1) {
        return null;
    }

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
            <div className="text-xs sm:text-sm text-muted-foreground">
                {t('member.showing_entries', {
                    from: pagination.from,
                    to: pagination.to,
                    total: pagination.total
                })}
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-center">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(pagination.current_page - 1)}
                    disabled={pagination.current_page === 1}
                >
                    {t('member.previous')}
                </Button>
                <div className="flex items-center gap-1">
                    {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => {
                        // Show first page, last page, current page, and pages around current
                        if (
                            page === 1 ||
                            page === pagination.last_page ||
                            (page >= pagination.current_page - 1 && page <= pagination.current_page + 1)
                        ) {
                            return (
                                <Button
                                    key={page}
                                    variant={page === pagination.current_page ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => onPageChange(page)}
                                    className="min-w-[40px]"
                                >
                                    {page}
                                </Button>
                            );
                        } else if (
                            page === pagination.current_page - 2 ||
                            page === pagination.current_page + 2
                        ) {
                            return <span key={page} className="px-2 text-muted-foreground">...</span>;
                        }
                        return null;
                    })}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(pagination.current_page + 1)}
                    disabled={pagination.current_page === pagination.last_page}
                >
                    {t('member.next')}
                </Button>
            </div>
        </div>
    );
}
