import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Se o código chegou aqui, o 'matcher' abaixo já garantiu que NÃO é uma rota /api ou estática.
  // Só precisamos checar se é o login ou se tem cookie.
  
  const pathname = request.nextUrl.pathname;

  if (pathname === '/login' || pathname.startsWith('/assinatura')) {
    return NextResponse.next();
  }

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
  // O SEGREDO ESTÁ AQUI: O '?!api' impede que este middleware rode em QUALQUER coisa que comece com /api
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
};
