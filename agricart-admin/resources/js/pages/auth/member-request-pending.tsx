import { Head, useForm, router } from '@inertiajs/react';
import { LoaderCircle, Clock, X, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';

import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/layouts/auth-layout';

interface MemberRequestPendingProps {
    request: {
        id: number;
        status: string;
        requested_at: string;
        member: {
            id: number;
            name: string;
            member_id: string;
        };
    };
}

export default function MemberRequestPending({ request }: MemberRequestPendingProps) {
    const { post, processing } = useForm();
    const [requestStatus, setRequestStatus] = useState(request.status);
    const [isPolling, setIsPolling] = useState(true);
    const [lastChecked, setLastChecked] = useState(new Date());

    // Poll for status updates every 5 seconds
    useEffect(() => {
        if (!isPolling || requestStatus !== 'pending') return;

        const interval = setInterval(async () => {
            try {
                const response = await fetch(route('member.password.status', request.id));
                const data = await response.json();
                
                setRequestStatus(data.status);
                setLastChecked(new Date());
                
                // If approved, redirect to password change page
                if (data.status === 'approved') {
                    setIsPolling(false);
                    router.visit(route('member.password.change', request.id));
                }
                
                // If rejected or not found, stop polling
                if (data.status === 'rejected' || data.status === 'not_found') {
                    setIsPolling(false);
                }
            } catch (error) {
                console.error('Error checking request status:', error);
            }
        }, 5000); // Check every 5 seconds

        return () => clearInterval(interval);
    }, [request.id, requestStatus, isPolling]);

    const handleCancelRequest: FormEventHandler = (e) => {
        e.preventDefault();
        
        if (confirm('Are you sure you want to cancel your password change request? You will need to submit a new request if you want to change your password later.')) {
            setIsPolling(false); // Stop polling when cancelling
            post(route('member.password.cancel', request.id));
        }
    };

    return (
        <AuthLayout 
            title="Password Change Request Pending" 
            description="Your password change request is being reviewed by an administrator"
        >
            <Head title="Request Pending" />

            <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
                    <Clock className="h-8 w-8 text-yellow-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Request Pending</h2>
                <p className="text-sm text-gray-600">Your password change request is under review</p>
            </div>

            <div className={`border rounded-lg p-6 mb-6 ${
                requestStatus === 'pending' 
                    ? 'bg-yellow-50 border-yellow-200' 
                    : requestStatus === 'approved'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
            }`}>
                <div className="flex items-start space-x-3">
                    {requestStatus === 'pending' && <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />}
                    {requestStatus === 'approved' && <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />}
                    {requestStatus === 'rejected' && <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />}
                    <div className="flex-1">
                        <h3 className={`text-sm font-medium ${
                            requestStatus === 'pending' 
                                ? 'text-yellow-800' 
                                : requestStatus === 'approved'
                                ? 'text-green-800'
                                : 'text-red-800'
                        }`}>
                            {requestStatus === 'pending' && 'Request Submitted'}
                            {requestStatus === 'approved' && 'Request Approved!'}
                            {requestStatus === 'rejected' && 'Request Rejected'}
                        </h3>
                        <div className={`mt-2 text-sm ${
                            requestStatus === 'pending' 
                                ? 'text-yellow-700' 
                                : requestStatus === 'approved'
                                ? 'text-green-700'
                                : 'text-red-700'
                        }`}>
                            <p><strong>Member:</strong> {request.member.name}</p>
                            <p><strong>Member ID:</strong> {request.member.member_id}</p>
                            <p><strong>Requested:</strong> {new Date(request.requested_at).toLocaleString()}</p>
                            <p><strong>Status:</strong> 
                                <span className="font-medium ml-1">
                                    {requestStatus === 'pending' && 'Pending Admin Approval'}
                                    {requestStatus === 'approved' && 'Approved - Redirecting...'}
                                    {requestStatus === 'rejected' && 'Rejected by Admin'}
                                </span>
                            </p>
                            {isPolling && requestStatus === 'pending' && (
                                <p className="text-xs mt-2 opacity-75">
                                    Last checked: {lastChecked.toLocaleTimeString()}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="text-sm text-blue-800">
                    <p className="font-medium mb-2">What happens next?</p>
                    {requestStatus === 'pending' && (
                        <ul className="space-y-1 text-sm">
                            <li>• An administrator will review your request</li>
                            <li>• You'll be automatically redirected when approved</li>
                            <li>• After approval, you can set your new password</li>
                            <li>• Requests are typically processed within 24 hours</li>
                            <li>• This page will automatically refresh every 5 seconds</li>
                        </ul>
                    )}
                    {requestStatus === 'approved' && (
                        <ul className="space-y-1 text-sm">
                            <li>• Your request has been approved!</li>
                            <li>• You'll be redirected to the password change page</li>
                            <li>• Enter your new password and confirm it</li>
                            <li>• You can then login with your new password</li>
                        </ul>
                    )}
                    {requestStatus === 'rejected' && (
                        <ul className="space-y-1 text-sm">
                            <li>• Your request has been rejected by an administrator</li>
                            <li>• You can submit a new request if needed</li>
                            <li>• Contact your administrator for more information</li>
                            <li>• You can cancel this request and try again</li>
                        </ul>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                {requestStatus === 'pending' && (
                    <form onSubmit={handleCancelRequest}>
                        <Button 
                            type="submit" 
                            variant="destructive" 
                            className="w-full" 
                            disabled={processing}
                        >
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                            <X className="h-4 w-4 mr-2" />
                            Cancel Request
                        </Button>
                    </form>
                )}

                {requestStatus === 'rejected' && (
                    <div className="text-center">
                        <TextLink href={route('member.password.request')} className="text-sm">
                            Submit New Request
                        </TextLink>
                    </div>
                )}

                <div className="text-center">
                    <TextLink href={route('member.login')} className="text-sm">
                        <ArrowLeft className="h-4 w-4 inline mr-1" />
                        Back to Member Login
                    </TextLink>
                </div>
            </div>

            <div className="mt-6 text-center text-xs text-gray-500">
                <p>Need help? Contact your administrator for assistance.</p>
            </div>
        </AuthLayout>
    );
}
