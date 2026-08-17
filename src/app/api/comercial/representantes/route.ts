import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getToken } from 'next-auth/jwt';
import { z } from 'zod';

const representativeSchema = z.object({
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
  contractFile: z.string().optional(),
  status: z.string().default('Ativo'),
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
    const region = searchParams.get('region');

    const where: any = {};
    if (status) where.status = status;
    if (region) where.region = region;

    if (token.role !== 'ADM Master') {
      const userPermissions = token.permissions as string[] || [];
      if (!userPermissions.includes('commercial:view:all')) {
        where.userId = token.id;
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

    return NextResponse.json({
      success: true,
      representatives,
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
    const token = await getToken({ req: request as any });
    
    if (!token) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    if (token.role !== 'ADM Master') {
      return NextResponse.json(
        { error: 'Sem permissão para criar representantes' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = representativeSchema.parse(body);

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
        contractFile: validatedData.contractFile,
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
        userId: token.id as string,
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
