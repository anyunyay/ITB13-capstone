import { useAppearance } from '@/hooks/use-appearance';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
    const { appearance, updateAppearance } = useAppearance();

    const cycleTheme = () => {
        const themes = ['light', 'dark', 'system'] as const;
        const currentIndex = themes.indexOf(appearance);
        const nextIndex = (currentIndex + 1) % themes.length;
        updateAppearance(themes[nextIndex]);
    };

    const getIcon = () => {
        switch (appearance) {
            case 'light':
                return <Sun className="h-4 w-4" />;
            case 'dark':
                return <Moon className="h-4 w-4" />;
            case 'system':
                return <Monitor className="h-4 w-4" />;
            default:
                return <Monitor className="h-4 w-4" />;
        }
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={cycleTheme}
            className={cn("h-9 w-9 p-0", className)}
            title={`Current theme: ${appearance}`}
        >
            {getIcon()}
        </Button>
    );
}
