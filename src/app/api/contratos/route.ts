import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { z } from 'zod';

const contratoSchema = z.object({
  proposalId: z.string().optional(),
  companyId: z.string().min(1, 'Cliente é obrigatório'),
  title: z.string().min(2, 'Título é obrigatório'),
  value: z.string().min(1, 'Valor é obrigatório'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  renewalDate: z.string().optional(),
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
    const companyId = searchParams.get('companyId');
    const search = searchParams.get('search');

    const where: any = {};
    if (status) where.status = status;
    if (companyId) where.companyId = companyId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { company: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const contratos = await prisma.contract.findMany({
      where,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            document: true,
          },
        },
        proposal: {
          select: {
            id: true,
            number: true,
            title: true,
          },
        },
        responsible: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(contratos);
  } catch (error) {
    console.error('Erro ao buscar contratos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar contratos' },
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

    const body = await request.json();
    const validatedData = contratoSchema.parse(body);

    const contrato = await prisma.contract.create({
      data: {
        proposalId: validatedData.proposalId,
        companyId: validatedData.companyId,
        title: validatedData.title,
        value: parseFloat(validatedData.value),
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : undefined,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : undefined,
        renewalDate: validatedData.renewalDate ? new Date(validatedData.renewalDate) : undefined,
        status: validatedData.status,
        notes: validatedData.notes,
        responsibleId: session.user.id,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        responsible: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE',
        module: 'contracts',
        recordId: contrato.id,
        newData: contrato,
        ipAddress: request.headers.get('x-forwarded-for') || '',
        userAgent: request.headers.get('user-agent') || '',
      },
    });

    return NextResponse.json(contrato, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Erro ao criar contrato:', error);
    return NextResponse.json(
      { error: 'Erro ao criar contrato' },
      { status: 500 }
    );
  }
}
