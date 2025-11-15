import { ReactNode } from 'react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import LogisticLayout from '@/layouts/logistic-layout';
import MemberLayout from '@/layouts/member-layout';

interface ProfilePageLayoutProps {
    userType: string;
    title: string;
    description: string;
    children: ReactNode;
    isCustomerDesign?: boolean;
}

export default function ProfilePageLayout({ 
    userType, 
    title, 
    description, 
    children,
    isCustomerDesign = false 
}: ProfilePageLayoutProps) {
    
    // Customer design - clean, spacious, modern
    if (isCustomerDesign && userType === 'customer') {
        return (
            <AppHeaderLayout>
                <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-16 sm:mt-20">
                        {/* Customer Header - Minimalist & Clean */}
                        <div className="mb-10 text-center">
                            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3 tracking-tight">
                                {title}
                            </h1>
                            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
                                {description}
                            </p>
                        </div>
                        {/* Customer Content */}
                        <div className="space-y-6">
                            {children}
                        </div>
                    </div>
                </div>
            </AppHeaderLayout>
        );
    }

    // Admin/Staff/Logistic/Member design - professional, compact
    const renderWithLayout = (content: ReactNode) => {
        switch (userType) {
            case 'admin':
            case 'staff':
                return (
                    <AppSidebarLayout>
                        {content}
                    </AppSidebarLayout>
                );
            case 'logistic':
                return (
                    <LogisticLayout>
                        {content}
                    </LogisticLayout>
                );
            case 'member':
                return (
                    <MemberLayout>
                        {content}
                    </MemberLayout>
                );
            default:
                return (
                    <AppHeaderLayout>
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16 sm:mt-20">
                            {content}
                        </div>
                    </AppHeaderLayout>
                );
        }
    };

    return renderWithLayout(
        <div className="p-4 sm:p-6 lg:p-8">
            {/* Admin/Staff Header - Compact & Professional */}
            <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                    {title}
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    {description}
                </p>
            </div>
            {/* Admin/Staff Content */}
            {children}
        </div>
    );
}
