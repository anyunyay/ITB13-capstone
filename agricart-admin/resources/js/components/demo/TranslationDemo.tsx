import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SmartButton } from '@/components/ui/smart-button';
import { SmartLabel } from '@/components/ui/smart-label';
import { useTranslation } from '@/hooks/useTranslation';
import { Badge } from '@/components/ui/badge';
import { Languages } from 'lucide-react';

/**
 * Demo component showing different translation approaches
 * This demonstrates how the translation system works without breaking existing designs
 */
export function TranslationDemo() {
    const { t, auto, locale, isEnglish, isTagalog } = useTranslation();

    return (
        <div className="space-y-6 p-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Languages className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <CardTitle className="text-blue-600 dark:text-blue-400">
                                Translation System Demo
                            </CardTitle>
                            <CardDescription>
                                Current Language: <Badge variant="outline">{isEnglish ? 'English' : 'Tagalog'}</Badge>
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Auto-translation Demo */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold">1. Auto-Translation (Zero Code Changes)</h3>
                        <p className="text-sm text-muted-foreground">
                            Common text is automatically translated without changing existing code:
                        </p>
                        <div className="flex gap-2 flex-wrap">
                            <Button variant="outline">{auto('Save')}</Button>
                            <Button variant="outline">{auto('Cancel')}</Button>
                            <Button variant="outline">{auto('Delete')}</Button>
                            <Button variant="outline">{auto('Edit')}</Button>
                            <Button variant="outline">{auto('Add')}</Button>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            <Badge>{auto('Active')}</Badge>
                            <Badge variant="secondary">{auto('Pending')}</Badge>
                            <Badge variant="destructive">{auto('Cancelled')}</Badge>
                            <Badge variant="outline">{auto('Completed')}</Badge>
                        </div>
                    </div>

                    {/* Smart Components Demo */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold">2. Smart Components (Drop-in Replacements)</h3>
                        <p className="text-sm text-muted-foreground">
                            Enhanced components that automatically translate their content:
                        </p>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <SmartLabel>Name</SmartLabel>
                                <span className="text-sm text-muted-foreground">← SmartLabel component</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <SmartLabel>Email</SmartLabel>
                                <span className="text-sm text-muted-foreground">← Automatically translated</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <SmartLabel>Phone</SmartLabel>
                                <span className="text-sm text-muted-foreground">← No code changes needed</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <SmartButton>Submit</SmartButton>
                            <SmartButton variant="outline">Reset</SmartButton>
                            <SmartButton variant="secondary">Export</SmartButton>
                        </div>
                    </div>

                    {/* Manual Translation Demo */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold">3. Manual Translation (Explicit Control)</h3>
                        <p className="text-sm text-muted-foreground">
                            Explicit translation calls for custom content:
                        </p>
                        <div className="space-y-2">
                            <p><strong>Navigation:</strong> {t('nav.dashboard', 'Dashboard')} | {t('nav.orders', 'Orders')} | {t('nav.sales', 'Sales')}</p>
                            <p><strong>Common:</strong> {t('common.loading', 'Loading...')} | {t('common.success', 'Success!')} | {t('common.error', 'Error!')}</p>
                            <p><strong>Auth:</strong> {t('auth.login', 'Login')} | {t('auth.register', 'Register')} | {t('auth.forgot_password', 'Forgot Password')}</p>
                        </div>
                    </div>

                    {/* Status Demo */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold">4. Status Translations</h3>
                        <p className="text-sm text-muted-foreground">
                            Status indicators automatically adapt to the selected language:
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {['Active', 'Inactive', 'Pending', 'Approved', 'Rejected', 'Completed', 'Processing', 'Delivered'].map(status => (
                                <div key={status} className="text-center p-2 border rounded">
                                    <Badge variant="outline">{auto(status)}</Badge>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Implementation Info */}
                    <div className="space-y-3 p-4 bg-muted rounded-lg">
                        <h3 className="text-lg font-semibold">Implementation Details</h3>
                        <div className="text-sm space-y-1">
                            <p><strong>Current Locale:</strong> {locale}</p>
                            <p><strong>Translation Method:</strong> {isEnglish ? 'No translation needed' : 'Auto-translation active'}</p>
                            <p><strong>Fallback:</strong> Always falls back to original English text</p>
                            <p><strong>Performance:</strong> Translations are cached and memoized</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}