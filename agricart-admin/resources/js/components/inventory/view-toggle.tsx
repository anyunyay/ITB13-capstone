import { Button } from '@/components/ui/button';
import { Grid3X3, Table } from 'lucide-react';

interface ViewToggleProps {
    currentView: 'cards' | 'table';
    onViewChange: (view: 'cards' | 'table') => void;
}

export const ViewToggle = ({ currentView, onViewChange }: ViewToggleProps) => {
    return (
        <div className="flex gap-2">
            <Button
                variant={currentView === 'cards' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onViewChange('cards')}
                className="flex items-center gap-2"
            >
                <Grid3X3 className="h-4 w-4" />
                Cards
            </Button>
            <Button
                variant={currentView === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onViewChange('table')}
                className="flex items-center gap-2"
            >
                <Table className="h-4 w-4" />
                Table
            </Button>
        </div>
    );
};
