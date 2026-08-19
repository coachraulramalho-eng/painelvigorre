import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

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

// 🔥 ROTAS QUE REQUEREM AUTENTICAÇÃO MAS SÃO APIs PÚBLICAS
const API_PATHS = [
  '/api/qrcode',
  '/api/signature',
  '/api/webhook',
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 🔥 LOG PARA DEPURAÇÃO (opcional - remover em produção)
  // console.log('[middleware] Path:', pathname);

  // 1. Verificar se é rota pública
  const isPublicPath = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path)
  );

  // 2. Verificar se é API pública
  const isApiPath = API_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path)
  );

  if (isPublicPath) {
    return NextResponse.next();
  }

  // 3. Verificar autenticação
  try {
    const token = await getToken({ req: request });

    // Se não tem token, redirecionar para login
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // 4. Verificar permissões para rotas específicas (apenas para APIs)
    if (pathname.startsWith('/api/') && !isApiPath && !isPublicPath) {
      const userPermissions = token.permissions as string[] || [];
      const userRole = token.role as string;

      // ADM Master tem acesso total
      if (userRole === 'ADM Master') {
        return NextResponse.next();
      }

      // Extrair módulo da rota
      const moduleMatch = pathname.match(/\/api\/([^\/]+)/);
      if (moduleMatch) {
        const module = moduleMatch[1];
        
        // Mapear módulos da API para permissões
        const moduleMap: Record<string, string> = {
          'comercial': 'commercial',
          'financeiro': 'financial',
          'marketing': 'marketing',
          'admin': 'admin',
          'dashboard': 'dashboard',
          'media': 'media',
          'signature': 'signature',
          'qrcode': 'media',
          'documents': 'signature',
        };

        const permissionModule = moduleMap[module] || module;
        const hasPermission = userPermissions.includes(`${permissionModule}:view`);

        if (!hasPermission) {
          return NextResponse.json(
            { error: 'Sem permissão para acessar este recurso' },
            { status: 403 }
          );
        }
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error('[middleware] Erro:', error);
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|logo.svg|media|assinatura).*)',
  ],
};
