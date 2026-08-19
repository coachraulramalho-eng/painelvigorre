import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { z } from 'zod';

const updateEmpresaSchema = z.object({
  name: z.string().min(2).optional(),
  document: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  segment: z.string().optional(),
  website: z.string().optional(),
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

    const empresa = await prisma.company.findUnique({
      where: { id },
      include: {
        contacts: true,
        leads: true,
        proposals: true,
        contracts: true,
        commercialAgreements: true,
        _count: {
          select: {
            contacts: true,
            leads: true,
            proposals: true,
            contracts: true,
          },
        },
      },
    });

    if (!empresa) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(empresa);
  } catch (error) {
    console.error('Erro ao buscar empresa:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar empresa' },
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
    const validatedData = updateEmpresaSchema.parse(body);

    const existingEmpresa = await prisma.company.findUnique({
      where: { id },
    });

    if (!existingEmpresa) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      );
    }

    const empresa = await prisma.company.update({
      where: { id },
      data: validatedData,
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE',
        module: 'commercial',
        recordId: id,
        oldData: existingEmpresa,
        newData: empresa,
        ipAddress: request.headers.get('x-forwarded-for') || '',
        userAgent: request.headers.get('user-agent') || '',
      },
    });

    return NextResponse.json(empresa);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Erro ao atualizar empresa:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar empresa' },
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

    // Verificar se tem relacionamentos
    const hasRelations = await prisma.company.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            contacts: true,
            leads: true,
            proposals: true,
            contracts: true,
          },
        },
      },
    });

    if (!hasRelations) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      );
    }

    if (hasRelations._count.contacts > 0 || 
        hasRelations._count.leads > 0 || 
        hasRelations._count.proposals > 0 || 
        hasRelations._count.contracts > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir empresa com relacionamentos ativos' },
        { status: 400 }
      );
    }

    await prisma.company.delete({
      where: { id },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'DELETE',
        module: 'commercial',
        recordId: id,
        oldData: hasRelations,
        ipAddress: request.headers.get('x-forwarded-for') || '',
        userAgent: request.headers.get('user-agent') || '',
      },
    });

    return NextResponse.json(
      { message: 'Empresa excluída com sucesso' }
    );
  } catch (error) {
    console.error('Erro ao excluir empresa:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir empresa' },
      { status: 500 }
    );
  }
}
