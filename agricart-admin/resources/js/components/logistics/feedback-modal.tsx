import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Logistic, LogisticFeedback } from '@/types/logistics';
import { useTranslation } from '@/hooks/use-translation';
import { Star, MessageSquare, Package, Calendar } from 'lucide-react';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    logistic: Logistic | null;
}

export const FeedbackModal = ({ isOpen, onClose, logistic }: FeedbackModalProps) => {
    const t = useTranslation();

    if (!logistic) return null;

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`h-4 w-4 ${
                    i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                }`}
            />
        ));
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        {t('admin.customer_feedback')} - {logistic.name}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Summary */}
                    <div className="bg-accent/50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">{t('admin.average_rating')}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="flex gap-0.5">
                                        {renderStars(Math.round(logistic.average_rating || 0))}
                                    </div>
                                    <span className="text-lg font-bold">
                                        {logistic.average_rating?.toFixed(1) || '—'}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">{t('admin.total_feedback')}</p>
                                <p className="text-lg font-bold">{logistic.feedback?.length || 0}</p>
                            </div>
                        </div>
                    </div>

                    {/* Feedback List */}
                    <div className="max-h-[400px] overflow-y-auto pr-4">
                        {logistic.feedback && logistic.feedback.length > 0 ? (
                            <div className="space-y-3">
                                {logistic.feedback.map((item: LogisticFeedback) => (
                                    <div
                                        key={item.order_id}
                                        className="border border-border rounded-lg p-4 space-y-2"
                                    >
                                        {/* Header */}
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-2">
                                                <Package className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm font-medium">
                                                    {t('admin.order')} #{item.order_id}
                                                </span>
                                            </div>
                                            <div className="flex gap-0.5">
                                                {renderStars(item.rating)}
                                            </div>
                                        </div>

                                        {/* Feedback */}
                                        <p className="text-sm text-foreground leading-relaxed">
                                            {item.feedback}
                                        </p>

                                        {/* Date */}
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Calendar className="h-3 w-3" />
                                            <span>
                                                {t('admin.confirmed_on')} {formatDate(item.confirmed_at)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center py-8">
                                <MessageSquare className="h-12 w-12 text-muted-foreground mb-3" />
                                <p className="text-muted-foreground">{t('admin.no_feedback_yet')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
