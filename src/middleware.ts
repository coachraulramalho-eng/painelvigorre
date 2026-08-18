import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/auth';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. Rotas públicas que NUNCA são bloqueadas
  const publicPaths = ['/login', '/assinatura'];
  
  if (publicPaths.some(path => pathname === path || pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // 2. Usa o método oficial e mais estável do NextAuth v5 para verificar sessão
  const session = await auth();

  // 3. Se não houver sessão, redireciona para o login
  if (!session) {
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/login') {
      loginUrl.searchParams.set('callbackUrl', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// 4. Ignora totalmente arquivos estáticos e rotas da API para evitar conflitos
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
