import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getToken } from 'next-auth/jwt';
import { z } from 'zod';

const updateLeadSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  segment: z.string().optional(),
  origin: z.string().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
  representativeId: z.string().optional(),
  lostReasonId: z.string().optional(),
  lostAt: z.string().optional(),
  convertedAt: z.string().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = await getToken({ req: request as any });
    
    if (!token) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const lead = await prisma.lead.findUnique({
      where: { id: params.id },
      include: {
        company: {
          include: {
            contacts: true,
          },
        },
        contact: true,
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
        lostReason: true,
        opportunities: {
          include: {
            proposals: true,
            activities: true,
          },
        },
        activities: {
          orderBy: {
            date: 'desc',
          },
        },
        tasks: {
          orderBy: {
            dueDate: 'asc',
          },
        },
        _count: {
          select: {
            activities: true,
            tasks: true,
            opportunities: true,
          },
        },
      },
    });

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead não encontrado' },
        { status: 404 }
      );
    }

    // Verificar permissão de acesso
    if (token.role !== 'ADM Master') {
      const userPermissions = token.permissions as string[] || [];
      
      if (!userPermissions.includes('commercial:view:all')) {
        if (lead.responsibleId !== token.id && lead.representativeId !== token.id) {
          return NextResponse.json(
            { error: 'Sem permissão para visualizar este lead' },
            { status: 403 }
          );
        }
      }
    }

    return NextResponse.json(lead);
  } catch (error) {
    console.error('Erro ao buscar lead:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar lead' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = await getToken({ req: request as any });
    
    if (!token) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = updateLeadSchema.parse(body);

    // Buscar lead existente
    const existingLead = await prisma.lead.findUnique({
      where: { id: params.id },
    });

    if (!existingLead) {
      return NextResponse.json(
        { error: 'Lead não encontrado' },
        { status: 404 }
      );
    }

    // Verificar permissão de edição
    if (token.role !== 'ADM Master') {
      const userPermissions = token.permissions as string[] || [];
      
      if (!userPermissions.includes('commercial:edit:all')) {
        if (existingLead.responsibleId !== token.id) {
          return NextResponse.json(
            { error: 'Sem permissão para editar este lead' },
            { status: 403 }
          );
        }
      }
    }

    // Preparar dados para atualização
    const updateData: any = { ...validatedData };

    // Converter datas
    if (validatedData.lostAt) {
      updateData.lostAt = new Date(validatedData.lostAt);
    }
    if (validatedData.convertedAt) {
      updateData.convertedAt = new Date(validatedData.convertedAt);
    }

    // Atualizar lead
    const updatedLead = await prisma.lead.update({
      where: { id: params.id },
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

    // Registrar auditoria
    await prisma.auditLog.create({
      data: {
        userId: token.id as string,
        action: 'UPDATE',
        module: 'commercial',
        recordId: params.id,
        oldData: existingLead,
        newData: updatedLead,
        ipAddress: request.headers.get('x-forwarded-for') || '',
        userAgent: request.headers.get('user-agent') || '',
      },
    });

    return NextResponse.json(updatedLead);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Erro ao atualizar lead:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar lead' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = await getToken({ req: request as any });
    
    if (!token) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Verificar se é ADM Master
    if (token.role !== 'ADM Master') {
      return NextResponse.json(
        { error: 'Sem permissão para excluir leads' },
        { status: 403 }
      );
    }

    // Buscar lead existente
    const existingLead = await prisma.lead.findUnique({
      where: { id: params.id },
    });

    if (!existingLead) {
      return NextResponse.json(
        { error: 'Lead não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se há relacionamentos
    const hasRelations = await prisma.opportunity.findFirst({
      where: { leadId: params.id },
    });

    if (hasRelations) {
      return NextResponse.json(
        { error: 'Não é possível excluir lead com oportunidades vinculadas' },
        { status: 400 }
      );
    }

    // Excluir lead
    await prisma.lead.delete({
      where: { id: params.id },
    });

    // Registrar auditoria
    await prisma.auditLog.create({
      data: {
        userId: token.id as string,
        action: 'DELETE',
        module: 'commercial',
        recordId: params.id,
        oldData: existingLead,
        ipAddress: request.headers.get('x-forwarded-for') || '',
        userAgent: request.headers.get('user-agent') || '',
      },
    });

    return NextResponse.json(
      { message: 'Lead excluído com sucesso' }
    );
  } catch (error) {
    console.error('Erro ao excluir lead:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir lead' },
      { status: 500 }
    );
  }
}
