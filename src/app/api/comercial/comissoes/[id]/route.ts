import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { z } from 'zod';

const updateComissaoSchema = z.object({
  value: z.string().optional(),
  status: z.string().optional(),
  paymentDate: z.string().optional(),
  notes: z.string().optional(),
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

    const commission = await prisma.commission.findUnique({
      where: { id },
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
    });

    if (!commission) {
      return NextResponse.json(
        { error: 'Comissão não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      commission,
    });
  } catch (error) {
    console.error('Erro ao buscar comissão:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar comissão' },
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

    if (session.user.role !== 'ADM Master') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updateComissaoSchema.parse(body);

    const existingCommission = await prisma.commission.findUnique({
      where: { id },
    });

    if (!existingCommission) {
      return NextResponse.json(
        { error: 'Comissão não encontrada' },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (validatedData.value !== undefined) {
      updateData.value = parseFloat(validatedData.value);
    }
    if (validatedData.status !== undefined) updateData.status = validatedData.status;
    if (validatedData.notes !== undefined) updateData.notes = validatedData.notes;
    if (validatedData.paymentDate !== undefined) {
      updateData.paymentDate = validatedData.paymentDate ? new Date(validatedData.paymentDate) : null;
    }

    // Se status mudou para 'Paga', definir data de pagamento
    if (validatedData.status === 'Paga' && existingCommission.status !== 'Paga') {
      updateData.paymentDate = new Date();
    }

    const commission = await prisma.commission.update({
      where: { id },
      data: updateData,
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
        action: 'UPDATE',
        module: 'commercial',
        recordId: id,
        oldData: existingCommission,
        newData: commission,
        ipAddress: request.headers.get('x-forwarded-for') || '',
        userAgent: request.headers.get('user-agent') || '',
      },
    });

    return NextResponse.json({
      success: true,
      commission,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Erro ao atualizar comissão:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar comissão' },
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

    if (session.user.role !== 'ADM Master') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    const existingCommission = await prisma.commission.findUnique({
      where: { id },
    });

    if (!existingCommission) {
      return NextResponse.json(
        { error: 'Comissão não encontrada' },
        { status: 404 }
      );
    }

    // Não permitir excluir comissão já paga
    if (existingCommission.status === 'Paga') {
      return NextResponse.json(
        { error: 'Não é possível excluir uma comissão já paga' },
        { status: 400 }
      );
    }

    await prisma.commission.delete({
      where: { id },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'DELETE',
        module: 'commercial',
        recordId: id,
        oldData: existingCommission,
        ipAddress: request.headers.get('x-forwarded-for') || '',
        userAgent: request.headers.get('user-agent') || '',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Comissão excluída com sucesso',
    });
  } catch (error) {
    console.error('Erro ao excluir comissão:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir comissão' },
      { status: 500 }
    );
  }
}
