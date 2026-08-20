import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 🔥 ROTAS PÚBLICAS - NUNCA BLOQUEAR
const PUBLIC_PATHS = [
  '/login',
  '/api/auth',
  '/api/debug',
  '/api/diagnostic',
  '/api/health',
  '/api/ping',
  '/api/hello',
  '/_next',
  '/favicon.ico',
  '/logo.svg',
  '/media',
  '/assinatura',
];

// 🔥 ROTAS DE API PÚBLICAS
const PUBLIC_API_PATHS = [
  '/api/qrcode',
  '/api/signature',
  '/api/webhook',
];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. Verificar se é rota pública
  const isPublicPath = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path)
  );

  // 2. Verificar se é API pública
  const isPublicApi = PUBLIC_API_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path)
  );

  if (isPublicPath || isPublicApi) {
    return NextResponse.next();
  }

  // 3. Verificar cookie de sessão
  const sessionCookie = 
    request.cookies.get('authjs.session-token')?.value || 
    request.cookies.get('__Secure-authjs.session-token')?.value;

  // Se não tem cookie
  if (!sessionCookie) {
    // Se for uma API, retornar 401
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }
    
    // Se for página, redirecionar para login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|logo.svg|media|assinatura).*)',
  ],
};
