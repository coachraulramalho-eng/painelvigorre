import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getToken } from 'next-auth/jwt';
import { hash } from 'bcryptjs';
import { z } from 'zod';

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  roleIds: z.array(z.string()).optional(),
  active: z.boolean().default(true),
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

    if (token.role !== 'ADM Master') {
      return NextResponse.json(
        { error: 'Sem permissão para visualizar usuários' },
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany({
      include: {
        roles: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
        employees: true,
        representatives: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const usersWithoutPassword = users.map(({ password, ...user }) => user);

    return NextResponse.json(usersWithoutPassword);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar usuários' },
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
        { error: 'Sem permissão para criar usuários' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = createUserSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Usuário já existe' },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(validatedData.password, 10);

    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        active: validatedData.active,
        roles: validatedData.roleIds ? {
          create: validatedData.roleIds.map((roleId) => ({
            roleId,
          })),
        } : undefined,
      },
      include: {
        roles: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
      },
    });

    const { password, ...userWithoutPassword } = user;

    await prisma.auditLog.create({
      data: {
        userId: token.id as string,
        action: 'CREATE',
        module: 'admin',
        recordId: user.id,
        newData: userWithoutPassword,
        ipAddress: request.headers.get('x-forwarded-for') || '',
        userAgent: request.headers.get('user-agent') || '',
      },
    });

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Erro ao criar usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao criar usuário' },
      { status: 500 }
    );
  }
}
