import { usePermissions } from '@/hooks/use-permissions';
import { type ReactNode } from 'react';

interface PermissionGateProps {
  children: ReactNode;
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  fallback?: ReactNode;
}

export function PermissionGate({ 
  children, 
  permission, 
  permissions = [], 
  requireAll = false,
  fallback = null 
}: PermissionGateProps) {
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
    return <>{fallback}</>;
  }

  return <>{children}</>;
} 