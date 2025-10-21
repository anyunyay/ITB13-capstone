import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { usePage } from '@inertiajs/react';
import { HelpCircle, Mail, Phone, Search, ChevronDown, ChevronUp } from 'lucide-react';
import ProfileWrapper from './profile-wrapper';

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

const faqs: FAQ[] = [
    {
        id: 1,
        question: "How do I place an order?",
        answer: "To place an order, browse our products, add items to your cart, and proceed to checkout. You'll need to provide your delivery address and payment information.",
        category: "Ordering"
    },
    {
        id: 2,
        question: "What payment methods do you accept?",
        answer: "We accept cash on delivery (COD), credit cards, debit cards, and digital wallets like GCash and PayMaya.",
        category: "Payment"
    },
    {
        id: 3,
        question: "How long does delivery take?",
        answer: "Delivery typically takes 1-3 business days for Metro Manila and 3-7 business days for provincial areas.",
        category: "Delivery"
    },
    {
        id: 4,
        question: "Can I track my order?",
        answer: "Yes! You can track your order status in the 'My Orders' section of your account dashboard.",
        category: "Tracking"
    },
    {
        id: 5,
        question: "What is your return policy?",
        answer: "We offer a 7-day return policy for unopened items. Contact our support team to initiate a return.",
        category: "Returns"
    },
    {
        id: 6,
        question: "How do I update my account information?",
        answer: "You can update your account information in the Profile section of your account dashboard.",
        category: "Account"
    },
    {
        id: 7,
        question: "Are there any delivery fees?",
        answer: "Delivery fees vary by location. Free delivery is available for orders over ₱500 in Metro Manila.",
        category: "Pricing"
    },
    {
        id: 8,
        question: "How do I contact customer support?",
        answer: "You can contact us through the support form below, email us at support@agricart.com, or call our hotline at (02) 1234-5678.",
        category: "Account"
    }
];

const categories = ["All", "Ordering", "Payment", "Delivery", "Tracking", "Returns", "Account", "Pricing"];

export default function HelpPage() {
    const { user } = usePage<PageProps>().props;
    
    // Generate dynamic routes based on user type
    const getProfileRoutes = () => {
        const userType = user.type;
        const baseRoute = userType === 'customer' ? '/customer' : 
                         userType === 'admin' || userType === 'staff' ? '/admin' :
                         userType === 'logistic' ? '/logistic' :
                         userType === 'member' ? '/member' : '/customer';
        
        return {
            helpPage: `${baseRoute}/profile/help`,
        };
    };

    const routes = getProfileRoutes();
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

    return (
        <ProfileWrapper 
            breadcrumbs={[
                { title: 'Help & Support', href: routes.helpPage }
            ]}
            title="Help & Support"
        >
            <div className="space-y-6">
                {/* FAQ Section */}
                <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 group">
                    <CardHeader className="bg-gradient-to-r from-slate-100/80 to-slate-200/80 dark:from-slate-700/50 dark:to-slate-800/50 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-600/50">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6">
                            <div className="flex items-center space-x-6">
                                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                    <HelpCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="space-y-1">
                                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                                        Frequently Asked Questions
                                    </h1>
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                            <HelpCircle className="h-3 w-3 mr-1" />
                                            Support Center
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        Find answers to common questions about our services
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="px-6 py-6">
                        {/* Search and Filter Section */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-6">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                                <Input
                                    placeholder="Search FAQs..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-12 border-2 border-slate-200/50 dark:border-slate-600/50 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100/50 dark:focus:ring-blue-900/30 transition-all duration-300 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-sm py-3"
                                />
                            </div>
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger className="w-full sm:w-48 border-2 border-slate-200/50 dark:border-slate-600/50 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100/50 dark:focus:ring-blue-900/30 transition-all duration-300 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-slate-200/50 dark:border-slate-600/50">
                                    {categories.map((category) => (
                                        <SelectItem key={category} value={category} className="hover:bg-blue-50/80 dark:hover:bg-blue-900/20 focus:bg-blue-50/80 dark:focus:bg-blue-900/20">
                                            <span className="text-slate-700 dark:text-slate-300 font-medium">{category}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* FAQ Items */}
                        <div className="space-y-4">
                            {filteredFaqs.map((faq) => (
                                <div key={faq.id} className="bg-slate-50/80 dark:bg-slate-700/30 rounded-xl border border-slate-200/50 dark:border-slate-600/50 hover:bg-slate-100/80 dark:hover:bg-slate-700/50 transition-all duration-200 overflow-hidden">
                                    <button
                                        onClick={() => toggleExpanded(faq.id)}
                                        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-100/50 dark:hover:bg-slate-600/30 transition-colors duration-200"
                                    >
                                        <div className="flex items-center gap-4 flex-1">
                                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-medium">
                                                {faq.category}
                                            </Badge>
                                            <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{faq.question}</span>
                                        </div>
                                        <div className="flex-shrink-0">
                                            {expandedItems.includes(faq.id) ? (
                                                <ChevronUp className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                                            ) : (
                                                <ChevronDown className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                                            )}
                                        </div>
                                    </button>
                                    {expandedItems.includes(faq.id) && (
                                        <div className="px-6 pb-4 border-t border-slate-200/50 dark:border-slate-600/50">
                                            <div className="pt-4 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                                {faq.answer}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* No Results */}
                        {filteredFaqs.length === 0 && (
                            <div className="text-center py-12">
                                <div className="p-4 rounded-full bg-slate-100/80 dark:bg-slate-700/30 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                                    <HelpCircle className="h-10 w-10 text-slate-400 dark:text-slate-500" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">No FAQs found</h3>
                                <p className="text-slate-600 dark:text-slate-400">Try adjusting your search terms or category filter.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>


                {/* Contact Information */}
                <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700/50 hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-500 group">
                    <CardHeader className="bg-gradient-to-r from-slate-100/80 to-slate-200/80 dark:from-slate-700/50 dark:to-slate-800/50 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-600/50">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6">
                            <div className="flex items-center space-x-6">
                                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                                    <Phone className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                                        Other Ways to Reach Us
                                    </h2>
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                            <Phone className="h-3 w-3 mr-1" />
                                            Contact Support
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        Get in touch with our support team for personalized assistance
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="px-6 py-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-5 bg-slate-50/80 dark:bg-slate-700/30 rounded-xl border border-slate-200/50 dark:border-slate-600/50 hover:bg-slate-100/80 dark:hover:bg-slate-700/50 transition-colors duration-200">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                        <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Email Support</p>
                                        <p className="font-semibold text-slate-800 dark:text-slate-200">support@agricart.com</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">We'll respond within 24 hours</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-5 bg-slate-50/80 dark:bg-slate-700/30 rounded-xl border border-slate-200/50 dark:border-slate-600/50 hover:bg-slate-100/80 dark:hover:bg-slate-700/50 transition-colors duration-200">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                                        <Phone className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Phone Support</p>
                                        <p className="font-semibold text-slate-800 dark:text-slate-200">(02) 1234-5678</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Mon-Fri 9AM-6PM</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </ProfileWrapper>
    );
}
