import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { SmartButton } from '@/components/ui/smart-button';
import { SmartLabel } from '@/components/ui/smart-label';
import { useTranslation } from '@/hooks/useTranslation';
import { safeAuto, safeCommon } from '@/utils/safeTranslation';

/**
 * Example showing safe translation usage that won't break existing components
 */
export function SafeTranslationExample() {
    const { t, auto, common, nav, auth } = useTranslation();

    return (
        <div className="space-y-6 p-6">
            <h1 className="text-2xl font-bold">Safe Translation Examples</h1>
            
            {/* Method 1: Existing components with auto-translation */}
            <div className="space-y-2">
                <h2 className="text-lg font-semibold">1. Existing Components + Auto Translation</h2>
                <div className="flex gap-2">
                    <Button>{auto('Save')}</Button>
                    <Button variant="outline">{auto('Cancel')}</Button>
                    <Button variant="destructive">{auto('Delete')}</Button>
                </div>
                <div className="flex gap-2">
                    <Badge>{auto('Active')}</Badge>
                    <Badge variant="secondary">{auto('Pending')}</Badge>
                    <Badge variant="destructive">{auto('Cancelled')}</Badge>
                </div>
            </div>

            {/* Method 2: Smart components (drop-in replacements) */}
            <div className="space-y-2">
                <h2 className="text-lg font-semibold">2. Smart Components (Drop-in Replacements)</h2>
                <div className="space-y-2">
                    <SmartLabel>Name</SmartLabel>
                    <SmartLabel>Email</SmartLabel>
                    <SmartLabel>Phone</SmartLabel>
                </div>
                <div className="flex gap-2">
                    <SmartButton>Submit</SmartButton>
                    <SmartButton variant="outline">Reset</SmartButton>
                    <SmartButton variant="secondary">Export</SmartButton>
                </div>
            </div>

            {/* Method 3: Manual translation with shortcuts */}
            <div className="space-y-2">
                <h2 className="text-lg font-semibold">3. Manual Translation with Shortcuts</h2>
                <div className="flex gap-2">
                    <Button>{common.save()}</Button>
                    <Button>{common.cancel()}</Button>
                    <Button>{common.delete()}</Button>
                </div>
                <div className="space-y-1">
                    <p><strong>Navigation:</strong> {nav.dashboard()} | {nav.orders()} | {nav.sales()}</p>
                    <p><strong>Auth:</strong> {auth.login()} | {auth.register()} | {auth.forgotPassword()}</p>
                </div>
            </div>

            {/* Method 4: Explicit translation keys */}
            <div className="space-y-2">
                <h2 className="text-lg font-semibold">4. Explicit Translation Keys</h2>
                <div className="space-y-1">
                    <p>{t('common.loading', 'Loading...')}</p>
                    <p>{t('common.success', 'Success!')}</p>
                    <p>{t('common.error', 'Error!')}</p>
                    <p>{t('common.no_data', 'No data available')}</p>
                </div>
            </div>

            {/* Method 5: Safe functions (can be used outside React) */}
            <div className="space-y-2">
                <h2 className="text-lg font-semibold">5. Safe Functions (Non-Hook)</h2>
                <div className="flex gap-2">
                    <Button>{safeCommon.save()}</Button>
                    <Button>{safeCommon.cancel()}</Button>
                    <Button>{safeAuto('Loading...')}</Button>
                </div>
            </div>

            {/* Status examples */}
            <div className="space-y-2">
                <h2 className="text-lg font-semibold">6. Status Translations</h2>
                <div className="grid grid-cols-4 gap-2">
                    {['Active', 'Inactive', 'Pending', 'Approved', 'Rejected', 'Completed', 'Processing', 'Delivered'].map(status => (
                        <Badge key={status} variant="outline">
                            {auto(status)}
                        </Badge>
                    ))}
                </div>
            </div>
        </div>
    );
}

/**
 * Example of a form with translations
 */
export function TranslatedFormExample() {
    const { auto, common } = useTranslation();

    return (
        <form className="space-y-4 p-6 border rounded-lg">
            <h2 className="text-lg font-semibold">{auto('User Information')}</h2>
            
            <div className="space-y-2">
                <SmartLabel htmlFor="name">Name</SmartLabel>
                <input 
                    id="name" 
                    type="text" 
                    placeholder={auto('Enter your name')}
                    className="w-full p-2 border rounded"
                />
            </div>
            
            <div className="space-y-2">
                <SmartLabel htmlFor="email">Email</SmartLabel>
                <input 
                    id="email" 
                    type="email" 
                    placeholder={auto('Enter your email')}
                    className="w-full p-2 border rounded"
                />
            </div>
            
            <div className="space-y-2">
                <SmartLabel htmlFor="phone">Phone</SmartLabel>
                <input 
                    id="phone" 
                    type="tel" 
                    placeholder={auto('Enter your phone number')}
                    className="w-full p-2 border rounded"
                />
            </div>
            
            <div className="flex gap-2">
                <SmartButton type="submit">Submit</SmartButton>
                <SmartButton type="button" variant="outline">Cancel</SmartButton>
                <SmartButton type="reset" variant="secondary">Reset</SmartButton>
            </div>
        </form>
    );
}