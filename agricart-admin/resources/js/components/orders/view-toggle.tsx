import { Button } from '@/components/ui/button';
import { Grid3X3, Table } from 'lucide-react';
import styles from '../../pages/Admin/Orders/orders.module.css';

interface ViewToggleProps {
    currentView: 'cards' | 'table';
    onViewChange: (view: 'cards' | 'table') => void;
}

export const ViewToggle = ({ currentView, onViewChange }: ViewToggleProps) => {
    return (
        <div className={styles.viewToggle}>
            <Button
                variant={currentView === 'cards' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onViewChange('cards')}
                className={styles.viewToggleButton}
            >
                <Grid3X3 className="h-4 w-4 mr-2" />
                Cards
            </Button>
            <Button
                variant={currentView === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onViewChange('table')}
                className={styles.viewToggleButton}
            >
                <Table className="h-4 w-4 mr-2" />
                Table
            </Button>
        </div>
    );
};
