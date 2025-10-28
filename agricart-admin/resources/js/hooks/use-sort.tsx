import { useState, useCallback } from 'react';

export interface SortState {
    column: string | null;
    direction: 'asc' | 'desc' | null;
}

export interface UseSortReturn {
    sortState: SortState;
    handleSort: (column: string) => void;
    getSortDirection: (column: string) => 'asc' | 'desc' | null;
    resetSort: () => void;
}

export function useSort(initialSort?: SortState): UseSortReturn {
    const [sortState, setSortState] = useState<SortState>(
        initialSort || { column: null, direction: null }
    );

    const handleSort = useCallback((column: string) => {
        setSortState(prevState => {
            // If clicking on the same column, cycle through: asc -> desc -> null
            if (prevState.column === column) {
                if (prevState.direction === 'asc') {
                    return { column, direction: 'desc' };
                } else if (prevState.direction === 'desc') {
                    return { column: null, direction: null };
                }
            }
            
            // If clicking on a different column or no current sort, start with asc
            return { column, direction: 'asc' };
        });
    }, []);

    const getSortDirection = useCallback((column: string): 'asc' | 'desc' | null => {
        return sortState.column === column ? sortState.direction : null;
    }, [sortState]);

    const resetSort = useCallback(() => {
        setSortState({ column: null, direction: null });
    }, []);

    return {
        sortState,
        handleSort,
        getSortDirection,
        resetSort,
    };
}