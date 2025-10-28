import * as React from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SortIconProps {
    direction: 'asc' | 'desc' | null;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export function SortIcon({ direction, className, size = 'md' }: SortIconProps) {
    const sizeClasses = {
        sm: "h-3 w-3",
        md: "h-4 w-4", 
        lg: "h-5 w-5"
    };

    const baseClasses = cn(
        "transition-all duration-200 ease-in-out",
        sizeClasses[size],
        className
    );

    if (direction === 'asc') {
        return (
            <ChevronUp 
                className={cn(
                    baseClasses,
                    "text-primary animate-in slide-in-from-bottom-1 duration-200",
                    "transform scale-110"
                )} 
            />
        );
    }

    if (direction === 'desc') {
        return (
            <ChevronDown 
                className={cn(
                    baseClasses,
                    "text-primary animate-in slide-in-from-top-1 duration-200",
                    "transform scale-110"
                )} 
            />
        );
    }

    return (
        <ChevronsUpDown 
            className={cn(
                baseClasses,
                "opacity-50 group-hover:opacity-70 group-focus:opacity-70",
                "transform group-hover:scale-105 group-focus:scale-105"
            )} 
        />
    );
}