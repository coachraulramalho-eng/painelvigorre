import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { z } from 'zod';

const updateAcordoSchema = z.object({
  representativeId: z.string().optional(),
  companyId: z.string().optional(),
  service: z.string().optional(),
  percentage: z.string().optional(),
  fixedValue: z.string().optional(),
  calculationBase: z.string().optional(),
  validityStart: z.string().optional(),
  validityEnd: z.string().optional(),
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

    const agreement = await prisma.commercialAgreement.findUnique({
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
        company: {
          select: {
            id: true,
            name: true,
            document: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    if (!agreement) {
      return NextResponse.json(
        { error: 'Acordo não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      agreement,
    });
  } catch (error) {
    console.error('Erro ao buscar acordo:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar acordo' },
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
    const validatedData = updateAcordoSchema.parse(body);

    const existingAgreement = await prisma.commercialAgreement.findUnique({
      where: { id },
    });

    if (!existingAgreement) {
      return NextResponse.json(
        { error: 'Acordo não encontrado' },
        { status: 404 }
      );
    }

    // Construir dados de atualização
    const updateData: any = {};

    if (validatedData.representativeId !== undefined) {
      // Verificar se representante existe
      if (validatedData.representativeId) {
        const rep = await prisma.representative.findUnique({
          where: { id: validatedData.representativeId },
        });
        if (!rep) {
          return NextResponse.json(
            { error: 'Representante não encontrado' },
            { status: 404 }
          );
        }
      }
      updateData.representativeId = validatedData.representativeId || null;
    }

    if (validatedData.companyId !== undefined) {
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
      updateData.companyId = validatedData.companyId || null;
    }

    if (validatedData.service !== undefined) updateData.service = validatedData.service;
    if (validatedData.percentage !== undefined) {
      updateData.percentage = validatedData.percentage ? parseFloat(validatedData.percentage) : null;
    }
    if (validatedData.fixedValue !== undefined) {
      updateData.fixedValue = validatedData.fixedValue ? parseFloat(validatedData.fixedValue) : null;
    }
    if (validatedData.calculationBase !== undefined) updateData.calculationBase = validatedData.calculationBase;
    if (validatedData.status !== undefined) updateData.status = validatedData.status;
    if (validatedData.notes !== undefined) updateData.notes = validatedData.notes;

    if (validatedData.validityStart !== undefined) {
      updateData.validityStart = validatedData.validityStart ? new Date(validatedData.validityStart) : null;
    }
    if (validatedData.validityEnd !== undefined) {
      updateData.validityEnd = validatedData.validityEnd ? new Date(validatedData.validityEnd) : null;
    }

    const agreement = await prisma.commercialAgreement.update({
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
        action: 'UPDATE',
        module: 'commercial',
        recordId: id,
        oldData: existingAgreement,
        newData: agreement,
        ipAddress: request.headers.get('x-forwarded-for') || '',
        userAgent: request.headers.get('user-agent') || '',
      },
    });

    return NextResponse.json({
      success: true,
      agreement,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Erro ao atualizar acordo:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar acordo' },
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

    const existingAgreement = await prisma.commercialAgreement.findUnique({
      where: { id },
    });

    if (!existingAgreement) {
      return NextResponse.json(
        { error: 'Acordo não encontrado' },
        { status: 404 }
      );
    }

    await prisma.commercialAgreement.delete({
      where: { id },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'DELETE',
        module: 'commercial',
        recordId: id,
        oldData: existingAgreement,
        ipAddress: request.headers.get('x-forwarded-for') || '',
        userAgent: request.headers.get('user-agent') || '',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Acordo excluído com sucesso',
    });
  } catch (error) {
    console.error('Erro ao excluir acordo:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir acordo' },
      { status: 500 }
    );
  }
}
