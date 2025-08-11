import { usePermissions } from '@/hooks/use-permissions';
import { type ReactNode } from 'react';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Shield } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

interface PermissionGuardProps {
  children: ReactNode;
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  fallback?: ReactNode;
  pageTitle?: string;
}

export function PermissionGuard({ 
  children, 
  permission, 
  permissions = [], 
  requireAll = false,
  fallback = null,
  pageTitle = 'Access Denied'
}: PermissionGuardProps) {
  const { can, canAny, canAll } = usePermissions();

  let hasPermission = false;

  if (permission) {
    hasPermission = can(permission);
  } else if (permissions.length > 0) {
    hasPermission = requireAll ? canAll(permissions) : canAny(permissions);
  } else {
    // If no permission specified, show by default
    hasPermission = true;
  }

  if (!hasPermission) {
    if (fallback) {
      return <>{fallback}</>;
    }

    // Default access denied page
    return (
      <AppLayout>
        <Head title={pageTitle} />
        <div className="m-4">
          <Card className="max-w-md mx-auto mt-8">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-xl">Access Denied</CardTitle>
              <CardDescription>
                You don't have permission to access this page.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4 text-amber-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">Insufficient permissions</span>
              </div>
              <Button asChild>
                <a href="/admin/dashboard">Return to Dashboard</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return <>{children}</>;
} 