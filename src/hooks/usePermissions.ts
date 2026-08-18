'use client';

import { useSession } from 'next-auth/react';

export function usePermissions() {
  const { data: session } = useSession();
  
  // Correção de Tipo Segura para o TypeScript do Vercel
  const user = session?.user as { role?: string; permissions?: string[] } | undefined;

  const hasPermission = (module: string, action: string): boolean => {
    if (!user) return false;

    // ADM Master tem todas as permissões
    if (user.role === 'ADM Master') return true;

    const permissions = user.permissions || [];
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
    isMaster: user?.role === 'ADM Master',
    userRole: user?.role || null,
  };
}
