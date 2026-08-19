import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { z } from 'zod';

const tarefaSchema = z.object({
  title: z.string().min(2, 'Título é obrigatório'),
  description: z.string().optional(),
  priority: z.string().default('Média'),
  dueDate: z.string().optional(),
  status: z.string().default('A fazer'),
  leadId: z.string().optional(),
  proposalId: z.string().optional(),
  contractId: z.string().optional(),
  companyId: z.string().optional(),
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
    const priority = searchParams.get('priority');
    const responsibleId = searchParams.get('responsibleId');

    const where: any = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;

    // Se não for ADM Master, filtrar por responsável
    if (session.user.role !== 'ADM Master') {
      where.responsibleId = session.user.id;
    }

    if (responsibleId) where.responsibleId = responsibleId;

    const tarefas = await prisma.task.findMany({
      where,
      include: {
        responsible: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        lead: {
          select: {
            id: true,
            name: true,
          },
        },
        proposal: {
          select: {
            id: true,
            number: true,
            title: true,
          },
        },
        contract: {
          select: {
            id: true,
            title: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    return NextResponse.json(tarefas);
  } catch (error) {
    console.error('Erro ao buscar tarefas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar tarefas' },
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
    const validatedData = tarefaSchema.parse(body);

    const tarefa = await prisma.task.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        priority: validatedData.priority,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
        status: validatedData.status,
        leadId: validatedData.leadId,
        proposalId: validatedData.proposalId,
        contractId: validatedData.contractId,
        companyId: validatedData.companyId,
        notes: validatedData.notes,
        responsibleId: session.user.id,
      },
      include: {
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
        module: 'tasks',
        recordId: tarefa.id,
        newData: tarefa,
        ipAddress: request.headers.get('x-forwarded-for') || '',
        userAgent: request.headers.get('user-agent') || '',
      },
    });

    return NextResponse.json(tarefa, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Erro ao criar tarefa:', error);
    return NextResponse.json(
      { error: 'Erro ao criar tarefa' },
      { status: 500 }
    );
  }
}
