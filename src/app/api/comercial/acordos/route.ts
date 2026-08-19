import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { z } from 'zod';

const acordoSchema = z.object({
  representativeId: z.string().min(1, 'Representante é obrigatório'),
  companyId: z.string().optional(),
  service: z.string().min(1, 'Serviço é obrigatório'),
  percentage: z.string().optional(),
  fixedValue: z.string().optional(),
  calculationBase: z.string().default('Valor efetivamente recebido'),
  validityStart: z.string().optional(),
  validityEnd: z.string().optional(),
  status: z.string().default('Ativo'),
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
    const companyId = searchParams.get('companyId');

    const where: any = {};
    if (status) where.status = status;
    if (representativeId) where.representativeId = representativeId;
    if (companyId) where.companyId = companyId;

    const agreements = await prisma.commercialAgreement.findMany({
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
        company: {
          select: {
            id: true,
            name: true,
            document: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Formatar dados
    const formatted = agreements.map((agreement) => ({
      id: agreement.id,
      representativeId: agreement.representativeId,
      representativeName: agreement.representative.user?.name || 'N/A',
      companyId: agreement.companyId,
      companyName: agreement.company?.name || 'N/A',
      service: agreement.service,
      percentage: agreement.percentage ? Number(agreement.percentage) : null,
      fixedValue: agreement.fixedValue ? Number(agreement.fixedValue) : null,
      calculationBase: agreement.calculationBase,
      validityStart: agreement.validityStart,
      validityEnd: agreement.validityEnd,
      status: agreement.status,
      notes: agreement.notes,
      createdAt: agreement.createdAt,
    }));

    return NextResponse.json({
      success: true,
      agreements: formatted,
    });
  } catch (error) {
    console.error('Erro ao buscar acordos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar acordos' },
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
    const validatedData = acordoSchema.parse(body);

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

    // Verificar se empresa existe (se fornecida)
    if (validatedData.companyId) {
      const company = await prisma.company.findUnique({
        where: { id: validatedData.companyId },
      });
      if (!company) {
        return NextResponse.json(
          { error: 'Empresa não encontrada' },
          { status: 404 }
        );
      }
    }

    const agreement = await prisma.commercialAgreement.create({
      data: {
        representativeId: validatedData.representativeId,
        companyId: validatedData.companyId || null,
        service: validatedData.service,
        percentage: validatedData.percentage ? parseFloat(validatedData.percentage) : null,
        fixedValue: validatedData.fixedValue ? parseFloat(validatedData.fixedValue) : null,
        calculationBase: validatedData.calculationBase,
        validityStart: validatedData.validityStart ? new Date(validatedData.validityStart) : undefined,
        validityEnd: validatedData.validityEnd ? new Date(validatedData.validityEnd) : undefined,
        status: validatedData.status,
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
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE',
        module: 'commercial',
        recordId: agreement.id,
        newData: agreement,
        ipAddress: request.headers.get('x-forwarded-for') || '',
        userAgent: request.headers.get('user-agent') || '',
      },
    });

    return NextResponse.json({
      success: true,
      agreement,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Erro ao criar acordo:', error);
    return NextResponse.json(
      { error: 'Erro ao criar acordo' },
      { status: 500 }
    );
  }
}
