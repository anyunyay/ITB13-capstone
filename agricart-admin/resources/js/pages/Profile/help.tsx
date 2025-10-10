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

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HelpCircle className="h-5 w-5" />
                        Frequently Asked Questions
                    </CardTitle>
                    <CardDescription>
                        Find answers to common questions about our services
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder="Search FAQs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger className="w-full sm:w-48">
                                <SelectValue />
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

                    <div className="space-y-2">
                        {filteredFaqs.map((faq) => (
                            <div key={faq.id} className="border rounded-lg">
                                <button
                                    onClick={() => toggleExpanded(faq.id)}
                                    className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50"
                                >
                                    <div className="flex items-center gap-3">
                                        <Badge variant="secondary" className="text-xs">
                                            {faq.category}
                                        </Badge>
                                        <span className="font-medium">{faq.question}</span>
                                    </div>
                                    {expandedItems.includes(faq.id) ? (
                                        <ChevronUp className="h-4 w-4 text-gray-500" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4 text-gray-500" />
                                    )}
                                </button>
                                {expandedItems.includes(faq.id) && (
                                    <div className="px-4 pb-3 text-gray-600">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {filteredFaqs.length === 0 && (
                        <div className="text-center py-8">
                            <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No FAQs found</h3>
                            <p className="text-gray-500">Try adjusting your search terms or category filter.</p>
                        </div>
                    )}
                </CardContent>
            </Card>


            {/* Contact Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Phone className="h-5 w-5" />
                        Other Ways to Reach Us
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-4 border rounded-lg">
                            <Mail className="h-5 w-5 text-blue-600" />
                            <div>
                                <p className="font-medium">Email Support</p>
                                <p className="text-sm text-gray-600">support@agricart.com</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 border rounded-lg">
                            <Phone className="h-5 w-5 text-green-600" />
                            <div>
                                <p className="font-medium">Phone Support</p>
                                <p className="text-sm text-gray-600">(02) 1234-5678</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </ProfileWrapper>
    );
}
