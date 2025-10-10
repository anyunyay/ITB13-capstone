import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useForm, usePage } from '@inertiajs/react';
import { Lock, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import ProfileWrapper from './profile-wrapper';

interface PageProps {
    user: {
        id: number;
        name: string;
        email: string;
    };
}

export default function PasswordPage() {
    const { user } = usePage<PageProps>().props;
    
    // Generate dynamic routes based on user type
    const getProfileRoutes = () => {
        const userType = user.type;
        const baseRoute = userType === 'customer' ? '/customer' : 
                         userType === 'admin' || userType === 'staff' ? '/admin' :
                         userType === 'logistic' ? '/logistic' :
                         userType === 'member' ? '/member' : '/customer';
        
        return {
            changePassword: `${baseRoute}/profile/change-password`,
            passwordPage: `${baseRoute}/profile/password`,
        };
    };

    const routes = getProfileRoutes();
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const getPasswordStrength = (password: string) => {
        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        return score;
    };

    const getStrengthColor = (score: number) => {
        if (score <= 2) return 'bg-red-500';
        if (score <= 3) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getStrengthText = (score: number) => {
        if (score <= 2) return 'Weak';
        if (score <= 3) return 'Medium';
        return 'Strong';
    };

    const passwordStrength = getPasswordStrength(data.password);
    const strengthPercentage = (passwordStrength / 5) * 100;

    const requirements = [
        { text: 'At least 8 characters', met: data.password.length >= 8 },
        { text: 'Contains uppercase letter', met: /[A-Z]/.test(data.password) },
        { text: 'Contains lowercase letter', met: /[a-z]/.test(data.password) },
        { text: 'Contains number', met: /[0-9]/.test(data.password) },
        { text: 'Contains special character', met: /[^A-Za-z0-9]/.test(data.password) },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(routes.changePassword, {
            onSuccess: () => {
                reset();
                alert('Password changed successfully!');
            },
            onError: () => {
                alert('Failed to change password. Please check your current password and try again.');
            },
        });
    };

    return (
        <ProfileWrapper 
            breadcrumbs={[
                { title: 'Change Password', href: routes.passwordPage }
            ]}
            title="Change Password"
        >

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5" />
                        Security Settings
                    </CardTitle>
                    <CardDescription>
                        Update your password to keep your account secure
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="current_password">Current Password</Label>
                            <div className="relative">
                                <Input
                                    id="current_password"
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    value={data.current_password}
                                    onChange={(e) => setData('current_password', e.target.value)}
                                    placeholder="Enter your current password"
                                    required
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                >
                                    {showCurrentPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                            {errors.current_password && <p className="text-sm text-red-500">{errors.current_password}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">New Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showNewPassword ? 'text' : 'password'}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Enter your new password"
                                    required
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                >
                                    {showNewPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                        </div>

                        {data.password && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label>Password Strength</Label>
                                    <span className={`text-sm font-medium ${
                                        passwordStrength <= 2 ? 'text-red-500' : 
                                        passwordStrength <= 3 ? 'text-yellow-500' : 'text-green-500'
                                    }`}>
                                        {getStrengthText(passwordStrength)}
                                    </span>
                                </div>
                                <Progress 
                                    value={strengthPercentage} 
                                    className="h-2"
                                />
                                <div className="space-y-1">
                                    {requirements.map((req, index) => (
                                        <div key={index} className="flex items-center gap-2 text-sm">
                                            {req.met ? (
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <XCircle className="h-4 w-4 text-gray-400" />
                                            )}
                                            <span className={req.met ? 'text-green-600' : 'text-gray-500'}>
                                                {req.text}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="password_confirmation">Confirm New Password</Label>
                            <div className="relative">
                                <Input
                                    id="password_confirmation"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    placeholder="Confirm your new password"
                                    required
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                            {errors.password_confirmation && <p className="text-sm text-red-500">{errors.password_confirmation}</p>}
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={processing || passwordStrength < 3}>
                                {processing ? 'Changing Password...' : 'Change Password'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </ProfileWrapper>
    );
}
