import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { z } from 'zod';

const updateContratoSchema = z.object({
  proposalId: z.string().optional(),
  companyId: z.string().optional(),
  title: z.string().min(2).optional(),
  value: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  renewalDate: z.string().optional(),
  status: z.string().optional(),
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

    const contrato = await prisma.contract.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            document: true,
            phone: true,
            email: true,
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
        responsible: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        documents: true,
        tasks: true,
        accountReceivables: true,
      },
    });

    if (!contrato) {
      return NextResponse.json(
        { error: 'Contrato não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(contrato);
  } catch (error) {
    console.error('Erro ao buscar contrato:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar contrato' },
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
    const validatedData = updateContratoSchema.parse(body);

    const existingContrato = await prisma.contract.findUnique({
      where: { id },
    });

    if (!existingContrato) {
      return NextResponse.json(
        { error: 'Contrato não encontrado' },
        { status: 404 }
      );
    }

    // 🔥 CONVERTER DATAS CORRETAMENTE
    const updateData: any = { ...validatedData };
    if (validatedData.value) {
      updateData.value = parseFloat(validatedData.value);
    }
    if (validatedData.startDate) {
      updateData.startDate = new Date(validatedData.startDate);
    } else if (validatedData.startDate === '') {
      updateData.startDate = null;
    }
    if (validatedData.endDate) {
      updateData.endDate = new Date(validatedData.endDate);
    } else if (validatedData.endDate === '') {
      updateData.endDate = null;
    }
    if (validatedData.renewalDate) {
      updateData.renewalDate = new Date(validatedData.renewalDate);
    } else if (validatedData.renewalDate === '') {
      updateData.renewalDate = null;
    }

    const contrato = await prisma.contract.update({
      where: { id },
      data: updateData,
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
        action: 'UPDATE',
        module: 'contracts',
        recordId: id,
        oldData: existingContrato,
        newData: contrato,
        ipAddress: request.headers.get('x-forwarded-for') || '',
        userAgent: request.headers.get('user-agent') || '',
      },
    });

    return NextResponse.json(contrato);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Erro ao atualizar contrato:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar contrato' },
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

    const existingContrato = await prisma.contract.findUnique({
      where: { id },
    });

    if (!existingContrato) {
      return NextResponse.json(
        { error: 'Contrato não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se tem relacionamentos
    const hasRelations = await prisma.contract.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            documents: true,
            tasks: true,
            accountReceivables: true,
          },
        },
      },
    });

    if (hasRelations && (hasRelations._count.documents > 0 || 
        hasRelations._count.tasks > 0 || 
        hasRelations._count.accountReceivables > 0)) {
      return NextResponse.json(
        { error: 'Não é possível excluir contrato com relacionamentos ativos' },
        { status: 400 }
      );
    }

    await prisma.contract.delete({
      where: { id },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'DELETE',
        module: 'contracts',
        recordId: id,
        oldData: existingContrato,
        ipAddress: request.headers.get('x-forwarded-for') || '',
        userAgent: request.headers.get('user-agent') || '',
      },
    });

    return NextResponse.json(
      { message: 'Contrato excluído com sucesso' }
    );
  } catch (error) {
    console.error('Erro ao excluir contrato:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir contrato' },
      { status: 500 }
    );
  }
}
