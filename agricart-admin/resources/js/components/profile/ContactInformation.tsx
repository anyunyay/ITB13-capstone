import { Card, CardContent } from '@/components/ui/card';
import { Mail, Phone } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { getDisplayEmail } from '@/lib/utils';

interface ContactInformationProps {
    user: {
        email: string;
        contact_number?: string;
        type: string;
    };
    maskPhone?: (phone: string) => string;
}

export function ContactInformation({ user, maskPhone }: ContactInformationProps) {
    const t = useTranslation();
    
    const isAdminOrStaff = user?.type === 'admin' || user?.type === 'staff';
    const displayPhone = maskPhone && !isAdminOrStaff 
        ? maskPhone(user?.contact_number || '') 
        : (user?.contact_number || '');
    const displayEmail = getDisplayEmail(user?.email || '', user?.type);

    return (
        <div className="space-y-4 sm:space-y-6">
            <h3 className="text-lg sm:text-xl font-semibold text-card-foreground flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary/10">
                    <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
                </div>
                {t('ui.contact_information')}
            </h3>
            <div className="space-y-4">
                {user?.type !== 'member' && (
                    <div className="p-5 bg-muted/80 rounded-xl border border-border/50 hover:bg-muted/60 transition-colors duration-200">
                        <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-muted">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-muted-foreground mb-1">{t('ui.email')} {t('ui.address')}</p>
                                <p className="font-medium text-card-foreground text-lg">{displayEmail}</p>
                            </div>
                        </div>
                    </div>
                )}
                <div className="p-5 bg-muted/80 rounded-xl border border-border/50 hover:bg-muted/60 transition-colors duration-200">
                    <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-muted">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-muted-foreground mb-1">{t('ui.phone')} Number</p>
                            <p className="font-medium text-card-foreground text-lg">{displayPhone || t('ui.not_provided')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
