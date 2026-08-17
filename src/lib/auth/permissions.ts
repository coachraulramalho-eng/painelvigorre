import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export interface Permission {
  module: string;
  action: string;
  scope: string;
}

export async function hasPermission(
  req: NextRequest,
  module: string,
  action: string
): Promise<boolean> {
  const token = await getToken({ req });

  if (!token) {
    return false;
  }

  // ADM Master tem todas as permissões
  if (token.role === 'ADM Master') {
    return true;
  }

  const permissions = token.permissions as string[] || [];
  return permissions.includes(`${module}:${action}`);
}

export async function requirePermission(
  req: NextRequest,
  module: string,
  action: string
): Promise<NextResponse | null> {
  const hasAccess = await hasPermission(req, module, action);

  if (!hasAccess) {
    return new NextResponse(
      JSON.stringify({ error: 'Acesso negado' }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  return null;
}

export function getModuleFromPath(pathname: string): string {
  const modules = {
    '/comercial': 'commercial',
    '/financeiro': 'financial',
    '/marketing': 'marketing',
    '/administrativo': 'admin',
    '/seguranca': 'security',
    '/configuracoes': 'settings',
  };

  for (const [path, module] of Object.entries(modules)) {
    if (pathname.startsWith(path)) {
      return module;
    }
  }

  return 'dashboard';
}

export function getActionFromPath(pathname: string): string {
  if (pathname.includes('/novo') || pathname.includes('/criar')) {
    return 'create';
  }
  if (pathname.includes('/editar')) {
    return 'edit';
  }
  if (pathname.includes('/deletar')) {
    return 'delete';
  }
  if (pathname.includes('/aprovar')) {
    return 'approve';
  }
  if (pathname.includes('/exportar')) {
    return 'export';
  }
  return 'view';
}
