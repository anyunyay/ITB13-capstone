import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useForm, usePage, Link } from '@inertiajs/react';
import { Lock, Eye, EyeOff, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import LogisticLayout from '@/layouts/logistic-layout';
import MemberLayout from '@/layouts/member-layout';
import { useTranslation } from '@/hooks/use-translation';
import { getProfileRoutes } from '@/lib/utils';

interface PageProps {
    user: {
        id: number;
        name: string;
        email: string;
        type: string;
    };
    [key: string]: any;
}

export default function PasswordPage() {
    const { user } = usePage<PageProps>().props;
    const t = useTranslation();
    
    // Generate dynamic routes based on user type
    const profileRoutes = getProfileRoutes(user.type);
    const routes = {
        changePassword: `${profileRoutes.password.replace('/password', '/change-password')}`,
        passwordPage: profileRoutes.password,
    };
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

    const getStrengthText = (score: number) => {
        if (score <= 2) return t('ui.weak');
        if (score <= 3) return t('ui.medium');
        return t('ui.strong');
    };

    const passwordStrength = getPasswordStrength(data.password);
    const strengthPercentage = (passwordStrength / 5) * 100;

    const requirements = [
        { text: t('ui.at_least_8_characters'), met: data.password.length >= 8 },
        { text: t('ui.contains_uppercase_letter'), met: /[A-Z]/.test(data.password) },
        { text: t('ui.contains_lowercase_letter'), met: /[a-z]/.test(data.password) },
        { text: t('ui.contains_number'), met: /[0-9]/.test(data.password) },
        { text: t('ui.contains_special_character'), met: /[^A-Za-z0-9]/.test(data.password) },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(routes.changePassword, {
            onSuccess: () => {
                reset();
                alert(t('ui.password_changed_successfully'));
            },
            onError: () => {
                alert(t('ui.password_change_failed'));
            },
        });
    };

    const pageContent = user.type === 'customer' ? (
        // Customer Design - Clean & Modern
        <div className="space-y-8">
            <Card className="border-2 shadow-xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 pb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-2xl">
                            <Lock className="h-7 w-7 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl">{t('ui.security_settings')}</CardTitle>
                            <CardDescription className="text-base mt-1">
                                {t('ui.update_password_secure')}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Current Password Section */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-card-foreground">{t('ui.current_password')}</h3>
                                <div className="space-y-4">
                                    <div className="space-y-3">
                                        <Label htmlFor="current_password" className="text-sm font-semibold text-card-foreground">{t('ui.current_password')}</Label>
                                        <div className="relative">
                                            <Input
                                                id="current_password"
                                                type={showCurrentPassword ? 'text' : 'password'}
                                                value={data.current_password}
                                                onChange={(e) => setData('current_password', e.target.value)}
                                                placeholder={t('ui.enter_current_password')}
                                                required
                                                className="h-14 text-base rounded-xl border-2"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            >
                                                {showCurrentPassword ? (
                                                    <EyeOff className="h-5 w-5 text-muted-foreground" />
                                                ) : (
                                                    <Eye className="h-5 w-5 text-muted-foreground" />
                                                )}
                                            </Button>
                                        </div>
                                        {errors.current_password && <p className="text-sm text-destructive font-medium">{errors.current_password}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* New Password Section */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-card-foreground">{t('ui.new_password')}</h3>
                                <div className="space-y-4">
                                    {/* New Password Field */}
                                    <div className="space-y-3">
                                        <Label htmlFor="password" className="text-sm font-semibold text-card-foreground">{t('ui.new_password')}</Label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type={showNewPassword ? 'text' : 'password'}
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                placeholder={t('ui.enter_new_password')}
                                                required
                                                className="h-14 text-base rounded-xl border-2"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                            >
                                                {showNewPassword ? (
                                                    <EyeOff className="h-5 w-5 text-muted-foreground" />
                                                ) : (
                                                    <Eye className="h-5 w-5 text-muted-foreground" />
                                                )}
                                            </Button>
                                        </div>
                                        {errors.password && <p className="text-sm text-destructive font-medium">{errors.password}</p>}
                                    </div>

                                    {/* Password Strength Indicator */}
                                    {data.password && (
                                        <div className="p-6 bg-muted/50 rounded-2xl border-2">
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-base font-semibold text-card-foreground">{t('ui.password_strength')}</Label>
                                                    <span className={`text-sm font-medium ${
                                                        passwordStrength <= 2 ? 'text-destructive' : 
                                                        passwordStrength <= 3 ? 'text-yellow-500 dark:text-yellow-400' : 'text-green-500 dark:text-green-400'
                                                    }`}>
                                                        {getStrengthText(passwordStrength)}
                                                    </span>
                                                </div>
                                                <Progress 
                                                    value={strengthPercentage} 
                                                    className={`h-4 rounded-full ${
                                                        passwordStrength <= 2 ? '[&>div]:bg-red-500' : 
                                                        passwordStrength <= 3 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-green-500'
                                                    }`}
                                                />
                                                <div className="space-y-3">
                                                    {requirements.map((req, index) => (
                                                        <div key={index} className="flex items-center gap-3 text-base">
                                                            {req.met ? (
                                                                <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400 flex-shrink-0" />
                                                            ) : (
                                                                <XCircle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                                            )}
                                                            <span className={req.met ? 'text-green-600 dark:text-green-400 font-medium' : 'text-muted-foreground'}>
                                                                {req.text}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Confirm Password Field */}
                                    <div className="space-y-3">
                                        <Label htmlFor="password_confirmation" className="text-sm font-semibold text-card-foreground">{t('ui.confirm_new_password')}</Label>
                                        <div className="relative">
                                            <Input
                                                id="password_confirmation"
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                value={data.password_confirmation}
                                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                                placeholder={t('ui.confirm_your_new_password')}
                                                required
                                                className="h-14 text-base rounded-xl border-2"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeOff className="h-5 w-5 text-muted-foreground" />
                                                ) : (
                                                    <Eye className="h-5 w-5 text-muted-foreground" />
                                                )}
                                            </Button>
                                        </div>
                                        {errors.password_confirmation && <p className="text-sm text-destructive font-medium">{errors.password_confirmation}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end pt-8">
                            <Button 
                                type="submit" 
                                disabled={processing || passwordStrength < 3} 
                                className="h-14 px-8 text-base rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                <Lock className="h-5 w-5 mr-2" />
                                {processing ? t('ui.changing_password') : t('ui.change_password')}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    ) : (
        // Admin/Staff/Logistic/Member Design - Matching Profile Page Pattern
        <div className="space-y-2">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-green-500/10">
                            <Lock className="h-5 w-5 text-green-600" />
                        </div>
                        {t('ui.security_settings')}
                    </CardTitle>
                    <CardDescription>
                        {t('ui.update_password_secure')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Current Password Section */}
                            <div className="space-y-3">
                                <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                                    <div className="p-1.5 rounded-md bg-secondary/10">
                                        <Lock className="h-4 w-4 text-secondary" />
                                    </div>
                                    {t('ui.current_password')}
                                </h3>
                                <div className="space-y-3">
                                    <div className="p-4 bg-muted/50 rounded-lg border border-border">
                                        <div className="space-y-2">
                                            <Label htmlFor="current_password_admin" className="text-sm font-medium">{t('ui.current_password')}</Label>
                                            <div className="relative">
                                                <Input
                                                    id="current_password_admin"
                                                    type={showCurrentPassword ? 'text' : 'password'}
                                                    value={data.current_password}
                                                    onChange={(e) => setData('current_password', e.target.value)}
                                                    placeholder={t('ui.enter_current_password')}
                                                    required
                                                    className="pr-10"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                >
                                                    {showCurrentPassword ? (
                                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                                    ) : (
                                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                </Button>
                                            </div>
                                            {errors.current_password && <p className="text-sm text-destructive">{errors.current_password}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* New Password Section */}
                            <div className="space-y-3">
                                <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                                    <div className="p-1.5 rounded-md bg-primary/10">
                                        <Lock className="h-4 w-4 text-primary" />
                                    </div>
                                    {t('ui.new_password')}
                                </h3>
                                <div className="space-y-3">
                                    {/* New Password Field */}
                                    <div className="p-4 bg-muted/50 rounded-lg border border-border">
                                        <div className="space-y-2">
                                            <Label htmlFor="password_admin" className="text-sm font-medium">{t('ui.new_password')}</Label>
                                            <div className="relative">
                                                <Input
                                                    id="password_admin"
                                                    type={showNewPassword ? 'text' : 'password'}
                                                    value={data.password}
                                                    onChange={(e) => setData('password', e.target.value)}
                                                    placeholder={t('ui.enter_new_password')}
                                                    required
                                                    className="pr-10"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                >
                                                    {showNewPassword ? (
                                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                                    ) : (
                                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                </Button>
                                            </div>
                                            {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                                        </div>
                                    </div>

                                    {/* Confirm Password Field */}
                                    <div className="p-4 bg-muted/50 rounded-lg border border-border">
                                        <div className="space-y-2">
                                            <Label htmlFor="password_confirmation_admin" className="text-sm font-medium">{t('ui.confirm_new_password')}</Label>
                                            <div className="relative">
                                                <Input
                                                    id="password_confirmation_admin"
                                                    type={showConfirmPassword ? 'text' : 'password'}
                                                    value={data.password_confirmation}
                                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                                    placeholder={t('ui.confirm_your_new_password')}
                                                    required
                                                    className="pr-10"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                >
                                                    {showConfirmPassword ? (
                                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                                    ) : (
                                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                </Button>
                                            </div>
                                            {errors.password_confirmation && <p className="text-sm text-destructive">{errors.password_confirmation}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Password Strength Indicator */}
                        {data.password && (
                            <div className="p-4 bg-muted/50 rounded-lg border border-border space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm font-medium">{t('ui.password_strength')}</Label>
                                    <span className={`text-sm font-medium ${
                                        passwordStrength <= 2 ? 'text-destructive' : 
                                        passwordStrength <= 3 ? 'text-yellow-500' : 'text-green-500'
                                    }`}>
                                        {getStrengthText(passwordStrength)}
                                    </span>
                                </div>
                                <Progress 
                                    value={strengthPercentage} 
                                    className={`h-2 ${
                                        passwordStrength <= 2 ? '[&>div]:bg-red-500' : 
                                        passwordStrength <= 3 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-green-500'
                                    }`}
                                />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {requirements.map((req, index) => (
                                        <div key={index} className="flex items-center gap-2 text-xs">
                                            {req.met ? (
                                                <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                                            ) : (
                                                <XCircle className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                            )}
                                            <span className={req.met ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
                                                {req.text}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex justify-end pt-4">
                            <Button 
                                type="submit" 
                                disabled={processing || passwordStrength < 3}
                                className="flex items-center gap-2"
                            >
                                <Lock className="h-4 w-4" />
                                {processing ? t('ui.changing_password') : t('ui.change_password')}
                            </Button>
                        </div>
                    </form>
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
                    <div className="bg-background">
                        <div className="w-full flex flex-col gap-2 px-2 py-2 sm:px-4 sm:py-4 lg:px-8 pb-8">
                            {/* Page Header */}
                            <div className="bg-gradient-to-br from-card to-[color-mix(in_srgb,var(--card)_95%,var(--primary)_5%)] border border-border rounded-[0.8rem] p-3 sm:p-5 mb-2 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)]">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 sm:h-10 sm:w-10 text-primary bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] p-2 sm:p-2.5 rounded-lg flex items-center justify-center">
                                        <Lock className="h-4 w-4 sm:h-6 sm:w-6" />
                                    </div>
                                    <div>
                                        <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight m-0">
                                            {t('ui.change_password')}
                                        </h1>
                                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 mb-0 leading-snug">
                                            {t('ui.update_password_secure')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            {pageContent}
                        </div>
                    </div>
                </AppSidebarLayout>
            );
        case 'customer':
            return (
                <AppHeaderLayout>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16 sm:mt-20">
                        <div className="mb-8">
                            <div className="flex items-start gap-3 sm:gap-4 mb-4">
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                                        {t('ui.change_password')}
                                    </h1>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        {t('ui.update_password_secure')}
                                    </p>
                                </div>
                                <Link href="/customer/home">
                                    <Button variant="outline" size="icon" className="sm:w-auto sm:px-4 shrink-0">
                                        <ArrowLeft className="h-4 w-4 sm:mr-2" />
                                        <span className="hidden sm:inline">{t('ui.back')}</span>
                                    </Button>
                                </Link>
                            </div>
                        </div>
                        {pageContent}
                    </div>
                </AppHeaderLayout>
            );
        case 'logistic':
            return (
                <LogisticLayout>
                    <div className="min-h-screen bg-background">
                        <div className="w-full flex flex-col gap-2 px-2 pt-22 py-2 lg:px-8 lg:pt-25 pb-8">
                            {/* Page Header */}
                            <div className="bg-gradient-to-br from-card to-[color-mix(in_srgb,var(--card)_95%,var(--primary)_5%)] border border-border rounded-[0.8rem] p-3 sm:p-5 mb-2 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)]">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="h-8 w-8 sm:h-10 sm:w-10 text-primary bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] p-2 sm:p-2.5 rounded-lg flex items-center justify-center shrink-0">
                                        <Lock className="h-4 w-4 sm:h-6 sm:w-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight m-0">
                                            {t('ui.change_password')}
                                        </h1>
                                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 mb-0 leading-snug">
                                            {t('ui.update_password_secure')}
                                        </p>
                                    </div>
                                    <Link href="/logistic/dashboard">
                                        <Button variant="outline" size="icon" className="sm:w-auto sm:px-4 shrink-0">
                                            <ArrowLeft className="h-4 w-4 sm:mr-2" />
                                            <span className="hidden sm:inline">{t('logistic.back_to_dashboard')}</span>
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                            {pageContent}
                        </div>
                    </div>
                </LogisticLayout>
            );
        case 'member':
            return (
                <MemberLayout>
                    <div className="min-h-screen bg-background">
                        <div className="w-full flex flex-col gap-2 px-2 pt-15 py-2 lg:px-8 lg:pt-17 pb-8">
                            {/* Page Header */}
                            <div className="bg-gradient-to-br from-card to-[color-mix(in_srgb,var(--card)_95%,var(--primary)_5%)] border border-border rounded-[0.8rem] p-3 sm:p-5 mb-2 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)]">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="h-8 w-8 sm:h-10 sm:w-10 text-primary bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] p-2 sm:p-2.5 rounded-lg flex items-center justify-center shrink-0">
                                        <Lock className="h-4 w-4 sm:h-6 sm:w-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight m-0">
                                            {t('ui.change_password')}
                                        </h1>
                                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 mb-0 leading-snug">
                                            {t('ui.update_password_secure')}
                                        </p>
                                    </div>
                                    <Link href="/member/dashboard">
                                        <Button variant="outline" size="icon" className="sm:w-auto sm:px-4 shrink-0">
                                            <ArrowLeft className="h-4 w-4 sm:mr-2" />
                                            <span className="hidden sm:inline">{t('member.back_to_dashboard')}</span>
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                            {pageContent}
                        </div>
                    </div>
                </MemberLayout>
            );
        default:
            return (
                <AppHeaderLayout>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16 sm:mt-20">
                        <div className="mb-8">
                            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                                {t('ui.change_password')}
                            </h1>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {t('ui.update_password_secure')}
                            </p>
                        </div>
                        {pageContent}
                    </div>
                </AppHeaderLayout>
            );
    }
}
