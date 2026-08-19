import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { z } from 'zod';

const comissaoSchema = z.object({
  representativeId: z.string().min(1, 'Representante é obrigatório'),
  proposalId: z.string().optional(),
  accountReceivableId: z.string().optional(),
  value: z.string().min(1, 'Valor é obrigatório'),
  status: z.string().default('Prevista'),
  paymentDate: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const representativeId = searchParams.get('representativeId');
    const proposalId = searchParams.get('proposalId');

    const where: any = {};
    if (status) where.status = status;
    if (representativeId) where.representativeId = representativeId;
    if (proposalId) where.proposalId = proposalId;

    // Se não for ADM Master, mostrar apenas suas comissões
    if (session.user.role !== 'ADM Master') {
      const userPermissions = session.user.permissions || [];
      if (!userPermissions.includes('commercial:view:all')) {
        where.representative = {
          userId: session.user.id,
        };
      }
    }

    const commissions = await prisma.commission.findMany({
      where,
      include: {
        representative: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        proposal: {
          select: {
            id: true,
            number: true,
            title: true,
            finalValue: true,
          },
        },
        accountReceivable: {
          select: {
            id: true,
            description: true,
            value: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calcular métricas
    const totalPrevisto = commissions
      .filter(c => c.status === 'Prevista' || c.status === 'Aprovada')
      .reduce((acc, c) => acc + Number(c.value), 0);

    const totalPendente = commissions
      .filter(c => c.status === 'Pendente')
      .reduce((acc, c) => acc + Number(c.value), 0);

    const totalPago = commissions
      .filter(c => c.status === 'Paga')
      .reduce((acc, c) => acc + Number(c.value), 0);

    return NextResponse.json({
      success: true,
      comissoes: commissions,
      metrics: {
        totalPrevisto,
        totalPendente,
        totalPago,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar comissões:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar comissões' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    if (session.user.role !== 'ADM Master') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = comissaoSchema.parse(body);

    // Verificar se representante existe
    const representative = await prisma.representative.findUnique({
      where: { id: validatedData.representativeId },
    });

    if (!representative) {
      return NextResponse.json(
        { error: 'Representante não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se proposta existe (se fornecida)
    if (validatedData.proposalId) {
      const proposal = await prisma.proposal.findUnique({
        where: { id: validatedData.proposalId },
      });
      if (!proposal) {
        return NextResponse.json(
          { error: 'Proposta não encontrada' },
          { status: 404 }
        );
      }
    }

    const commission = await prisma.commission.create({
      data: {
        representativeId: validatedData.representativeId,
        proposalId: validatedData.proposalId,
        accountReceivableId: validatedData.accountReceivableId,
        value: parseFloat(validatedData.value),
        status: validatedData.status,
        paymentDate: validatedData.paymentDate ? new Date(validatedData.paymentDate) : undefined,
        notes: validatedData.notes,
      },
      include: {
        representative: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        proposal: {
          select: {
            id: true,
            number: true,
            title: true,
          },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE',
        module: 'commercial',
        recordId: commission.id,
        newData: commission,
        ipAddress: request.headers.get('x-forwarded-for') || '',
        userAgent: request.headers.get('user-agent') || '',
      },
    });

    return NextResponse.json({
      success: true,
      commission,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Erro ao criar comissão:', error);
    return NextResponse.json(
      { error: 'Erro ao criar comissão' },
      { status: 500 }
    );
  }
}
