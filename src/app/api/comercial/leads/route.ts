import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getToken } from 'next-auth/jwt';
import { z } from 'zod';

const leadSchema = z.object({
  companyId: z.string().optional(),
  name: z.string().min(2, 'Nome é obrigatório'),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email('E-mail inválido').optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  segment: z.string().optional(),
  origin: z.string().min(1, 'Origem é obrigatória'),
  status: z.string().default('Novo'),
  notes: z.string().optional(),
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
    const origin = searchParams.get('origin');
    const responsibleId = searchParams.get('responsibleId');
    const search = searchParams.get('search');

    const where: any = {};

    if (status) where.status = status;
    if (origin) where.origin = origin;

    if (token.role !== 'ADM Master') {
      const userPermissions = token.permissions as string[] || [];
      
      if (!userPermissions.includes('commercial:view:all')) {
        where.OR = [
          { responsibleId: token.id },
          { representativeId: token.id },
        ];
      }
    }

    if (responsibleId) where.responsibleId = responsibleId;

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { company: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const leads = await prisma.lead.findMany({
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
        opportunities: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        _count: {
          select: {
            activities: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(leads);
  } catch (error) {
    console.error('Erro ao buscar leads:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar leads' },
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
    const validatedData = leadSchema.parse(body);

    const userPermissions = token.permissions as string[] || [];
    if (token.role !== 'ADM Master' && !userPermissions.includes('commercial:create')) {
      return NextResponse.json(
        { error: 'Sem permissão para criar leads' },
        { status: 403 }
      );
    }

    // Garantir que responsibleId seja sempre uma string
    let responsibleId: string = token.id as string;
    
    if (validatedData.representativeId && token.role !== 'Representante') {
      responsibleId = validatedData.representativeId;
    }

    let companyId = validatedData.companyId;
    
    if (!companyId) {
      const existingCompany = await prisma.company.findFirst({
        where: {
          name: validatedData.name,
        },
      });

      if (existingCompany) {
        companyId = existingCompany.id;
      } else {
        const newCompany = await prisma.company.create({
          data: {
            name: validatedData.name,
            segment: validatedData.segment,
            city: validatedData.city,
            state: validatedData.state,
          },
        });
        companyId = newCompany.id;
      }
    }

    const lead = await prisma.lead.create({
      data: {
        companyId,
        name: validatedData.name,
        phone: validatedData.phone,
        whatsapp: validatedData.whatsapp,
        email: validatedData.email,
        city: validatedData.city,
        state: validatedData.state,
        segment: validatedData.segment,
        origin: validatedData.origin,
        status: validatedData.status,
        notes: validatedData.notes,
        responsibleId: responsibleId,
        representativeId: validatedData.representativeId || null,
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
        recordId: lead.id,
        newData: lead,
        ipAddress: request.headers.get('x-forwarded-for') || '',
        userAgent: request.headers.get('user-agent') || '',
      },
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Erro ao criar lead:', error);
    return NextResponse.json(
      { error: 'Erro ao criar lead' },
      { status: 500 }
    );
  }
}
