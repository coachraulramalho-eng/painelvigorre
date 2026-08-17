import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getModuleFromPath, getActionFromPath, hasPermission } from '@/lib/auth/permissions';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Rotas públicas
  const publicPaths = ['/login', '/api/auth', '/_next', '/favicon.ico'];
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request });

  // Redirecionar para login se não autenticado
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verificar permissões para rotas do dashboard
  const module = getModuleFromPath(pathname);
  const action = getActionFromPath(pathname);

  // ADM Master tem acesso total
  if (token.role !== 'ADM Master') {
    const hasAccess = await hasPermission(request, module, action);
    if (!hasAccess) {
      return new NextResponse(
        JSON.stringify({ error: 'Acesso negado. Você não tem permissão para acessar este módulo.' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }

  // Registrar acesso (audit log)
  // TODO: Implementar registro de auditoria

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|logo.svg).*)',
  ],
};
