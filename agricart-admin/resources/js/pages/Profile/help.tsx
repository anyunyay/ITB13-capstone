import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePage, Link } from '@inertiajs/react';
import { HelpCircle, Mail, Phone, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { useTranslation } from '@/hooks/use-translation';

interface FAQ {
    id: number;
    question: string;
    answer: string;
    category: string;
}

interface PageProps {
    user: {
        id: number;
        name: string;
        email: string;
        type: string;
    };
    [key: string]: any;
}

export default function HelpPage() {
    const { user } = usePage<PageProps>().props;
    const t = useTranslation();

    const faqs: FAQ[] = [
        { id: 1, question: t('ui.faq_place_order'), answer: t('ui.faq_place_order_answer'), category: t('ui.faq_category_ordering') },
        { id: 2, question: t('ui.faq_payment_methods'), answer: t('ui.faq_payment_methods_answer'), category: t('ui.faq_category_payment') },
        { id: 3, question: t('ui.faq_delivery_time'), answer: t('ui.faq_delivery_time_answer'), category: t('ui.faq_category_delivery') },
        { id: 4, question: t('ui.faq_track_order'), answer: t('ui.faq_track_order_answer'), category: t('ui.faq_category_tracking') },
        { id: 5, question: t('ui.faq_update_account'), answer: t('ui.faq_update_account_answer'), category: t('ui.faq_category_account') },
        { id: 6, question: t('ui.faq_delivery_fees'), answer: t('ui.faq_delivery_fees_answer'), category: t('ui.faq_category_pricing') },
        { id: 7, question: t('ui.faq_contact_support'), answer: t('ui.faq_contact_support_answer'), category: t('ui.faq_category_account') }
    ];

    const categories = [t('ui.all'), t('ui.faq_category_ordering'), t('ui.faq_category_payment'), t('ui.faq_category_delivery'), t('ui.faq_category_tracking'), t('ui.faq_category_account'), t('ui.faq_category_pricing')];
    
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [expandedItems, setExpandedItems] = useState<number[]>([]);

    const filteredFaqs = faqs.filter(faq => {
        const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
        return matchesCategory;
    });

    const toggleExpanded = (itemId: number) => {
        setExpandedItems(prev => 
            prev.includes(itemId) 
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    return (
        <AppHeaderLayout>
            <div className="min-h-[90vh] py-4 sm:py-6 lg:py-8 mt-16 sm:mt-18 lg:mt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-6 sm:mb-8">
                        <div className="flex items-start justify-between gap-3 sm:gap-4 mb-3 sm:mb-0">
                            <div className="flex-1 min-w-0 order-1">
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-green-600 dark:text-green-400 mb-2">
                                    {t('ui.help_and_support')}
                                </h1>
                                <p className="text-base md:text-xl lg:text-2xl text-green-600 dark:text-green-400">
                                    {t('ui.find_answers_to_common_questions')}
                                </p>
                            </div>
                            <Link href="/" className="order-2 shrink-0">
                                <Button 
                                    variant="outline" 
                                    size="icon"
                                    className="sm:w-auto sm:px-6 sm:py-3 border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white transition-all duration-300 rounded-lg shadow-md hover:shadow-lg"
                                >
                                    <ArrowLeft className="h-4 w-4 sm:mr-2" />
                                    <span className="hidden sm:inline text-sm sm:text-base font-semibold">{t('ui.back')}</span>
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="space-y-4 sm:space-y-6">
                        {/* FAQ Section */}
                        <div className="bg-card rounded-lg sm:rounded-xl shadow-lg border-2 border-green-200 dark:border-green-700 overflow-hidden">
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b-2 border-green-200 dark:border-green-700 p-4 sm:p-5 md:p-6">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <div className="p-2 sm:p-2.5 rounded-lg bg-green-100 dark:bg-green-900/30 shadow-sm flex-shrink-0">
                                            <HelpCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div className="space-y-1 sm:space-y-2 min-w-0">
                                            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-green-700 dark:text-green-300 break-words">
                                                {t('ui.frequently_asked_questions')}
                                            </h3>
                                            <p className="text-xs sm:text-sm text-green-600 dark:text-green-400">
                                                {t('ui.find_answers_to_common_questions')}
                                            </p>
                                        </div>
                                    </div>
                                    {/* Filter Section */}
                                    <div className="w-full sm:w-auto">
                                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                            <SelectTrigger className="w-full sm:w-64 h-10 sm:h-12 text-sm sm:text-base rounded-lg border-2 border-green-200 dark:border-green-700 bg-white dark:bg-green-950/20">
                                                <SelectValue placeholder={t('ui.select_category')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((category) => (
                                                    <SelectItem key={category} value={category} className="text-sm sm:text-base py-2 sm:py-3">
                                                        {category}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 sm:p-5 md:p-6">

                                {/* FAQ Items */}
                                <div className="space-y-3 sm:space-y-4">
                                    {filteredFaqs.map((faq) => (
                                        <div key={faq.id} className="bg-muted/50 rounded-lg border border-border hover:border-green-200 dark:hover:border-green-700 transition-all duration-200 overflow-hidden">
                                            <button
                                                onClick={() => toggleExpanded(faq.id)}
                                                className="w-full px-4 sm:px-5 md:px-6 py-3 sm:py-4 md:py-5 text-left flex items-start justify-between hover:bg-muted/70 transition-colors duration-200"
                                            >
                                                <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-[80px_1fr] gap-2 sm:gap-4">
                                                    <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs sm:text-sm font-medium px-2 sm:px-3 py-0.5 sm:py-1 w-fit">
                                                        {faq.category}
                                                    </Badge>
                                                    <span className="font-semibold text-foreground text-sm sm:text-base break-words leading-relaxed">{faq.question}</span>
                                                </div>
                                                <div className="flex-shrink-0 ml-2 sm:ml-4">
                                                    {expandedItems.includes(faq.id) ? (
                                                        <ChevronUp className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                                                    ) : (
                                                        <ChevronDown className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                                                    )}
                                                </div>
                                            </button>
                                            {expandedItems.includes(faq.id) && (
                                                <div className="px-4 sm:px-5 md:px-6 pb-3 sm:pb-4 md:pb-5 border-t border-border">
                                                    <div className="pt-3 sm:pt-4 md:pt-5 grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-2 sm:gap-4">
                                                        <div className="hidden sm:block"></div>
                                                        <div className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                                                            {faq.answer}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* No Results */}
                                {filteredFaqs.length === 0 && (
                                    <div className="text-center py-12 sm:py-16">
                                        <div className="p-4 sm:p-5 rounded-full bg-green-100 dark:bg-green-900/30 w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                                            <HelpCircle className="h-10 w-10 sm:h-12 sm:w-12 text-green-600 dark:text-green-400" />
                                        </div>
                                        <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3">{t('ui.no_faqs_found')}</h3>
                                        <p className="text-sm sm:text-base text-muted-foreground">{t('ui.try_adjust_your_search')}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="bg-card rounded-lg sm:rounded-xl shadow-lg border-2 border-green-200 dark:border-green-700 overflow-hidden">
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b-2 border-green-200 dark:border-green-700 p-4 sm:p-5 md:p-6">
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <div className="p-2 sm:p-2.5 rounded-lg bg-green-100 dark:bg-green-900/30 shadow-sm flex-shrink-0">
                                        <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div className="space-y-1 sm:space-y-2 min-w-0">
                                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-green-700 dark:text-green-300 break-words">
                                            {t('ui.other_ways_to_reach_us')}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-green-600 dark:text-green-400">
                                            {t('ui.get_in_touch_with_support')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 sm:p-5 md:p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                                    <div className="p-4 sm:p-5 md:p-6 bg-muted/50 rounded-lg border border-border hover:border-green-200 dark:hover:border-green-700 transition-all duration-200">
                                        <div className="flex items-start gap-3 sm:gap-4">
                                            <div className="p-2 sm:p-2.5 rounded-lg bg-green-100 dark:bg-green-900/30 flex-shrink-0">
                                                <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs sm:text-sm font-semibold text-muted-foreground mb-1">{t('ui.email_support')}</p>
                                                <p className="font-bold text-foreground text-base sm:text-lg break-words">support@agricart.com</p>
                                                <p className="text-xs sm:text-sm text-muted-foreground mt-1">{t('ui.respond_within_24h')}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 sm:p-5 md:p-6 bg-muted/50 rounded-lg border border-border hover:border-green-200 dark:hover:border-green-700 transition-all duration-200">
                                        <div className="flex items-start gap-3 sm:gap-4">
                                            <div className="p-2 sm:p-2.5 rounded-lg bg-green-100 dark:bg-green-900/30 flex-shrink-0">
                                                <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs sm:text-sm font-semibold text-muted-foreground mb-1">{t('ui.phone_support')}</p>
                                                <p className="font-bold text-foreground text-base sm:text-lg break-words">(02) 1234-5678</p>
                                                <p className="text-xs sm:text-sm text-muted-foreground mt-1">{t('ui.support_hours')}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppHeaderLayout>
    );
}
