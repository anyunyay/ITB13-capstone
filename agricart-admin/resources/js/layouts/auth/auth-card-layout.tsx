import AppLogoIcon from '@/components/app-logo-icon';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthCardLayoutProps {
    title?: string;
    description?: string;
    imageUrl?: string;
    imagePosition?: 'left' | 'right';
    icon?: React.ReactNode;
    iconBgColor?: string;
    iconColor?: string;
}

export default function AuthCardLayout({ 
    children, 
    title, 
    description, 
    imageUrl, 
    imagePosition = 'left',
    icon,
    iconBgColor = 'bg-primary/10',
    iconColor = 'text-primary'
}: PropsWithChildren<AuthCardLayoutProps>) {
    return (
        <div className="relative flex min-h-svh items-center justify-center p-4">
            {/* Blurred Background Image */}
            <div 
                className="absolute inset-0 auth-blur-background"
                style={{
                    backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    filter: 'blur(20px)'
                }}
            />
            
            {/* Overlay for better contrast */}
            <div className="absolute inset-0 bg-background/80 auth-blur-overlay" />
            
            {/* Main Content */}
            <div className="relative z-10 w-full max-w-6xl">
                <div className="grid min-h-[600px] overflow-hidden rounded-2xl bg-card shadow-2xl border border-border lg:grid-cols-2">
                    {/* Image Section */}
                    {imageUrl && (
                        <div className={`relative hidden lg:block ${imagePosition === 'left' ? 'order-1' : 'order-2'}`}>
                            <div className="h-full w-full">
                                <img
                                    src={imageUrl}
                                    alt={title || 'Authentication'}
                                    className="h-full w-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
                            </div>
                        </div>
                    )}

                    {/* Form Section */}
                    <div className={`flex flex-col justify-center p-8 lg:p-12 ${imagePosition === 'left' ? 'lg:order-2' : 'lg:order-1'}`}>
                        {/* Logo and Header */}
                        <div className="mb-8 text-center">
                            <Link href={route('home')} className="mb-6 inline-block">
                                <div className="flex items-center justify-center">
                                    <AppLogoIcon className="h-12 w-12 fill-current text-foreground" />
                                </div>
                            </Link>

                            {/* Icon */}
                            {icon && (
                                <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${iconBgColor}`}>
                                    <div className={`h-8 w-8 ${iconColor}`}>
                                        {icon}
                                    </div>
                                </div>
                            )}

                            {/* Title and Description */}
                            <div className="space-y-2">
                                <h1 className="text-2xl font-bold text-card-foreground">{title}</h1>
                                <p className="text-sm text-muted-foreground">{description}</p>
                            </div>
                        </div>

                        {/* Form Content */}
                        <div className="max-w-md mx-auto w-full">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}