import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Rotas públicas (incluindo a nova rota de diagnóstico)
  const publicPaths = [
    '/login', 
    '/api/auth', 
    '/api/debug',  // 🔥 Adicione esta linha
    '/_next', 
    '/favicon.ico', 
    '/assinatura'
  ];

  const isPublicPath = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(path)
  );

  if (isPublicPath) {
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
    '/((?!api/auth|api/debug|_next/static|_next/image|favicon.ico|logo.svg|media).*)',
  ],
};
