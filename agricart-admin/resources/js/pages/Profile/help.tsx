import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { usePage } from '@inertiajs/react';
import { HelpCircle, Mail, Phone, Search, ChevronDown, ChevronUp } from 'lucide-react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import LogisticLayout from '@/layouts/logistic-layout';
import MemberLayout from '@/layouts/member-layout';
import { useTranslation } from '@/hooks/use-translation';
import { getProfileRoutes } from '@/lib/utils';

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

    const categories = [t('ui.all'), t('ui.faq_category_ordering'), t('ui.faq_category_payment'), t('ui.faq_category_delivery'), t('ui.faq_category_tracking'), t('ui.faq_category_returns'), t('ui.faq_category_account'), t('ui.faq_category_pricing')];
    
    // Customize content based on user type
    const getUserSpecificContent = () => {
        switch (user.type) {
            case 'admin':
            case 'staff':
                return {
                    title: t('ui.admin_help_center'),
                    description: t('ui.admin_help_description'),
                    contactEmail: 'admin-support@agricart.com',
                    contactPhone: '(02) 1234-5679'
                };
            case 'logistic':
                return {
                    title: t('ui.logistics_help_center'),
                    description: t('ui.logistics_help_description'),
                    contactEmail: 'logistics-support@agricart.com',
                    contactPhone: '(02) 1234-5680'
                };
            case 'member':
                return {
                    title: t('ui.member_help_center'),
                    description: t('ui.member_help_description'),
                    contactEmail: 'member-support@agricart.com',
                    contactPhone: '(02) 1234-5681'
                };
            case 'customer':
            default:
                return {
                    title: t('ui.help_and_support'),
                    description: t('ui.find_answers_to_common_questions'),
                    contactEmail: 'support@agricart.com',
                    contactPhone: '(02) 1234-5678'
                };
        }
    };

    const userContent = getUserSpecificContent();
    
    // Generate dynamic routes based on user type
    const routes = getProfileRoutes(user.type);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [expandedItems, setExpandedItems] = useState<number[]>([]);


    const filteredFaqs = faqs.filter(faq => {
        const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });


    const toggleExpanded = (itemId: number) => {
        setExpandedItems(prev => 
            prev.includes(itemId) 
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    const pageContent = user.type === 'customer' ? (
        // Customer Design - Clean & Modern
        <div className="space-y-8">
                {/* FAQ Section */}
                <Card className="border-2 shadow-xl rounded-3xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-br from-secondary/5 via-secondary/10 to-secondary/5 pb-8">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-secondary/10 rounded-2xl">
                                <HelpCircle className="h-7 w-7 text-secondary" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl">{userContent.title}</CardTitle>
                                <CardDescription className="text-base mt-1">
                                    {userContent.description}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        {/* Search and Filter Section */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-8">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                                <Input
                                    placeholder={t('ui.search_faqs')}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-12 h-14 text-base rounded-xl border-2"
                                />
                            </div>
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger className="w-full sm:w-56 h-14 text-base rounded-xl border-2">
                                    <SelectValue placeholder={t('ui.select_category')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem key={category} value={category} className="text-base py-3">
                                            {category}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* FAQ Items */}
                        <div className="space-y-4">
                            {filteredFaqs.map((faq) => (
                                <div key={faq.id} className="bg-muted/50 rounded-2xl border-2 hover:border-secondary/30 transition-all duration-200 overflow-hidden">
                                    <button
                                        onClick={() => toggleExpanded(faq.id)}
                                        className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-muted/70 transition-colors duration-200"
                                    >
                                        <div className="flex items-center gap-4 flex-1">
                                            <Badge variant="secondary" className="bg-secondary/10 text-secondary text-sm font-medium px-3 py-1">
                                                {faq.category}
                                            </Badge>
                                            <span className="font-semibold text-card-foreground text-base">{faq.question}</span>
                                        </div>
                                        <div className="flex-shrink-0">
                                            {expandedItems.includes(faq.id) ? (
                                                <ChevronUp className="h-6 w-6 text-muted-foreground" />
                                            ) : (
                                                <ChevronDown className="h-6 w-6 text-muted-foreground" />
                                            )}
                                        </div>
                                    </button>
                                    {expandedItems.includes(faq.id) && (
                                        <div className="px-6 pb-5 border-t-2 border-border/50">
                                            <div className="pt-5 text-muted-foreground text-base leading-relaxed">
                                                {faq.answer}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* No Results */}
                        {filteredFaqs.length === 0 && (
                            <div className="text-center py-16">
                                <div className="p-5 rounded-full bg-muted/80 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                                    <HelpCircle className="h-12 w-12 text-muted-foreground" />
                                </div>
                                <h3 className="text-xl font-semibold text-card-foreground mb-3">{t('ui.no_faqs_found')}</h3>
                                <p className="text-base text-muted-foreground">{t('ui.try_adjust_your_search')}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>


                {/* Contact Information */}
                <Card className="border-2 shadow-xl rounded-3xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 pb-8">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-2xl">
                                <Phone className="h-7 w-7 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl">{t('ui.other_ways_to_reach_us')}</CardTitle>
                                <CardDescription className="text-base mt-1">
                                    {t('ui.get_in_touch_with_support')}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 bg-muted/50 rounded-2xl border-2 hover:border-secondary/30 transition-all duration-200">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-xl bg-secondary/10">
                                        <Mail className="h-6 w-6 text-secondary" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-muted-foreground mb-1">{t('ui.email_support')}</p>
                                        <p className="font-bold text-card-foreground text-lg">{userContent.contactEmail}</p>
                                        <p className="text-sm text-muted-foreground mt-1">{t('ui.respond_within_24h')}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 bg-muted/50 rounded-2xl border-2 hover:border-primary/30 transition-all duration-200">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-xl bg-primary/10">
                                        <Phone className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-muted-foreground mb-1">{t('ui.phone_support')}</p>
                                        <p className="font-bold text-card-foreground text-lg">{userContent.contactPhone}</p>
                                        <p className="text-sm text-muted-foreground mt-1">{t('ui.support_hours')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
    ) : (
        // Admin/Staff/Logistic/Member Design - Professional & Compact
        <div className="space-y-6">
                {/* FAQ Section */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <HelpCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <CardTitle className="text-green-600 dark:text-green-400">
                                    {userContent.title}
                                </CardTitle>
                                <CardDescription>
                                    {userContent.description}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Search and Filter */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input
                                    placeholder={t('ui.search_faqs')}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger className="w-full sm:w-48">
                                    <SelectValue placeholder={t('ui.select_category')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem key={category} value={category}>
                                            {category}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* FAQ Items */}
                        <div className="space-y-3">
                            {filteredFaqs.map((faq) => (
                                <div key={faq.id} className="bg-muted rounded-lg border hover:bg-muted/80 transition-all duration-200 overflow-hidden">
                                    <button
                                        onClick={() => toggleExpanded(faq.id)}
                                        className="w-full px-4 py-3 text-left flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3 flex-1">
                                            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs">
                                                {faq.category}
                                            </Badge>
                                            <span className="font-medium text-card-foreground text-sm">{faq.question}</span>
                                        </div>
                                        <div className="flex-shrink-0">
                                            {expandedItems.includes(faq.id) ? (
                                                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                            ) : (
                                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                            )}
                                        </div>
                                    </button>
                                    {expandedItems.includes(faq.id) && (
                                        <div className="px-4 pb-3 border-t">
                                            <div className="pt-3 text-muted-foreground text-sm">
                                                {faq.answer}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* No Results */}
                        {filteredFaqs.length === 0 && (
                            <div className="text-center py-8">
                                <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                                <h3 className="font-semibold text-card-foreground mb-1">{t('ui.no_faqs_found')}</h3>
                                <p className="text-sm text-muted-foreground">{t('ui.try_adjust_your_search')}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Contact Information */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <Phone className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <CardTitle className="text-green-600 dark:text-green-400">
                                    {t('ui.other_ways_to_reach_us')}
                                </CardTitle>
                                <CardDescription>
                                    {t('ui.get_in_touch_with_support')}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-muted rounded-lg border">
                                <div className="flex items-center gap-3">
                                    <Mail className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    <div className="flex-1">
                                        <p className="text-xs text-muted-foreground mb-1">{t('ui.email_support')}</p>
                                        <p className="font-semibold text-card-foreground">{userContent.contactEmail}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{t('ui.respond_within_24h')}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 bg-muted rounded-lg border">
                                <div className="flex items-center gap-3">
                                    <Phone className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    <div className="flex-1">
                                        <p className="text-xs text-muted-foreground mb-1">{t('ui.phone_support')}</p>
                                        <p className="font-semibold text-card-foreground">{userContent.contactPhone}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{t('ui.support_hours')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
    );

    // Render with appropriate layout based on user type
    switch (user?.type) {
        case 'admin':
        case 'staff':
            return (
                <AppSidebarLayout>
                    <div className="p-4 sm:p-6 lg:p-8">
                        <div className="mb-6">
                            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                                {userContent.title}
                            </h1>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {userContent.description}
                            </p>
                        </div>
                        {pageContent}
                    </div>
                </AppSidebarLayout>
            );
        case 'customer':
            return (
                <AppHeaderLayout>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16 sm:mt-20">
                        <div className="mb-8">
                            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                                {userContent.title}
                            </h1>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {userContent.description}
                            </p>
                        </div>
                        {pageContent}
                    </div>
                </AppHeaderLayout>
            );
        case 'logistic':
            return (
                <LogisticLayout>
                    <div className="px-2 pt-22 py-2 lg:px-8 lg:pt-25">
                        <div className="mb-6">
                            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                                {userContent.title}
                            </h1>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {userContent.description}
                            </p>
                        </div>
                        {pageContent}
                    </div>
                </LogisticLayout>
            );
        case 'member':
            return (
                <MemberLayout>
                    <div className="px-2 pt-15 py-2 lg:px-8 lg:pt-17">
                        <div className="mb-6">
                            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                                {userContent.title}
                            </h1>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {userContent.description}
                            </p>
                        </div>
                        {pageContent}
                    </div>
                </MemberLayout>
            );
        default:
            return (
                <AppHeaderLayout>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16 sm:mt-20">
                        <div className="mb-8">
                            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                                {userContent.title}
                            </h1>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {userContent.description}
                            </p>
                        </div>
                        {pageContent}
                    </div>
                </AppHeaderLayout>
            );
    }
}
