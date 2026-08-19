import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/auth';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 🔥 ROTAS PÚBLICAS - NUNCA BLOQUEAR
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

  // 🔥 USAR auth() EM VEZ DE getToken() - MAIS CONFIÁVEL
  try {
    const session = await auth();
    console.log('[middleware] Session existe?', !!session);
    console.log('[middleware] Usuário:', session?.user?.email || 'none');

    if (!session) {
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
    '/((?!api/auth|api/debug|api/diagnostic|api/health|_next/static|_next/image|favicon.ico|logo.svg|media|assinatura).*)',
  ],
};
