import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage, useForm, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { BellDot, RotateCcw, CheckCircle } from 'lucide-react';
import { PermissionGuard } from '@/components/permission-guard';
import { PermissionGate } from '@/components/permission-gate';
import { SafeImage } from '@/lib/image-utils';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useTranslation } from '@/hooks/use-translation';

interface Member {
    id: number;
    name: string;
    member_id?: string;
    contact_number?: string;
    registration_date?: string;
    document?: string;
    type: string;
    default_address?: {
        id: number;
        street: string;
        barangay: string;
        city: string;
        province: string;
        full_address: string;
    };
    [key: string]: unknown;
}

interface PageProps {
    flash: {
        message?: string
        error?: string
    }
    deactivatedMembers: Member[];
    [key: string]: unknown;
}

export default function Deactivated() {
    const t = useTranslation();
    const { deactivatedMembers, flash, auth } = usePage<PageProps & SharedData>().props;
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    
    // Check if the user is authenticated || Prevent flash-of-unauthenticated-content
    useEffect(() => {
        if (!auth?.user) {
            router.visit('/login');
        }
    }, [auth]);

    const { processing, post } = useForm();

    const handleReactivateClick = (member: Member) => {
        setSelectedMember(member);
        setShowConfirmationModal(true);
    };

    const handleConfirmReactivation = () => {
        if (selectedMember) {
            post(route('membership.reactivate', selectedMember.id));
            setShowConfirmationModal(false);
            setSelectedMember(null);
        }
    };

    const handleCancelReactivation = () => {
        setShowConfirmationModal(false);
        setSelectedMember(null);
    };

    return (
        <PermissionGuard 
            permissions={['view membership', 'edit members']}
            pageTitle={t('admin.access_denied')}
        >
            <AppLayout>
                <Head title={t('admin.deactivated_members')} />
                <div className="w-full flex flex-col gap-2 px-4 py-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold">{t('admin.deactivated_members_title')}</h1>
                    <div className="flex gap-2">
                        <Link href={route('membership.index')}><Button variant="outline">{t('admin.back_to_active_members')}</Button></Link>
                    </div>
                </div>

                <div>
                    <div>
                        {flash.message && (
                            <Alert>
                                <BellDot className='h-4 w-4 text-blue-500' />
                                <AlertTitle>{t('admin.notifications')}!</AlertTitle>
                                <AlertDescription>{flash.message}</AlertDescription>
                            </Alert>
                        )}
                        {flash.error && (
                            <Alert className="border-red-300">
                                <BellDot className='h-4 w-4 text-red-500' />
                                <AlertTitle>{t('admin.error_title')}</AlertTitle>
                                <AlertDescription>{flash.error}</AlertDescription>
                            </Alert>
                        )}
                    </div>
                </div>

            {deactivatedMembers.length > 0 && (
                <div className='w-full pt-8'>
                    <Table>
                        <TableCaption>{t('admin.total_list_deactivated_members')}</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-center">{t('admin.id')}</TableHead>
                                <TableHead className="text-center">{t('admin.member_id')}</TableHead>
                                <TableHead className="text-center">{t('admin.name')}</TableHead>
                                <TableHead className="text-center">{t('admin.contact_number')}</TableHead>
                                <TableHead className="text-center">{t('admin.address')}</TableHead>
                                <TableHead className="text-center">{t('admin.registration_date')}</TableHead>
                                <TableHead className="text-center">{t('admin.document')}</TableHead>
                                <TableHead className="text-center">{t('admin.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {deactivatedMembers.map((member, idx) => (
                                <TableRow className="text-center" key={member.id}>
                                    <TableCell>{idx + 1}</TableCell>
                                    <TableCell>{member.member_id || 'N/A'}</TableCell>
                                    <TableCell>{member.name}</TableCell>
                                    <TableCell>{member.contact_number}</TableCell>
                                    <TableCell>
                                        {member.default_address ? 
                                            `${member.default_address.street}, ${member.default_address.barangay}, ${member.default_address.city}, ${member.default_address.province}` 
                                            : 'N/A'
                                        }
                                    </TableCell>
                                    <TableCell>{member.registration_date}</TableCell>
                                    <TableCell className="flex justify-center">
                                        <SafeImage 
                                            src={member.document} 
                                            alt={`Document for ${member.name}`} 
                                            className="max-w-24 object-cover rounded"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <PermissionGate permission="edit members">
                                            <Button 
                                                disabled={processing} 
                                                onClick={() => handleReactivateClick(member)} 
                                                className='bg-green-600 hover:bg-green-700 text-white'
                                            >
                                                <RotateCcw className="h-4 w-4 mr-1" />
                                                {t('admin.reactivate')}
                                            </Button>
                                        </PermissionGate>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {deactivatedMembers.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">{t('admin.no_deactivated_members_found')}</p>
                </div>
            )}

            {/* Reactivation Confirmation Modal */}
            <Dialog open={showConfirmationModal} onOpenChange={setShowConfirmationModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            {t('admin.confirm_reactivation')}
                        </DialogTitle>
                        <DialogDescription>
                            {t('admin.confirm_reactivate_member')}
                        </DialogDescription>
                    </DialogHeader>
                    
                    {selectedMember && (
                        <div className="space-y-3">
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                <h4 className="font-medium text-green-800 mb-1">{t('admin.member_details')}:</h4>
                                <p className="text-green-700">{selectedMember.name}</p>
                                <p className="text-sm text-green-600">{t('admin.member_id')}: {selectedMember.member_id}</p>
                            </div>
                            
                            <div className="text-sm text-gray-600">
                                <p><strong>{t('admin.this_action_will')}:</strong></p>
                                <ul className="list-disc list-inside mt-1 space-y-1">
                                    <li>{t('admin.reactivate_member_account')}</li>
                                    <li>{t('admin.allow_system_access')}</li>
                                    <li>{t('admin.move_to_active_list')}</li>
                                </ul>
                            </div>
                        </div>
                    )}
                    
                    <DialogFooter>
                        <Button variant="outline" onClick={handleCancelReactivation}>
                            {t('ui.cancel')}
                        </Button>
                        <Button 
                            className="bg-green-600 hover:bg-green-700 text-white" 
                            onClick={handleConfirmReactivation}
                            disabled={processing}
                        >
                            {processing ? t('admin.reactivating') : t('admin.reactivate')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            </div>
        </AppLayout>
        </PermissionGuard>
    );
}