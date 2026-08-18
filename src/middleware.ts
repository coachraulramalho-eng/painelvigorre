import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. Definir rotas que NUNCA devem ser protegidas (públicas)
  const publicPaths = ['/login', '/assinatura'];
  
  // Se for uma rota pública, permite passar sem verificar token
  if (publicPaths.some(path => pathname === path || pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // 2. Verificar autenticação para todas as outras rotas
  // Adicionamos a secret explicitamente para garantir que funcione no Vercel
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });

  // 3. Se não houver token, redirecionar para o login
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    // Evita loop infinito se já estivermos tentando ir para o login
    if (pathname !== '/login') {
      loginUrl.searchParams.set('callbackUrl', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  /*
   * Match all request paths except for the ones starting with:
   * - api/auth (Auth.js API routes - CRUCIAL PARA NÃO QUEBRAR O JSON)
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico, logo.svg, media (public assets)
   * - qualquer arquivo .png (como seu logo-vigorre-qr.png)
   */
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|logo.svg|media|.*\\.png$).*)',
  ],
};
