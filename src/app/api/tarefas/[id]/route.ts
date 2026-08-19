import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { z } from 'zod';

const updateTarefaSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional(),
  priority: z.string().optional(),
  dueDate: z.string().optional(),
  status: z.string().optional(),
  leadId: z.string().optional(),
  proposalId: z.string().optional(),
  contractId: z.string().optional(),
  companyId: z.string().optional(),
  notes: z.string().optional(),
  completedAt: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const tarefa = await prisma.task.findUnique({
      where: { id },
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
    });

    if (!tarefa) {
      return NextResponse.json(
        { error: 'Tarefa não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(tarefa);
  } catch (error) {
    console.error('Erro ao buscar tarefa:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar tarefa' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateTarefaSchema.parse(body);

    const existingTarefa = await prisma.task.findUnique({
      where: { id },
    });

    if (!existingTarefa) {
      return NextResponse.json(
        { error: 'Tarefa não encontrada' },
        { status: 404 }
      );
    }

    // 🔥 CONSTRUIR OBJETO DE DADOS DINAMICAMENTE
    const updateData: any = {};

    if (validatedData.title !== undefined) updateData.title = validatedData.title;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.priority !== undefined) updateData.priority = validatedData.priority;
    if (validatedData.status !== undefined) {
      updateData.status = validatedData.status;
      // Se for concluída, marcar completedAt
      if (validatedData.status === 'Concluída' && existingTarefa.status !== 'Concluída') {
        updateData.completedAt = new Date();
      }
    }
    if (validatedData.leadId !== undefined) updateData.leadId = validatedData.leadId;
    if (validatedData.proposalId !== undefined) updateData.proposalId = validatedData.proposalId;
    if (validatedData.contractId !== undefined) updateData.contractId = validatedData.contractId;
    if (validatedData.companyId !== undefined) updateData.companyId = validatedData.companyId;
    if (validatedData.notes !== undefined) updateData.notes = validatedData.notes;

    // 🔥 SÓ ADICIONAR dueDate SE FOR FORNECIDA
    if (validatedData.dueDate !== undefined) {
      updateData.dueDate = validatedData.dueDate ? new Date(validatedData.dueDate) : undefined;
    }
    if (validatedData.completedAt !== undefined) {
      updateData.completedAt = validatedData.completedAt ? new Date(validatedData.completedAt) : undefined;
    }

    const tarefa = await prisma.task.update({
      where: { id },
      data: updateData,
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
        action: 'UPDATE',
        module: 'tasks',
        recordId: id,
        oldData: existingTarefa,
        newData: tarefa,
        ipAddress: request.headers.get('x-forwarded-for') || '',
        userAgent: request.headers.get('user-agent') || '',
      },
    });

    return NextResponse.json(tarefa);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Erro ao atualizar tarefa:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar tarefa' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const existingTarefa = await prisma.task.findUnique({
      where: { id },
    });

    if (!existingTarefa) {
      return NextResponse.json(
        { error: 'Tarefa não encontrada' },
        { status: 404 }
      );
    }

    await prisma.task.delete({
      where: { id },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'DELETE',
        module: 'tasks',
        recordId: id,
        oldData: existingTarefa,
        ipAddress: request.headers.get('x-forwarded-for') || '',
        userAgent: request.headers.get('user-agent') || '',
      },
    });

    return NextResponse.json(
      { message: 'Tarefa excluída com sucesso' }
    );
  } catch (error) {
    console.error('Erro ao excluir tarefa:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir tarefa' },
      { status: 500 }
    );
  }
}
