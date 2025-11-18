import { ReactNode, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { useSessionMonitor } from '@/hooks/useSessionMonitor';
import SessionEndedModal from './SessionEndedModal';

interface SessionMonitorWrapperProps {
    children: ReactNode;
}

export default function SessionMonitorWrapper({ children }: SessionMonitorWrapperProps) {
    const page = usePage();
    const auth = (page.props as any).auth;
    const isAuthenticated = !!auth?.user;

    const { sessionEnded, endReason } = useSessionMonitor(isAuthenticated);

    return (
        <>
            {children}
            <SessionEndedModal isOpen={sessionEnded} reason={endReason} />
        </>
    );
}

// Global session monitor component that can be added to any layout
export function GlobalSessionMonitor() {
    const page = usePage();
    const auth = (page.props as any).auth;
    const isAuthenticated = !!auth?.user;

    const { sessionEnded, endReason } = useSessionMonitor(isAuthenticated);

    return <SessionEndedModal isOpen={sessionEnded} reason={endReason} />;
}
