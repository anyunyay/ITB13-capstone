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

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearch(query);
    }, 300); // Debounce search by 300ms

    return () => clearTimeout(timeoutId);
  }, [query, onSearch]);

  const handleClear = () => {
    setQuery('');
    onSearch('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <div className={cn("w-full max-w-5xl mx-auto", className)}>
      <form onSubmit={handleSubmit} className="relative">
        <div className={cn(
          "relative flex items-center transition-all duration-500 ease-out",
          "bg-gradient-to-r from-white to-green-50 dark:from-gray-800 dark:to-gray-900",
          "rounded-xl shadow-2xl border-2 backdrop-blur-md",
          "hover:shadow-green-200 dark:hover:shadow-green-900",
          isFocused 
            ? "border-green-500 shadow-green-300 dark:shadow-green-800 shadow-2xl scale-[1.02]" 
            : "border-green-200 dark:border-green-800 hover:border-green-400 dark:hover:border-green-600"
        )}>
          {/* Search Icon with Animation */}
          <div className="absolute left-5 z-10">
            <div className={cn(
              "transition-all duration-300",
              isFocused ? "scale-110" : "scale-100"
            )}>
              <Search className={cn(
                "h-6 w-6 transition-all duration-300",
                isFocused ? "text-green-600" : "text-green-500"
              )} />
            </div>
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
              "w-full h-16 pl-14 pr-16 text-lg border-0 bg-transparent",
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
                "absolute right-3 h-8 w-8 rounded-full",
                "hover:bg-green-100 dark:hover:bg-green-800",
                "transition-all duration-300 hover:scale-110",
                "border border-green-200 dark:border-green-700"
              )}
            >
              <X className="h-5 w-5 text-green-600 dark:text-green-400" />
            </Button>
          )}

          {/* Sparkle Icon for Empty State */}
          {!query && (
            <div className="absolute right-5">
              <Sparkles className="h-6 w-6 text-green-400 animate-pulse" />
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
