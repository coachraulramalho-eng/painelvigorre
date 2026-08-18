import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 🔥 ROTAS PÚBLICAS - NUNCA BLOQUEAR
  const publicPaths = [
    '/login',
    '/api/auth',        // 🔥 ESSENCIAL para o NextAuth
    '/api/debug',
    '/api/ping',
    '/api/hello',
    '/api/diagnostic',
    '/_next',
    '/favicon.ico',
    '/logo.svg',
    '/assinatura',
    '/media',
  ];

  // Verifica se a rota é pública
  const isPublic = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(path)
  );

  if (isPublic) {
    return NextResponse.next();
  }

  // Verificar autenticação
  const token = await getToken({ req: request });

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api/auth|api/debug|api/ping|api/hello|api/diagnostic|_next/static|_next/image|favicon.ico|logo.svg|media|assinatura).*)',
  ],
};
