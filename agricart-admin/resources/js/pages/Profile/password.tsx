import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useForm, usePage } from '@inertiajs/react';
import { Lock, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import ProfileWrapper from './profile-wrapper';
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

    const getStrengthColor = (score: number) => {
        if (score <= 2) return 'bg-red-500';
        if (score <= 3) return 'bg-yellow-500';
        return 'bg-green-500';
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

    return (
        <ProfileWrapper 
            title={t('ui.change_password')}
        >
            <div className="space-y-6">
                <Card className="bg-card/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/20 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 group">
                    <CardHeader className="bg-gradient-to-r from-muted/80 to-muted/60 backdrop-blur-sm border-b border-border/50">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6">
                            <div className="flex items-center space-x-6">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <Lock className="h-6 w-6 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <h1 className="text-2xl font-bold text-card-foreground">
                                        {t('ui.security_settings')}
                                    </h1>
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                                            <Lock className="h-3 w-3 mr-1" />
                                            {t('ui.password_protection')}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {t('ui.update_password_secure')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="px-6 py-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Current Password Section */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-semibold text-card-foreground flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-secondary/10">
                                        <Lock className="h-5 w-5 text-secondary" />
                                    </div>
                                    {t('ui.current_password')}
                                </h3>
                                <div className="space-y-4">
                                    <div className="p-5 bg-muted/80 rounded-xl border border-border/50 hover:bg-muted/60 transition-colors duration-200">
                                        <div className="space-y-3">
                                            <Label htmlFor="current_password" className="text-sm font-medium text-card-foreground">{t('ui.current_password')}</Label>
                                            <div className="relative">
                                                <Input
                                                    id="current_password"
                                                    type={showCurrentPassword ? 'text' : 'password'}
                                                    value={data.current_password}
                                                    onChange={(e) => setData('current_password', e.target.value)}
                                                    placeholder={t('ui.enter_current_password')}
                                                    required
                                                    className="border-2 border-border/50 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300 rounded-xl bg-card/50 backdrop-blur-sm text-sm py-3"
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
                                            {errors.current_password && <p className="text-sm text-destructive font-medium">{errors.current_password}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* New Password Section */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-semibold text-card-foreground flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-primary/10">
                                        <Lock className="h-5 w-5 text-primary" />
                                    </div>
                                    {t('ui.new_password')}
                                </h3>
                                <div className="space-y-4">
                                    {/* New Password Field */}
                                    <div className="p-5 bg-muted/80 rounded-xl border border-border/50 hover:bg-muted/60 transition-colors duration-200">
                                        <div className="space-y-3">
                                            <Label htmlFor="password" className="text-sm font-medium text-card-foreground">{t('ui.new_password')}</Label>
                                            <div className="relative">
                                                <Input
                                                    id="password"
                                                    type={showNewPassword ? 'text' : 'password'}
                                                    value={data.password}
                                                    onChange={(e) => setData('password', e.target.value)}
                                                    placeholder={t('ui.enter_new_password')}
                                                    required
                                                    className="border-2 border-border/50 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300 rounded-xl bg-card/50 backdrop-blur-sm text-sm py-3"
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
                                            {errors.password && <p className="text-sm text-destructive font-medium">{errors.password}</p>}
                                        </div>
                                    </div>

                                    {/* Password Strength Indicator */}
                                    {data.password && (
                                        <div className="p-5 bg-muted/80 rounded-xl border border-border/50">
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-sm font-medium text-card-foreground">{t('ui.password_strength')}</Label>
                                                    <span className={`text-sm font-medium ${
                                                        passwordStrength <= 2 ? 'text-destructive' : 
                                                        passwordStrength <= 3 ? 'text-yellow-500 dark:text-yellow-400' : 'text-green-500 dark:text-green-400'
                                                    }`}>
                                                        {getStrengthText(passwordStrength)}
                                                    </span>
                                                </div>
                                                <Progress 
                                                    value={strengthPercentage} 
                                                    className={`h-3 rounded-full ${
                                                        passwordStrength <= 2 ? '[&>div]:bg-red-500' : 
                                                        passwordStrength <= 3 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-green-500'
                                                    }`}
                                                />
                                                <div className="space-y-2">
                                                    {requirements.map((req, index) => (
                                                        <div key={index} className="flex items-center gap-3 text-sm">
                                                            {req.met ? (
                                                                <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 flex-shrink-0" />
                                                            ) : (
                                                                <XCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                            )}
                                                            <span className={req.met ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
                                                                {req.text}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Confirm Password Field */}
                                    <div className="p-5 bg-muted/80 rounded-xl border border-border/50 hover:bg-muted/60 transition-colors duration-200">
                                        <div className="space-y-3">
                                            <Label htmlFor="password_confirmation" className="text-sm font-medium text-card-foreground">{t('ui.confirm_new_password')}</Label>
                                            <div className="relative">
                                                <Input
                                                    id="password_confirmation"
                                                    type={showConfirmPassword ? 'text' : 'password'}
                                                    value={data.password_confirmation}
                                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                                    placeholder={t('ui.confirm_your_new_password')}
                                                    required
                                                    className="border-2 border-border/50 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300 rounded-xl bg-card/50 backdrop-blur-sm text-sm py-3"
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
                                            {errors.password_confirmation && <p className="text-sm text-destructive font-medium">{errors.password_confirmation}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end pt-6 border-t border-border/50">
                            <Button 
                                type="submit" 
                                disabled={processing || passwordStrength < 3} 
                                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                <Lock className="h-4 w-4" />
                                {processing ? t('ui.changing_password') : t('ui.change_password')}
                            </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </ProfileWrapper>
    );
}
