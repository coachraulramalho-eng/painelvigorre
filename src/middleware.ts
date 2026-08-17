import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Rotas públicas
  const publicPaths = [
    '/login',
    '/api/auth',
    '/_next',
    '/favicon.ico',
    '/api/qrcode',
    '/api/signature',
    '/assinatura',
  ];

  // Verificar se é rota pública
  const isPublicPath = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(path)
  );

  // Permitir acesso público a rotas de assinatura
  if (pathname.startsWith('/assinatura/')) {
    return NextResponse.next();
  }

  if (isPublicPath) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request });

  // Redirecionar para login se não autenticado
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Rotas que requerem permissões específicas
  const protectedRoutes = {
    '/financeiro': { module: 'financial', action: 'view' },
    '/comercial': { module: 'commercial', action: 'view' },
    '/marketing': { module: 'marketing', action: 'view' },
    '/administrativo': { module: 'admin', action: 'view' },
    '/seguranca': { module: 'security', action: 'view' },
    '/configuracoes': { module: 'settings', action: 'view' },
    '/media': { module: 'media', action: 'view' },
    '/documentos': { module: 'signature', action: 'view' },
    '/qrcode': { module: 'media', action: 'view' },
  };

  // Verificar permissão para rotas protegidas
  for (const [route, permission] of Object.entries(protectedRoutes)) {
    if (pathname.startsWith(route)) {
      const userPermissions = token.permissions as string[] || [];

      // ADM Master tem acesso total
      if (token.role === 'ADM Master') {
        return NextResponse.next();
      }

      const hasPermission = userPermissions.includes(
        `${permission.module}:${permission.action}`
      );

      if (!hasPermission) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|logo.svg|media).*)',
  ],
};
