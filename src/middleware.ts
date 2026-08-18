import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 🔥 LOG PARA DEPURAÇÃO
  console.log('[middleware] Path:', pathname);

  // Rotas públicas
  const publicPaths = ['/login', '/api/auth', '/_next', '/favicon.ico', '/assinatura'];

  const isPublicPath = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(path)
  );

  if (isPublicPath) {
    console.log('[middleware] Rota pública, liberando');
    return NextResponse.next();
  }

  try {
    const token = await getToken({ req: request });
    console.log('[middleware] Token existe?', !!token);

    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  } catch (error) {
    console.error('[middleware] Erro:', error);
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|logo.svg|media).*)',
  ],
};
