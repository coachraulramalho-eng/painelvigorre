import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getToken } from 'next-auth/jwt';
import { z } from 'zod';

const proposalSchema = z.object({
  companyId: z.string().min(1, 'Cliente é obrigatório'),
  opportunityId: z.string().optional(),
  contactId: z.string().optional(),
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  service: z.string().min(1, 'Serviço é obrigatório'),
  quantity: z.number().optional(),
  unitPrice: z.number().optional(),
  totalValue: z.number().min(0, 'Valor total deve ser maior que zero'),
  discount: z.number().min(0).optional(),
  finalValue: z.number().min(0, 'Valor final deve ser maior que zero'),
  totalCost: z.number().optional(),
  margin: z.number().optional(),
  validity: z.string().optional(),
  executionDeadline: z.string().optional(),
  paymentCondition: z.string().optional(),
  notes: z.string().optional(),
  status: z.string().default('Rascunho'),
  representativeId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request as any });
    
    if (!token) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const companyId = searchParams.get('companyId');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};

    if (status) where.status = status;
    if (companyId) where.companyId = companyId;

    if (token.role !== 'ADM Master') {
      const userPermissions = token.permissions as string[] || [];
      if (!userPermissions.includes('commercial:view:all')) {
        where.OR = [
          { responsibleId: token.id },
          { representativeId: token.id },
        ];
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { number: { contains: search, mode: 'insensitive' } },
        { company: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [proposals, total] = await Promise.all([
      prisma.proposal.findMany({
        where,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              document: true,
            },
          },
          responsible: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          representative: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: true,
          costs: true,
          _count: {
            select: {
              items: true,
              costs: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.proposal.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      proposals,
      pagination: {
        total,
        limit,
        offset,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Erro ao buscar propostas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar propostas' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request as any });
    
    if (!token) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = proposalSchema.parse(body);

    const userPermissions = token.permissions as string[] || [];
    if (token.role !== 'ADM Master' && !userPermissions.includes('commercial:create')) {
      return NextResponse.json(
        { error: 'Sem permissão para criar propostas' },
        { status: 403 }
      );
    }

    // Gerar número da proposta
    const lastProposal = await prisma.proposal.findFirst({
      orderBy: { number: 'desc' },
    });
    const nextNumber = lastProposal 
      ? String(Number(lastProposal.number) + 1).padStart(6, '0')
      : '000001';

    const proposal = await prisma.proposal.create({
      data: {
        number: nextNumber,
        companyId: validatedData.companyId,
        opportunityId: validatedData.opportunityId,
        contactId: validatedData.contactId,
        responsibleId: token.id as string,
        representativeId: validatedData.representativeId || null,
        title: validatedData.title,
        description: validatedData.description,
        service: validatedData.service,
        quantity: validatedData.quantity,
        unitPrice: validatedData.unitPrice,
        totalValue: validatedData.totalValue,
        discount: validatedData.discount,
        finalValue: validatedData.finalValue,
        totalCost: validatedData.totalCost,
        margin: validatedData.margin,
        validity: validatedData.validity ? new Date(validatedData.validity) : undefined,
        executionDeadline: validatedData.executionDeadline ? new Date(validatedData.executionDeadline) : undefined,
        paymentCondition: validatedData.paymentCondition,
        notes: validatedData.notes,
        status: validatedData.status,
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
          },
        },
        representative: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: token.id as string,
        action: 'CREATE',
        module: 'commercial',
        recordId: proposal.id,
        newData: proposal,
        ipAddress: request.headers.get('x-forwarded-for') || '',
        userAgent: request.headers.get('user-agent') || '',
      },
    });

    return NextResponse.json({
      success: true,
      proposal,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Erro ao criar proposta:', error);
    return NextResponse.json(
      { error: 'Erro ao criar proposta' },
      { status: 500 }
    );
  }
}
