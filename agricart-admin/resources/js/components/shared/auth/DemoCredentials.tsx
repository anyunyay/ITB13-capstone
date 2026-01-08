import { Info, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface DemoCredentialsProps {
    className?: string;
}

interface Credential {
    label: string;
    route: string;
    email: string;
    password: string;
}

const credentials: Credential[] = [
    {
        label: 'Customer',
        route: '/login',
        email: 'customer@customer.com',
        password: '12345678'
    },
    {
        label: 'Member (Farmer)',
        route: '/member/login',
        email: 'member@member.com',
        password: '12345678'
    },
    {
        label: 'Logistics',
        route: '/logistic/login',
        email: 'judel@logistic.com',
        password: '12345678'
    },
    {
        label: 'Admin',
        route: '/admin/login',
        email: 'admin@admin.com',
        password: '12345678'
    }
];

export default function DemoCredentials({ className = '' }: DemoCredentialsProps) {
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const copyToClipboard = async (text: string, fieldId: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(fieldId);
            setTimeout(() => setCopiedField(null), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    return (
        <div className={`mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 ${className}`}>
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                    <Info className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 mb-3">Demo Credentials</h3>
                    <div className="space-y-3">
                        {credentials.map((cred, index) => (
                            <div key={index} className="text-sm">
                                <div className="font-medium text-blue-800 mb-1">
                                    {cred.label} – <span className="text-blue-600">{cred.route}</span>
                                </div>
                                <div className="flex items-center gap-2 text-blue-700">
                                    <span className="font-mono bg-white px-2 py-1 rounded border text-xs">
                                        {cred.email}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => copyToClipboard(cred.email, `email-${index}`)}
                                        className="p-1 hover:bg-blue-100 rounded transition-colors"
                                        title="Copy email"
                                    >
                                        {copiedField === `email-${index}` ? (
                                            <Check className="h-3 w-3 text-green-600" />
                                        ) : (
                                            <Copy className="h-3 w-3 text-blue-600" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                        <div className="text-sm text-blue-700 mt-2">
                            <span className="font-medium">Password for all:</span>{' '}
                            <span className="font-mono bg-white px-2 py-1 rounded border text-xs">12345678</span>
                            <button
                                type="button"
                                onClick={() => copyToClipboard('12345678', 'password')}
                                className="ml-2 p-1 hover:bg-blue-100 rounded transition-colors"
                                title="Copy password"
                            >
                                {copiedField === 'password' ? (
                                    <Check className="h-3 w-3 text-green-600" />
                                ) : (
                                    <Copy className="h-3 w-3 text-blue-600" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}