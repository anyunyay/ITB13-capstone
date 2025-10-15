import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import styles from '../../pages/Admin/Orders/orders.module.css';

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
        <div className={styles.searchFilterSection}>
            <div className={styles.searchControls}>
                <div className={styles.searchInputContainer}>
                    <Search className={styles.searchIcon} />
                    <Input
                        type="text"
                        placeholder="Search orders by customer name, email, or order ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className={styles.clearButton}
                            type="button"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
                
                <div className={styles.filterControls}>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger className={styles.filterSelect}>
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
                        <SelectTrigger className={styles.filterSelect}>
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
            
            <div className={styles.resultsInfo}>
                <span className={styles.resultsCount}>
                    {filteredResults === totalResults 
                        ? `${totalResults} orders found`
                        : `${filteredResults} of ${totalResults} orders`
                    }
                </span>
                {hasActiveFilters && (
                    <button
                        onClick={clearSearch}
                        className={styles.clearSearch}
                        type="button"
                    >
                        Clear all filters
                    </button>
                )}
            </div>
        </div>
    );
};
