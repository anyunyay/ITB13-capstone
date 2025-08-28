import { Head } from '@inertiajs/react';
import { Shield, Users, Truck, User } from 'lucide-react';

import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/layouts/auth-layout';

export default function AuthIndex() {
    const loginOptions = [
        {
            title: 'Customer Login',
            description: 'Shop and manage your orders',
            icon: User,
            route: 'login',
            color: 'bg-purple-600 hover:bg-purple-700',
            bgColor: 'bg-purple-100',
            iconColor: 'text-purple-600',
            features: ['Browse products', 'Place orders', 'Track deliveries', 'Manage account']
        },
        {
            title: 'Admin Portal',
            description: 'Administrative dashboard access',
            icon: Shield,
            route: 'admin.login',
            color: 'bg-blue-600 hover:bg-blue-700',
            bgColor: 'bg-blue-100',
            iconColor: 'text-blue-600',
            features: ['Manage products', 'View analytics', 'User management', 'System settings']
        },
        {
            title: 'Member Portal',
            description: 'Exclusive member benefits',
            icon: Users,
            route: 'member.login',
            color: 'bg-green-600 hover:bg-green-700',
            bgColor: 'bg-green-100',
            iconColor: 'text-green-600',
            features: ['Premium features', 'Special discounts', 'Priority support', 'Exclusive content']
        },
        {
            title: 'Logistics Portal',
            description: 'Manage deliveries and shipments',
            icon: Truck,
            route: 'logistic.login',
            color: 'bg-orange-600 hover:bg-orange-700',
            bgColor: 'bg-orange-100',
            iconColor: 'text-orange-600',
            features: ['Track shipments', 'Manage deliveries', 'Route optimization', 'Delivery reports']
        }
    ];

    return (
        <AuthLayout 
            title="Welcome to AgriCart" 
            description="Choose your portal to get started"
        >
            <Head title="Portal Selection" />

            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to AgriCart</h1>
                <p className="text-gray-600">Select your portal to access the appropriate dashboard</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {loginOptions.map((option, index) => {
                    const IconComponent = option.icon;
                    return (
                        <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                            <div className="text-center mb-4">
                                <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full ${option.bgColor}`}>
                                    <IconComponent className={`h-6 w-6 ${option.iconColor}`} />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">{option.title}</h3>
                                <p className="text-sm text-gray-600 mb-4">{option.description}</p>
                            </div>

                            <div className="mb-4">
                                <ul className="text-sm text-gray-600 space-y-1">
                                    {option.features.map((feature, featureIndex) => (
                                        <li key={featureIndex} className="flex items-center">
                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <Button 
                                asChild 
                                className={`w-full ${option.color}`}
                            >
                                <TextLink href={route(option.route)}>
                                    Access {option.title}
                                </TextLink>
                            </Button>
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 text-center text-sm text-gray-600">
                <p>New to AgriCart?{' '}
                    <TextLink href={route('register')}>
                        Create an account
                    </TextLink>
                </p>
            </div>
        </AuthLayout>
    );
}
