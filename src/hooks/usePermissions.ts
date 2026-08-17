'use client';

import { useSession } from 'next-auth/react';

export function usePermissions() {
  const { data: session } = useSession();

  const hasPermission = (module: string, action: string): boolean => {
    if (!session?.user) return false;

    // ADM Master tem todas as permissões
    if (session.user.role === 'ADM Master') return true;

    const permissions = session.user.permissions || [];
    return permissions.includes(`${module}:${action}`);
  };

  const hasAnyPermission = (permissions: Array<{ module: string; action: string }>): boolean => {
    return permissions.some(({ module, action }) => hasPermission(module, action));
  };

  const hasAllPermissions = (permissions: Array<{ module: string; action: string }>): boolean => {
    return permissions.every(({ module, action }) => hasPermission(module, action));
  };

  const getModuleAccess = (module: string): {
    canView: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canApprove: boolean;
    canExport: boolean;
  } => {
    return {
      canView: hasPermission(module, 'view'),
      canCreate: hasPermission(module, 'create'),
      canEdit: hasPermission(module, 'edit'),
      canDelete: hasPermission(module, 'delete'),
      canApprove: hasPermission(module, 'approve'),
      canExport: hasPermission(module, 'export'),
    };
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getModuleAccess,
    isMaster: session?.user?.role === 'ADM Master',
    userRole: session?.user?.role || null,
  };
}
