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
        // Customer Design - Clean & Modern matching address page style
        <div className="space-y-4 sm:space-y-6">
            <div className="bg-card rounded-lg sm:rounded-xl shadow-lg border-2 border-green-200 dark:border-green-700 overflow-hidden">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b-2 border-green-200 dark:border-green-700 p-4 sm:p-5 md:p-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="p-2 sm:p-2.5 rounded-lg bg-green-100 dark:bg-green-900/30 shadow-sm flex-shrink-0">
                            <Lock className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="space-y-1 sm:space-y-2 min-w-0">
                            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-green-700 dark:text-green-300 break-words">
                                {t('ui.security_settings')}
                            </h3>
                            <p className="text-xs sm:text-sm text-green-600 dark:text-green-400">
                                {t('ui.update_password_secure')}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="p-4 sm:p-5 md:p-6">
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                            {/* Current Password Section */}
                            <div className="space-y-3 sm:space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-md bg-green-100 dark:bg-green-900/30 flex-shrink-0">
                                        <Lock className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    </div>
                                    <h4 className="text-base sm:text-lg font-bold text-green-700 dark:text-green-300">{t('ui.current_password')}</h4>
                                </div>
                                <div className="p-3 sm:p-4 bg-muted/50 rounded-lg border border-border">
                                    <div className="space-y-2 sm:space-y-3">
                                        <Label htmlFor="current_password" className="text-xs sm:text-sm font-medium text-muted-foreground">{t('ui.current_password')}</Label>
                                        <div className="relative">
                                            <Input
                                                id="current_password"
                                                type={showCurrentPassword ? 'text' : 'password'}
                                                value={data.current_password}
                                                onChange={(e) => setData('current_password', e.target.value)}
                                                placeholder={t('ui.enter_current_password')}
                                                required
                                                className="h-12 sm:h-14 text-sm sm:text-base rounded-lg pr-10"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            >
                                                {showCurrentPassword ? (
                                                    <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                                                ) : (
                                                    <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                                                )}
                                            </Button>
                                        </div>
                                        {errors.current_password && <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 font-medium">{errors.current_password}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* New Password Section */}
                            <div className="space-y-3 sm:space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-md bg-green-100 dark:bg-green-900/30 flex-shrink-0">
                                        <Lock className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    </div>
                                    <h4 className="text-base sm:text-lg font-bold text-green-700 dark:text-green-300">{t('ui.new_password')}</h4>
                                </div>
                                <div className="space-y-3 sm:space-y-4">
                                    {/* New Password Field */}
                                    <div className="p-3 sm:p-4 bg-muted/50 rounded-lg border border-border">
                                        <div className="space-y-2 sm:space-y-3">
                                            <Label htmlFor="password" className="text-xs sm:text-sm font-medium text-muted-foreground">{t('ui.new_password')}</Label>
                                            <div className="relative">
                                                <Input
                                                    id="password"
                                                    type={showNewPassword ? 'text' : 'password'}
                                                    value={data.password}
                                                    onChange={(e) => setData('password', e.target.value)}
                                                    placeholder={t('ui.enter_new_password')}
                                                    required
                                                    className="h-12 sm:h-14 text-sm sm:text-base rounded-lg pr-10"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                >
                                                    {showNewPassword ? (
                                                        <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                                                    ) : (
                                                        <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                                                    )}
                                                </Button>
                                            </div>
                                            {errors.password && <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 font-medium">{errors.password}</p>}
                                        </div>
                                    </div>

                                    {/* Confirm Password Field */}
                                    <div className="p-3 sm:p-4 bg-muted/50 rounded-lg border border-border">
                                        <div className="space-y-2 sm:space-y-3">
                                            <Label htmlFor="password_confirmation" className="text-xs sm:text-sm font-medium text-muted-foreground">{t('ui.confirm_new_password')}</Label>
                                            <div className="relative">
                                                <Input
                                                    id="password_confirmation"
                                                    type={showConfirmPassword ? 'text' : 'password'}
                                                    value={data.password_confirmation}
                                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                                    placeholder={t('ui.confirm_your_new_password')}
                                                    required
                                                    className="h-12 sm:h-14 text-sm sm:text-base rounded-lg pr-10"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                >
                                                    {showConfirmPassword ? (
                                                        <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                                                    ) : (
                                                        <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                                                    )}
                                                </Button>
                                            </div>
                                            {errors.password_confirmation && <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 font-medium">{errors.password_confirmation}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Password Strength Indicator */}
                        {data.password && (
                            <div className="p-4 sm:p-5 md:p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800/30">
                                <div className="space-y-3 sm:space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm sm:text-base font-semibold text-green-700 dark:text-green-300">{t('ui.password_strength')}</Label>
                                        <span className={`text-xs sm:text-sm font-bold ${
                                            passwordStrength <= 2 ? 'text-red-600 dark:text-red-400' : 
                                            passwordStrength <= 3 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'
                                        }`}>
                                            {getStrengthText(passwordStrength)}
                                        </span>
                                    </div>
                                    <Progress 
                                        value={strengthPercentage} 
                                        className={`h-3 sm:h-4 rounded-full ${
                                            passwordStrength <= 2 ? '[&>div]:bg-red-500' : 
                                            passwordStrength <= 3 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-green-500'
                                        }`}
                                    />
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                        {requirements.map((req, index) => (
                                            <div key={index} className="flex items-center gap-2 text-xs sm:text-sm">
                                                {req.met ? (
                                                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                                                ) : (
                                                    <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                                                )}
                                                <span className={req.met ? 'text-green-700 dark:text-green-300 font-medium' : 'text-muted-foreground'}>
                                                    {req.text}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2 sm:pt-4">
                            <Button 
                                type="submit" 
                                disabled={processing || passwordStrength < 3} 
                                className="flex items-center justify-center gap-2 px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-semibold bg-green-600 hover:bg-green-700 text-white transition-all duration-300 rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                            >
                                <Lock className="h-4 w-4 sm:h-5 sm:w-5" />
                                {processing ? t('ui.changing_password') : t('ui.change_password')}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
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
                    <div className="min-h-[90vh] py-4 sm:py-6 lg:py-8 mt-16 sm:mt-18 lg:mt-20">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="mb-6 sm:mb-8">
                                <div className="flex items-start justify-between gap-3 sm:gap-4 mb-3 sm:mb-0">
                                    <div className="flex-1 min-w-0 order-1">
                                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-green-600 dark:text-green-400 mb-2">
                                            {t('ui.change_password')}
                                        </h1>
                                        <p className="text-base md:text-xl lg:text-2xl text-green-600 dark:text-green-400">
                                            {t('ui.update_password_secure')}
                                        </p>
                                    </div>
                                    <Link href="/" className="order-2 shrink-0">
                                        <Button 
                                            variant="outline" 
                                            size="icon"
                                            className="sm:w-auto sm:px-6 sm:py-3 border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white transition-all duration-300 rounded-lg shadow-md hover:shadow-lg"
                                        >
                                            <ArrowLeft className="h-4 w-4 sm:mr-2" />
                                            <span className="hidden sm:inline text-sm sm:text-base font-semibold">{t('ui.back')}</span>
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                            {pageContent}
                        </div>
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
