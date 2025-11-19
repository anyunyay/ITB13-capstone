import { cn } from '@/lib/utils';

interface AppLogoProps {
    isScrolled?: boolean;
}

export default function AppLogo({ isScrolled = false }: AppLogoProps) {
    return (
        <>
            <div className="flex aspect-square size-12 items-center justify-center">
                <img 
                    src="/storage/logo/SMMC Logo-1.webp" 
                    alt="SMMC Logo" 
                    className="size-9 object-contain"
                    onError={(e) => {
                        e.currentTarget.src = '/storage/logo/SMMC Logo-1.png';
                    }}
                />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className={cn(
                    "mb-0.5 truncate leading-tight font-semibold transition-colors duration-300",
                    isScrolled ? "text-white" : "text-green-600"
                )}>SMMC</span>
            </div>
        </>
    );
}
