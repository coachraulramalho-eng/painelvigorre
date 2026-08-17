import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const handleApiError = (error: unknown) => {
  console.error('API Error:', error);

  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.status }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { error: 'Erro interno do servidor' },
    { status: 500 }
  );
};

export const withAuth = async (
  request: NextRequest,
  handler: (token: any) => Promise<Response>
) => {
  const token = await getToken({ req: request as any });
  
  if (!token) {
    return NextResponse.json(
      { error: 'Não autenticado' },
      { status: 401 }
    );
  }

  return handler(token);
};

export const withPermissions = async (
  request: NextRequest,
  requiredPermissions: { module: string; action: string }[],
  handler: (token: any) => Promise<Response>
) => {
  const token = await getToken({ req: request as any });
  
  if (!token) {
    return NextResponse.json(
      { error: 'Não autenticado' },
      { status: 401 }
    );
  }

  // ADM Master tem todas as permissões
  if (token.role === 'ADM Master') {
    return handler(token);
  }

  const userPermissions = token.permissions as string[] || [];
  
  const hasAllPermissions = requiredPermissions.every(({ module, action }) => {
    return userPermissions.includes(`${module}:${action}`);
  });

  if (!hasAllPermissions) {
    return NextResponse.json(
      { error: 'Sem permissão para esta ação' },
      { status: 403 }
    );
  }

  return handler(token);
};
