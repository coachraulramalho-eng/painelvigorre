import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { z } from 'zod';

const representanteSchema = z.object({
  userId: z.string().min(1, 'Usuário é obrigatório'),
  type: z.string().min(1, 'Tipo é obrigatório'),
  document: z.string().min(1, 'Documento é obrigatório'),
  phone: z.string().optional(),
  email: z.string().email('E-mail inválido').optional(),
  address: z.string().optional(),
  region: z.string().optional(),
  services: z.string().optional(),
  bankData: z.string().optional(),
  pix: z.string().optional(),
  status: z.string().default('Ativo'),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const region = searchParams.get('region');
    const search = searchParams.get('search');

    const where: any = {};
    if (status) where.status = status;
    if (region) where.region = region;
    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { document: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Se não for ADM Master, mostrar apenas seus representantes
    if (session.user.role !== 'ADM Master') {
      const userPermissions = session.user.permissions || [];
      if (!userPermissions.includes('commercial:view:all')) {
        where.userId = session.user.id;
      }
    }

    const representatives = await prisma.representative.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        commissions: {
          where: { status: 'Paga' },
          select: {
            id: true,
            value: true,
          },
        },
        _count: {
          select: {
            commissions: true,
            agreements: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Formatar dados
    const formatted = representatives.map((rep) => ({
      id: rep.id,
      userId: rep.userId,
      name: rep.user?.name || 'N/A',
      email: rep.user?.email || '',
      type: rep.type,
      document: rep.document,
      phone: rep.phone,
      address: rep.address,
      region: rep.region,
      services: rep.services,
      bankData: rep.bankData,
      pix: rep.pix,
      status: rep.status,
      totalCommissions: rep.commissions.reduce((acc, c) => acc + Number(c.value), 0),
      commissionsCount: rep._count.commissions,
      agreementsCount: rep._count.agreements,
      createdAt: rep.createdAt,
      user: rep.user,
    }));

    return NextResponse.json({
      success: true,
      representatives: formatted,
    });
  } catch (error) {
    console.error('Erro ao buscar representantes:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar representantes' },
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

    if (session.user.role !== 'ADM Master') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = representanteSchema.parse(body);

    // Verificar se usuário existe
    const user = await prisma.user.findUnique({
      where: { id: validatedData.userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se já é representante
    const existing = await prisma.representative.findUnique({
      where: { userId: validatedData.userId },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Usuário já é representante' },
        { status: 400 }
      );
    }

    const representative = await prisma.representative.create({
      data: {
        userId: validatedData.userId,
        type: validatedData.type,
        document: validatedData.document,
        phone: validatedData.phone,
        email: validatedData.email,
        address: validatedData.address,
        region: validatedData.region,
        services: validatedData.services,
        bankData: validatedData.bankData,
        pix: validatedData.pix,
        status: validatedData.status,
      },
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
        action: 'CREATE',
        module: 'commercial',
        recordId: representative.id,
        newData: representative,
        ipAddress: request.headers.get('x-forwarded-for') || '',
        userAgent: request.headers.get('user-agent') || '',
      },
    });

    return NextResponse.json({
      success: true,
      representative,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Erro ao criar representante:', error);
    return NextResponse.json(
      { error: 'Erro ao criar representante' },
      { status: 500 }
    );
  }
}
