import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { z } from 'zod';

const followupSchema = z.object({
  leadId: z.string().min(1, 'Lead é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  date: z.string().optional(),
  status: z.string().default('Pendente'),
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
    const leadId = searchParams.get('leadId');

    const where: any = {};
    if (status) where.status = status;
    if (leadId) where.leadId = leadId;

    if (session.user.role !== 'ADM Master') {
      where.lead = {
        responsibleId: session.user.id,
      };
    }

    const followups = await prisma.activity.findMany({
      where: {
        ...where,
        type: 'Follow-up',
      },
      include: {
        lead: {
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
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(followups);
  } catch (error) {
    console.error('Erro ao buscar follow-ups:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar follow-ups' },
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
    const validatedData = followupSchema.parse(body);

    const followup = await prisma.activity.create({
      data: {
        type: 'Follow-up',
        leadId: validatedData.leadId,
        description: validatedData.description,
        date: validatedData.date ? new Date(validatedData.date) : new Date(),
        responsibleId: session.user.id,
        nextStep: validatedData.notes,
      },
      include: {
        lead: {
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
        module: 'commercial',
        recordId: followup.id,
        newData: followup,
        ipAddress: request.headers.get('x-forwarded-for') || '',
        userAgent: request.headers.get('user-agent') || '',
      },
    });

    return NextResponse.json(followup, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Erro ao criar follow-up:', error);
    return NextResponse.json(
      { error: 'Erro ao criar follow-up' },
      { status: 500 }
    );
  }
}
