import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Verificar se é ADM Master
    if (session.user.role !== 'ADM Master') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const module = searchParams.get('module');

    const where: any = {};
    if (module) where.module = module;

    const permissions = await prisma.permission.findMany({
      where,
      orderBy: [
        { module: 'asc' },
        { action: 'asc' },
      ],
    });

    // Agrupar por módulo
    const grouped = permissions.reduce((acc, perm) => {
      if (!acc[perm.module]) {
        acc[perm.module] = [];
      }
      acc[perm.module].push({
        id: perm.id,
        action: perm.action,
        scope: perm.scope,
        description: perm.description,
      });
      return acc;
    }, {} as Record<string, any[]>);

    return NextResponse.json({
      permissions,
      grouped,
    });
  } catch (error) {
    console.error('Erro ao buscar permissões:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar permissões' },
      { status: 500 }
    );
  }
}
