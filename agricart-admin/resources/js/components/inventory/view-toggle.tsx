import { Button } from '@/components/ui/button';
import { LayoutGrid, Table } from 'lucide-react';

interface ViewToggleProps {
    currentView: 'cards' | 'table';
    onViewChange: (view: 'cards' | 'table') => void;
}

export const ViewToggle = ({ currentView, onViewChange }: ViewToggleProps) => {
    return (
        <div className="flex gap-1 bg-muted p-0.5 sm:p-1 rounded-lg border border-border shrink-0">
            <Button
                variant={currentView === 'cards' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onViewChange('cards')}
                className="transition-all text-sm px-2 sm:px-3 py-1.5 sm:py-2 hover:-translate-y-0.5 hover:shadow-sm"
                aria-label="Card view"
            >
                <LayoutGrid className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
            <Button
                variant={currentView === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onViewChange('table')}
                className="transition-all text-sm px-2 sm:px-3 py-1.5 sm:py-2 hover:-translate-y-0.5 hover:shadow-sm"
                aria-label="Table view"
            >
                <Table className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
        </div>
    );
};
