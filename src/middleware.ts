import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. Permitir a página de login
  if (pathname === '/login') {
    return NextResponse.next();
  }

  // 2. Verificar cookie de sessão
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
  // O SEGREDO ESTÁ AQUI: '?!api/auth' impede que o middleware rode nas rotas de autenticação
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp)$).*)'],
};
