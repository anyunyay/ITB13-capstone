import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import { MapPin, Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { Logistic } from '@/types/logistics';
import { useEffect } from 'react';

interface AreaAssignmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    logistic: Logistic | null;
}

const CABUYAO_AREAS = [
    'Baclaran',
    'Banay-Banay',
    'Banlic',
    'Butong',
    'Bigaa',
    'Casile',
    'Gulod',
    'Mamatid',
    'Marinig',
    'Niugan',
    'Pittland',
    'Pulo',
    'Sala',
    'San Isidro',
    'Diezmo',
    'Barangay Uno (Poblacion)',
    'Barangay Dos (Poblacion)',
    'Barangay Tres (Poblacion)',
];

export function AreaAssignmentModal({ isOpen, onClose, logistic }: AreaAssignmentModalProps) {
    const t = useTranslation();
    const { data, setData, post, processing, reset } = useForm({
        assigned_area: logistic?.assigned_area || '',
    });

    useEffect(() => {
        if (logistic) {
            setData('assigned_area', logistic.assigned_area || '');
        }
    }, [logistic]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!logistic) return;

        post(route('logistics.assign-area', logistic.id), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    if (!logistic) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        Assign Area to {logistic.name}
                    </DialogTitle>
                    <DialogDescription>
                        Select a barangay area in Cabuyao to assign to this logistics personnel.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="assigned_area">
                                    Assigned Area <span className="text-destructive">*</span>
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Current: {logistic.assigned_area || 'Not assigned'}
                                </p>
                            </div>
                            <Select
                                value={data.assigned_area}
                                onValueChange={(value) => setData('assigned_area', value)}
                            >
                                <SelectTrigger id="assigned_area" className="w-full">
                                    <SelectValue placeholder="Select an area..." />
                                </SelectTrigger>
                                <SelectContent
                                    position="popper"
                                    side="bottom"
                                    align="start"
                                    sideOffset={4}
                                    avoidCollisions={false}
                                    className="max-h-[300px]"
                                >
                                    {CABUYAO_AREAS.map((area) => (
                                        <SelectItem key={area} value={area}>
                                            {area}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={processing}
                        >
                            {t('ui.cancel')}
                        </Button>
                        <Button type="submit" disabled={processing || !data.assigned_area}>
                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Assign Area
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
