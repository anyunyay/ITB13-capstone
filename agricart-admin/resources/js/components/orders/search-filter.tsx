import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import styles from '../../pages/Admin/Orders/orders-animations.module.css';
import { useTranslation } from '@/hooks/use-translation';

interface SearchFilterProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    selectedStatus: string;
    setSelectedStatus: (status: string) => void;
    selectedDeliveryStatus: string;
    setSelectedDeliveryStatus: (status: string) => void;
    totalResults: number;
    filteredResults: number;
    isVisible?: boolean;
}

export const SearchFilter = ({
    searchTerm,
    setSearchTerm,
    selectedStatus,
    setSelectedStatus,
    selectedDeliveryStatus,
    setSelectedDeliveryStatus,
    totalResults,
    filteredResults,
    isVisible = true
}: SearchFilterProps) => {
    const t = useTranslation();

    return (
        <div className={`bg-card rounded-xl shadow-sm ${styles.searchToggleContainer} ${
            isVisible ? styles.expanded : styles.collapsed
        }`}>
            <div className="flex flex-col gap-3 mb-3 md:flex-row md:items-center">
                <div className="relative flex-1 flex items-center">
                    <Search className="absolute left-3 text-muted-foreground w-4 h-4 z-10" />
                    <Input
                        type="text"
                        placeholder="Search orders by customer name, email, or order ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-9 py-2 border border-border rounded-lg bg-background text-foreground text-sm transition-all duration-200 focus:outline-none focus:border-primary focus:shadow-[0_0_0_2px_color-mix(in_srgb,var(--primary)_20%,transparent)]"
                    />
                    {searchTerm && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSearchTerm('')}
                            className="absolute right-2 p-1 min-w-auto h-6 w-6 rounded-full bg-muted text-muted-foreground border-none hover:bg-destructive hover:text-destructive-foreground"
                        >
                            ×
                        </Button>
                    )}
                </div>
                <div className="flex gap-3 flex-shrink-0">
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger className="min-w-[140px] bg-background border border-border rounded-lg py-2 px-3 text-foreground text-sm transition-all duration-200 h-9 focus:outline-none focus:border-primary focus:shadow-[0_0_0_2px_color-mix(in_srgb,var(--primary)_20%,transparent)]">
                            <SelectValue placeholder="Order Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Order Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="delayed">Delayed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                    
                    <Select value={selectedDeliveryStatus} onValueChange={setSelectedDeliveryStatus}>
                        <SelectTrigger className="min-w-[160px] bg-background border border-border rounded-lg py-2 px-3 text-foreground text-sm transition-all duration-200 h-9 focus:outline-none focus:border-primary focus:shadow-[0_0_0_2px_color-mix(in_srgb,var(--primary)_20%,transparent)]">
                            <SelectValue placeholder="Delivery Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Delivery Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-border">
                <span className="text-sm text-muted-foreground font-medium">
                    {filteredResults} {t('admin.of')} {totalResults} {t('admin.orders') || 'orders'}
                </span>
            </div>
        </div>
    );
};
