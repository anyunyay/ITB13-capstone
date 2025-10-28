import { useState, useCallback, useRef } from 'react';
import { useToast } from './useToast';
import { useSort, SortState } from './use-sort';

export interface SortError {
    message: string;
    code?: string;
    retryable?: boolean;
}

export interface SortOptions {
    maxRetries?: number;
    retryDelay?: number;
    onError?: (error: SortError) => void;
    onSuccess?: () => void;
    debounceMs?: number;
}

export interface UseSortWithErrorHandlingReturn {
    sortState: SortState;
    loading: boolean;
    error: SortError | null;
    handleSort: (column: string) => Promise<void>;
    getSortDirection: (column: string) => 'asc' | 'desc' | null;
    resetSort: () => void;
    retry: () => Promise<void>;
    clearError: () => void;
}

export function useSortWithErrorHandling(
    onSortRequest: (column: string, direction: 'asc' | 'desc' | null) => Promise<void>,
    options: SortOptions = {}
): UseSortWithErrorHandlingReturn {
    const {
        maxRetries = 3,
        retryDelay = 1000,
        onError,
        onSuccess,
        debounceMs = 300
    } = options;

    const { sortState, handleSort: handleSortLocal, getSortDirection, resetSort } = useSort();
    const { showError, showSuccess } = useToast();
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<SortError | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const lastSortRef = useRef<{ column: string; direction: 'asc' | 'desc' | null } | null>(null);

    const clearError = useCallback(() => {
        setError(null);
        setRetryCount(0);
    }, []);

    const executeSort = useCallback(async (column: string, direction: 'asc' | 'desc' | null, isRetry = false) => {
        try {
            setLoading(true);
            setError(null);
            
            await onSortRequest(column, direction);
            
            if (isRetry) {
                showSuccess('Sort operation completed successfully');
            }
            
            onSuccess?.();
            setRetryCount(0);
        } catch (err: any) {
            const sortError: SortError = {
                message: err.message || 'Failed to sort data',
                code: err.code || 'SORT_ERROR',
                retryable: err.retryable !== false // Default to retryable unless explicitly set to false
            };

            setError(sortError);
            onError?.(sortError);

            if (sortError.retryable && retryCount < maxRetries) {
                showError(
                    `Sort failed. Retrying... (${retryCount + 1}/${maxRetries})`,
                    'Sort Error'
                );
                
                setTimeout(() => {
                    setRetryCount(prev => prev + 1);
                    executeSort(column, direction, true);
                }, retryDelay * Math.pow(2, retryCount)); // Exponential backoff
            } else {
                showError(
                    sortError.retryable 
                        ? `Sort failed after ${maxRetries} attempts. Please try again.`
                        : sortError.message,
                    'Sort Error'
                );
            }
        } finally {
            setLoading(false);
        }
    }, [onSortRequest, retryCount, maxRetries, retryDelay, showError, showSuccess, onError, onSuccess]);

    const handleSort = useCallback(async (column: string) => {
        // Clear any existing debounce
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        // Calculate the new direction before updating state
        const currentDirection = getSortDirection(column);
        let newDirection: 'asc' | 'desc' | null;
        
        if (currentDirection === 'asc') {
            newDirection = 'desc';
        } else if (currentDirection === 'desc') {
            newDirection = null;
        } else {
            newDirection = 'asc';
        }

        // Update local sort state immediately for UI responsiveness
        handleSortLocal(column);
        
        // Store the sort request for potential retry
        lastSortRef.current = { column, direction: newDirection };

        // Debounce the actual API call
        debounceRef.current = setTimeout(() => {
            executeSort(column, newDirection);
        }, debounceMs);
    }, [handleSortLocal, getSortDirection, executeSort, debounceMs]);

    const retry = useCallback(async () => {
        if (lastSortRef.current && error?.retryable) {
            const { column, direction } = lastSortRef.current;
            setRetryCount(0);
            await executeSort(column, direction, true);
        }
    }, [error, executeSort]);

    return {
        sortState,
        loading,
        error,
        handleSort,
        getSortDirection,
        resetSort,
        retry,
        clearError
    };
}