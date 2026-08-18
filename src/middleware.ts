import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Nunca bloquear rotas de autenticação
  if (
    pathname.startsWith('/api/auth') || 
    pathname.startsWith('/_next') || 
    pathname === '/favicon.ico' ||
    pathname.match(/\.(png|svg|jpg|jpeg|gif|webp|ico)$/)
  ) {
    return NextResponse.next();
  }

  // Rotas públicas
  if (pathname === '/login' || pathname.startsWith('/assinatura')) {
    return NextResponse.next();
  }

  // Verificar cookie de sessão
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
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
};
