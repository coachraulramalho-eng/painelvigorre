import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { z } from 'zod';

const roleSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  description: z.string().optional(),
  isMaster: z.boolean().default(false),
  permissions: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Verificar se é ADM Master
    if (session.user.role !== 'ADM Master') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    const roles = await prisma.role.findMany({
      include: {
        users: {
          select: {
            userId: true,
          },
        },
        permissions: {
          include: {
            permission: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Formatar dados
    const formattedRoles = roles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description,
      isMaster: role.isMaster,
      usersCount: role.users.length,
      permissionsCount: role.permissions.length,
      permissions: role.permissions.map((p) => p.permission),
      createdAt: role.createdAt,
    }));

    return NextResponse.json(formattedRoles);
  } catch (error) {
    console.error('Erro ao buscar perfis:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar perfis' },
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
    const validatedData = roleSchema.parse(body);

    // Verificar se já existe
    const existingRole = await prisma.role.findUnique({
      where: { name: validatedData.name },
    });

    if (existingRole) {
      return NextResponse.json(
        { error: 'Perfil já existe' },
        { status: 400 }
      );
    }

    // Criar role
    const role = await prisma.role.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        isMaster: validatedData.isMaster,
      },
    });

    // Adicionar permissões se existirem
    if (validatedData.permissions && validatedData.permissions.length > 0) {
      // Buscar ou criar permissões
      for (const perm of validatedData.permissions) {
        const [module, action] = perm.split(':');
        if (module && action) {
          // Buscar permissão existente
          let permission = await prisma.permission.findFirst({
            where: {
              module,
              action,
              scope: 'all',
            },
          });

          // Criar se não existir
          if (!permission) {
            permission = await prisma.permission.create({
              data: {
                module,
                action,
                scope: 'all',
                description: `${action} ${module}`,
              },
            });
          }

          // Vincular ao role
          await prisma.rolePermission.create({
            data: {
              roleId: role.id,
              permissionId: permission.id,
            },
          });
        }
      }
    }

    // Registrar auditoria
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE',
        module: 'security',
        recordId: role.id,
        newData: role,
        ipAddress: request.headers.get('x-forwarded-for') || '',
        userAgent: request.headers.get('user-agent') || '',
      },
    });

    return NextResponse.json(role, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Erro ao criar perfil:', error);
    return NextResponse.json(
      { error: 'Erro ao criar perfil' },
      { status: 500 }
    );
  }
}
