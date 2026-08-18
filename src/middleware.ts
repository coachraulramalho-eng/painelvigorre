import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. Rotas públicas que NUNCA são bloqueadas
  const publicPaths = ['/login', '/assinatura', '/api/auth', '/api/debug-env'];
  
  if (publicPaths.some(path => pathname === path || pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // 2. Verificação ULTRA-LEVE: apenas checa se o cookie de sessão do NextAuth existe.
  // Isso evita importar bibliotecas pesadas e estourar o limite de 1MB do Vercel.
  const sessionCookie = request.cookies.get('authjs.session-token') || request.cookies.get('__Secure-authjs.session-token');

  // 3. Se não houver cookie de sessão, redireciona para o login
  if (!sessionCookie) {
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/login') {
      loginUrl.searchParams.set('callbackUrl', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// 4. Configuração para ignorar arquivos estáticos e manter o arquivo leve
export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.png$|.*\\.svg$).*)',
  ],
};
