import { usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';

export function usePermissions() {
  const { props } = usePage<SharedData>();
  const permissions = props.permissions || {};

  const can = (permission: string): boolean => {
    // Convert permission name to camelCase to match the middleware format
    const key = lcfirst(str_replace(' ', '', ucwords(permission)));
    return permissions[key] || false;
  };

  const canAny = (permissionsList: string[]): boolean => {
    return permissionsList.some(permission => can(permission));
  };

  const canAll = (permissionsList: string[]): boolean => {
    return permissionsList.every(permission => can(permission));
  };

  // Helper function to convert string to camelCase
  const lcfirst = (str: string): string => {
    return str.charAt(0).toLowerCase() + str.slice(1);
  };

  // Helper function to convert string to title case
  const ucwords = (str: string): string => {
    return str.replace(/\b\w/g, l => l.toUpperCase());
  };

  // Helper function to replace spaces
  const str_replace = (search: string, replace: string, subject: string): string => {
    return subject.split(search).join(replace);
  };

  return {
    can,
    canAny,
    canAll,
    permissions
  };
} 