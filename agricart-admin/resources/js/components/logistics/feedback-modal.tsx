import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Logistic, LogisticFeedback } from '@/types/logistics';
import { useTranslation } from '@/hooks/use-translation';
import { Star, MessageSquare, Package, Calendar, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    logistic: Logistic | null;
}

export const FeedbackModal = ({ isOpen, onClose, logistic }: FeedbackModalProps) => {
    const t = useTranslation();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;

    // Reset to page 1 when modal opens or logistic changes
    useEffect(() => {
        setCurrentPage(1);
    }, [isOpen, logistic?.id]);

    if (!logistic) return null;

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`h-4 w-4 ${
                    i < rating ? 'fill-yellow-500 text-yellow-500' : 'fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700'
                }`}
            />
        ));
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Pagination logic
    const totalFeedback = logistic.feedback?.length || 0;
    const totalPages = Math.ceil(totalFeedback / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedFeedback = logistic.feedback?.slice(startIndex, endIndex) || [];

    const handlePreviousPage = () => {
        setCurrentPage(prev => Math.max(1, prev - 1));
    };

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(totalPages, prev + 1));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <MessageSquare className="h-6 w-6 text-primary" />
                        {t('admin.customer_feedback')}
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                        {logistic.name}
                    </p>
                </DialogHeader>

                <div className="space-y-6 overflow-y-auto pr-2">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Average Rating Card */}
                        <Card className="gap-0">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4" />
                                    {t('admin.average_rating')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-3">
                                    <div className="flex gap-0.5">
                                        {renderStars(Math.round(logistic.average_rating || 0))}
                                    </div>
                                    <span className="text-3xl font-bold text-foreground">
                                        {logistic.average_rating?.toFixed(1) || '—'}
                                    </span>
                                    <span className="text-sm text-muted-foreground">/ 5</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Total Feedback Card */}
                        <Card className="gap-0">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4" />
                                    {t('admin.total_feedback')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    <span className="text-3xl font-bold text-foreground">
                                        {logistic.feedback?.length || 0}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        {logistic.feedback?.length === 1 ? t('admin.review') : t('admin.reviews')}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Feedback List */}
                    <div>
                        <h3 className="text-lg font-semibold text-foreground mb-4">
                            {t('admin.customer_reviews')}
                        </h3>
                        {logistic.feedback && logistic.feedback.length > 0 ? (
                            <>
                                <div className="space-y-3">
                                    {paginatedFeedback.map((item: LogisticFeedback) => (
                                        <Card key={item.order_id} className="gap-0">
                                            <CardHeader className="pb-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <Package className="h-4 w-4 text-primary mr-2" />
                                                        <Badge variant="outline" className="font-normal">
                                                            {t('admin.order')} #{item.order_id}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex">
                                                        {renderStars(item.rating)}
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="gap-0">
                                                {/* Feedback Text */}
                                                <div className="bg-muted/50 rounded-lg p-3 mb-2">
                                                    <p className="text-sm text-foreground leading-relaxed">
                                                        "{item.feedback}"
                                                    </p>
                                                </div>

                                                {/* Date */}
                                                <div className="flex items-center text-xs text-muted-foreground">
                                                    <Calendar className="h-3 w-3 mr-2" />
                                                    <span>
                                                        {t('admin.confirmed_on')} {formatDate(item.confirmed_at)}
                                                    </span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>

                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between mt-6 pt-4 border-t">
                                        <div className="text-sm text-muted-foreground">
                                            Showing {startIndex + 1}-{Math.min(endIndex, totalFeedback)} of {totalFeedback} reviews
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handlePreviousPage}
                                                disabled={currentPage === 1}
                                            >
                                                <ChevronLeft className="h-4 w-4 mr-1" />
                                                Previous
                                            </Button>
                                            <div className="text-sm font-medium">
                                                Page {currentPage} of {totalPages}
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleNextPage}
                                                disabled={currentPage === totalPages}
                                            >
                                                Next
                                                <ChevronRight className="h-4 w-4 ml-1" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <Card className="gap-0">
                                <CardContent className="flex flex-col items-center justify-center text-center py-12">
                                    <div className="bg-muted rounded-full p-4 mb-4">
                                        <MessageSquare className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h4 className="text-lg font-semibold text-foreground mb-2">
                                        {t('admin.no_feedback_yet')}
                                    </h4>
                                    <p className="text-sm text-muted-foreground max-w-sm">
                                        {t('admin.no_feedback_description')}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
