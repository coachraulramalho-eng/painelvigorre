import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { z } from 'zod';

const updateRepresentanteSchema = z.object({
  type: z.string().optional(),
  document: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  region: z.string().optional(),
  services: z.string().optional(),
  bankData: z.string().optional(),
  pix: z.string().optional(),
  status: z.string().optional(),
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

    const representative = await prisma.representative.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        commissions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        agreements: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            commissions: true,
            agreements: true,
          },
        },
      },
    });

    if (!representative) {
      return NextResponse.json(
        { error: 'Representante não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      representative,
    });
  } catch (error) {
    console.error('Erro ao buscar representante:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar representante' },
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
    const validatedData = updateRepresentanteSchema.parse(body);

    const existingRepresentante = await prisma.representative.findUnique({
      where: { id },
    });

    if (!existingRepresentante) {
      return NextResponse.json(
        { error: 'Representante não encontrado' },
        { status: 404 }
      );
    }

    const representative = await prisma.representative.update({
      where: { id },
      data: validatedData,
      include: {
        user: {
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
        module: 'commercial',
        recordId: id,
        oldData: existingRepresentante,
        newData: representative,
        ipAddress: request.headers.get('x-forwarded-for') || '',
        userAgent: request.headers.get('user-agent') || '',
      },
    });

    return NextResponse.json({
      success: true,
      representative,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Erro ao atualizar representante:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar representante' },
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

    const existingRepresentante = await prisma.representative.findUnique({
      where: { id },
    });

    if (!existingRepresentante) {
      return NextResponse.json(
        { error: 'Representante não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se tem comissões ou acordos
    const hasRelations = await prisma.representative.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            commissions: true,
            agreements: true,
          },
        },
      },
    });

    if (hasRelations && (hasRelations._count.commissions > 0 || hasRelations._count.agreements > 0)) {
      return NextResponse.json(
        { error: 'Não é possível excluir representante com comissões ou acordos vinculados' },
        { status: 400 }
      );
    }

    await prisma.representative.delete({
      where: { id },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'DELETE',
        module: 'commercial',
        recordId: id,
        oldData: existingRepresentante,
        ipAddress: request.headers.get('x-forwarded-for') || '',
        userAgent: request.headers.get('user-agent') || '',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Representante excluído com sucesso',
    });
  } catch (error) {
    console.error('Erro ao excluir representante:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir representante' },
      { status: 500 }
    );
  }
}
