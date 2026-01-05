import AuthCardLayout from '@/layouts/auth/auth-card-layout';

interface AuthLayoutProps {
    children: React.ReactNode;
    title?: string;
    description: string;
    imageUrl?: string;
    imagePosition?: 'left' | 'right';
    icon?: React.ReactNode;
    iconBgColor?: string;
    iconColor?: string;
}

export default function AuthLayout({ 
    children, 
    title, 
    description, 
    imageUrl,
    imagePosition,
    icon,
    iconBgColor,
    iconColor,
    ...props 
}: AuthLayoutProps) {
    return (
        <AuthCardLayout 
            title={title} 
            description={description}
            imageUrl={imageUrl}
            imagePosition={imagePosition}
            icon={icon}
            iconBgColor={iconBgColor}
            iconColor={iconColor}
            {...props}
        >
            {children}
        </AuthCardLayout>
    );
}
