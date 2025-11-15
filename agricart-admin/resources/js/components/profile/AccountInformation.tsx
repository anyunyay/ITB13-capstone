import { MapPin, Calendar, Shield } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

interface AccountInformationProps {
    user: {
        created_at?: string;
        address?: string;
        barangay?: string;
        city?: string;
        province?: string;
        default_address?: {
            id: number;
            street: string;
            barangay: string;
            city: string;
            province: string;
            is_active: boolean;
        };
    };
}

export function AccountInformation({ user }: AccountInformationProps) {
    const t = useTranslation();

    const formatDate = (dateString?: string) => {
        if (!dateString) return t('ui.not_available');
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getCurrentAddress = () => {
        if (user?.default_address) {
            const { street, barangay, city, province } = user.default_address;
            return `${street}, ${barangay}, ${city}, ${province}`;
        }
        
        if (user?.address || user?.barangay || user?.city || user?.province) {
            const parts = [user.address, user.barangay, user.city, user.province].filter(Boolean);
            return parts.join(', ');
        }
        
        return t('ui.no_address_provided');
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            <h3 className="text-lg sm:text-xl font-semibold text-card-foreground flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                    <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                {t('ui.account_information')}
            </h3>
            <div className="space-y-4">
                <div className="p-5 bg-muted/80 rounded-xl border border-border/50 hover:bg-muted/60 transition-colors duration-200">
                    <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-muted mt-0.5 flex-shrink-0">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-muted-foreground mb-2">{t('ui.current_address')}</p>
                            <p className="font-medium text-card-foreground leading-relaxed text-lg">
                                {getCurrentAddress()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-5 bg-muted/80 rounded-xl border border-border/50 hover:bg-muted/60 transition-colors duration-200">
                    <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-muted">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-muted-foreground mb-1">{t('ui.account_created')}</p>
                            <p className="font-medium text-card-foreground text-lg">{formatDate(user?.created_at)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
