import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 🔥 ROTAS PÚBLICAS
  const publicPaths = [
    '/login',
    '/api/auth',
    '/api/debug',
    '/api/diagnostic',
    '/api/health',
    '/_next',
    '/favicon.ico',
    '/logo.svg',
    '/media',
    '/assinatura',
  ];

  const isPublicPath = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(path)
  );

  if (isPublicPath) {
    return NextResponse.next();
  }

  // 🔥 VERIFICAR COOKIE DIRETAMENTE - SEM IMPORTAR auth()
  const sessionCookie = 
    request.cookies.get('authjs.session-token')?.value || 
    request.cookies.get('__Secure-authjs.session-token')?.value;

  if (!sessionCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api/auth|api/debug|api/diagnostic|api/health|_next/static|_next/image|favicon.ico|logo.svg|media|assinatura).*)',
  ],
};
