import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/auth';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const publicPaths = [
    '/login',
    '/api/auth',
    '/_next',
    '/favicon.ico',
    '/api/qrcode',
    '/api/signature',
    '/assinatura',
  ];

  const isPublicPath = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(path)
  );

  if (pathname.startsWith('/assinatura/')) {
    return NextResponse.next();
  }

  if (isPublicPath) {
    return NextResponse.next();
  }

  const session = await auth();

  if (!session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const userPermissions = session.user?.permissions || [];
  const userRole = session.user?.role;

  if (userRole === 'ADM Master') {
    return NextResponse.next();
  }

  const protectedRoutes: Record<string, { module: string; action: string }> = {
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

  for (const [route, permission] of Object.entries(protectedRoutes)) {
    if (pathname.startsWith(route)) {
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
