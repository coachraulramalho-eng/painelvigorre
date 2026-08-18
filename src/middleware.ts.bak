import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// 🔥 LISTA COMPLETA DE ROTAS PÚBLICAS
const PUBLIC_PATHS = [
  '/login',
  '/api/auth',
  '/api/debug',      // 🔥 Rota de diagnóstico
  '/_next',
  '/favicon.ico',
  '/logo.svg',
  '/assinatura',
  '/media',
];

// Verifica se a rota é pública
const isPublicPath = (pathname: string) => {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path)
  );
};

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 🔥 LOG PARA DEPURAÇÃO (vai aparecer nos logs da Vercel)
  console.log('[middleware] Path:', pathname);
  console.log('[middleware] Is Public?', isPublicPath(pathname));

  // Se for rota pública, libera imediatamente
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Verificar autenticação
  try {
    const token = await getToken({ req: request });

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
    '/((?!api/auth|api/debug|_next/static|_next/image|favicon.ico|logo.svg|media).*)',
  ],
};
