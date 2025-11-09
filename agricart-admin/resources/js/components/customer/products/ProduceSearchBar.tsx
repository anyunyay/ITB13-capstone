import { useState, useEffect, useRef } from 'react';
import { Search, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ProduceSearchBarProps {
  onSearch: (query: string) => void;
  className?: string;
}

export function ProduceSearchBar({ onSearch, className }: ProduceSearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const onSearchRef = useRef(onSearch);

  // Keep the ref updated with the latest onSearch callback
  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearchRef.current(query);
    }, 300); // Debounce search by 300ms

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleClear = () => {
    setQuery('');
    // Immediately trigger search with empty query
    onSearchRef.current('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Immediately trigger search on submit
    onSearchRef.current(query);
  };

  return (
    <div className={cn("w-full max-w-5xl mx-auto", className)}>
      <form onSubmit={handleSubmit} className="relative">
        <div 
          className={cn(
            "relative flex items-center transition-all duration-300 ease-out overflow-hidden",
            "bg-gradient-to-r from-white to-green-50 dark:from-gray-800 dark:to-gray-900",
            "rounded-xl shadow-lg border-2",
            "hover:shadow-green-200 dark:hover:shadow-green-900",
            isFocused 
              ? "border-green-500 shadow-green-300 dark:shadow-green-800 shadow-xl" 
              : "border-green-200 dark:border-green-800 hover:border-green-400 dark:hover:border-green-600"
          )}
          style={{
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
            willChange: 'transform'
          }}
        >
          {/* Search Icon with Animation */}
          <div className="absolute left-3 sm:left-4 lg:left-5 z-10 pointer-events-none">
            <Search className={cn(
              "h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 transition-colors duration-200",
              isFocused ? "text-green-600" : "text-green-500"
            )} />
          </div>

          {/* Input Field */}
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search for fruits, vegetables, or any fresh produce..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={cn(
              "w-full h-10 sm:h-12 lg:h-14 pl-10 sm:pl-12 lg:pl-14 pr-12 sm:pr-14 lg:pr-16 text-sm sm:text-base lg:text-lg border-0 bg-transparent",
              "placeholder:text-green-400 dark:placeholder:text-green-300 placeholder:font-medium",
              "focus:ring-0 focus:outline-none",
              "text-gray-900 dark:text-white font-medium",
              "transition-all duration-300"
            )}
          />

          {/* Clear Button */}
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClear}
              className={cn(
                "absolute right-2 sm:right-3 h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 rounded-full",
                "hover:bg-green-100 dark:hover:bg-green-800",
                "transition-colors duration-200",
                "border border-green-200 dark:border-green-700"
              )}
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-green-600 dark:text-green-400" />
            </Button>
          )}

          {/* Sparkle Icon for Empty State */}
          {!query && (
            <div className="absolute right-3 sm:right-4 lg:right-5 pointer-events-none">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-400 opacity-60" />
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
