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
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const module = searchParams.get('module');
    const action = searchParams.get('action');
    const userId = searchParams.get('userId');

    const where: any = {};
    if (module) where.module = module;
    if (action) where.action = action;
    if (userId) where.userId = userId;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    // Calcular métricas
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayCount = await prisma.auditLog.count({
      where: {
        createdAt: { gte: today },
      },
    });

    const actionCounts = await prisma.auditLog.groupBy({
      by: ['action'],
      _count: true,
    });

    const metrics = {
      total,
      today: todayCount,
      actions: actionCounts.reduce((acc, item) => {
        acc[item.action] = item._count;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({
      logs: logs.map((log) => ({
        id: log.id,
        user: log.user?.name || 'Sistema',
        action: log.action,
        module: log.module,
        timestamp: log.createdAt,
        ipAddress: log.ipAddress || '-',
        details: JSON.stringify(log.newData || log.oldData || {}).slice(0, 100),
      })),
      metrics,
    });
  } catch (error) {
    console.error('Erro ao buscar logs:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar logs' },
      { status: 500 }
    );
  }
}
