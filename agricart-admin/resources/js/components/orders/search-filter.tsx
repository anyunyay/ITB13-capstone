import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X } from 'lucide-react';

interface SearchFilterProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    selectedStatus: string;
    setSelectedStatus: (status: string) => void;
    selectedDeliveryStatus: string;
    setSelectedDeliveryStatus: (status: string) => void;
    totalResults: number;
    filteredResults: number;
}

export const SearchFilter = ({
    searchTerm,
    setSearchTerm,
    selectedStatus,
    setSelectedStatus,
    selectedDeliveryStatus,
    setSelectedDeliveryStatus,
    totalResults,
    filteredResults
}: SearchFilterProps) => {
    const clearSearch = () => {
        setSearchTerm('');
        setSelectedStatus('all');
        setSelectedDeliveryStatus('all');
    };

    const hasActiveFilters = searchTerm || selectedStatus !== 'all' || selectedDeliveryStatus !== 'all';

    return (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex flex-col gap-4 mb-4 md:flex-row md:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                        type="text"
                        placeholder="Search orders by customer name, email, or order ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-10 w-full py-3 border-border rounded-lg bg-background text-foreground text-sm transition-all focus:border-primary focus:ring-4 focus:ring-primary/20"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-muted rounded"
                            type="button"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
                
                <div className="flex gap-3 flex-wrap">
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger className="min-w-[150px] bg-background border-border rounded-lg py-3 text-sm transition-all focus:border-primary focus:ring-4 focus:ring-primary/20">
                            <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="delayed">Delayed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                    
                    <Select value={selectedDeliveryStatus} onValueChange={setSelectedDeliveryStatus}>
                        <SelectTrigger className="min-w-[150px] bg-background border-border rounded-lg py-3 text-sm transition-all focus:border-primary focus:ring-4 focus:ring-primary/20">
                            <SelectValue placeholder="All Delivery Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Delivery Statuses</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-border">
                <span className="text-sm text-muted-foreground font-medium">
                    {filteredResults === totalResults 
                        ? `${totalResults} orders found`
                        : `${filteredResults} of ${totalResults} orders`
                    }
                </span>
                {hasActiveFilters && (
                    <button
                        onClick={clearSearch}
                        className="text-sm text-primary hover:text-primary/80 transition-colors"
                        type="button"
                    >
                        Clear all filters
                    </button>
                )}
            </div>
        </div>
    );
};
