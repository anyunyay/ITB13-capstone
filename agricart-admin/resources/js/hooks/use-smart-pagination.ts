import { useMemo } from 'react';

interface SmartPaginationOptions<T> {
  initialData: T[];
  targetVisibleCount: number; // e.g., 8 visible cards
  filterFn: (item: T) => boolean; // Filter function to determine visible items
  fetchMoreUrl: string; // URL to fetch more data
  currentPage: number;
  hasMore: boolean;
}

interface SmartPaginationResult<T> {
  visibleItems: T[];
  isLoading: boolean;
  currentPage: number;
  hasMore: boolean;
  loadMore: () => void;
}

/**
 * Smart pagination hook that ensures exactly N visible items per page
 * by filtering and slicing data appropriately
 */
export function useSmartPagination<T>({
  initialData,
  targetVisibleCount,
  filterFn,
  fetchMoreUrl,
  currentPage,
  hasMore,
}: SmartPaginationOptions<T>): SmartPaginationResult<T> {
  
  // Filter visible items
  const visibleItems = useMemo(() => {
    return initialData.filter(filterFn);
  }, [initialData, filterFn]);

  // Slice to exact target count
  const displayItems = useMemo(() => {
    return visibleItems.slice(0, targetVisibleCount);
  }, [visibleItems, targetVisibleCount]);

  // Simple load more - just a placeholder for now
  const loadMore = () => {
    // This will be handled by parent component reloading with new page
    console.log('Load more requested');
  };

  return {
    visibleItems: displayItems,
    isLoading: false,
    currentPage,
    hasMore: hasMore || visibleItems.length > targetVisibleCount,
    loadMore,
  };
}
