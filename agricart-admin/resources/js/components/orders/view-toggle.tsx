import { Button } from '@/components/ui/button';
import { LayoutGrid, Table } from 'lucide-react';

interface ViewToggleProps {
    currentView: 'cards' | 'table';
    onViewChange: (view: 'cards' | 'table') => void;
}

export const ViewToggle = ({ currentView, onViewChange }: ViewToggleProps) => {
    return (
        <div className="flex gap-1 bg-muted p-1 rounded-lg border border-border">
            <Button
                variant={currentView === 'cards' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onViewChange('cards')}
                className="transition-all text-sm px-3 py-2 hover:-translate-y-0.5 hover:shadow-sm"
            >
                <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
                variant={currentView === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onViewChange('table')}
                className="transition-all text-sm px-3 py-2 hover:-translate-y-0.5 hover:shadow-sm"
            >
                <Table className="h-4 w-4" />
            </Button>
        </div>
    );
};
