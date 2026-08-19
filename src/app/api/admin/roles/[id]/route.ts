import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { z } from 'zod';

const updateRoleSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  isMaster: z.boolean().optional(),
  permissions: z.array(z.string()).optional(),
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

    if (session.user.role !== 'ADM Master') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        users: {
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
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!role) {
      return NextResponse.json(
        { error: 'Perfil não encontrado' },
        { status: 404 }
      );
    }

    const formattedRole = {
      id: role.id,
      name: role.name,
      description: role.description,
      isMaster: role.isMaster,
      users: role.users.map((u) => u.user),
      permissions: role.permissions.map((p) => p.permission),
      usersCount: role.users.length,
      permissionsCount: role.permissions.length,
      createdAt: role.createdAt,
    };

    return NextResponse.json(formattedRole);
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar perfil' },
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
    const validatedData = updateRoleSchema.parse(body);

    const existingRole = await prisma.role.findUnique({
      where: { id },
    });

    if (!existingRole) {
      return NextResponse.json(
        { error: 'Perfil não encontrado' },
        { status: 404 }
      );
    }

    // Não permitir alterar perfil Master
    if (existingRole.isMaster) {
      return NextResponse.json(
        { error: 'Não é permitido alterar o perfil Master' },
        { status: 403 }
      );
    }

    // Atualizar role
    const updateData: any = {};
    if (validatedData.name) updateData.name = validatedData.name;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.isMaster !== undefined) updateData.isMaster = validatedData.isMaster;

    const role = await prisma.role.update({
      where: { id },
      data: updateData,
    });

    // Atualizar permissões se fornecidas
    if (validatedData.permissions !== undefined) {
      // Remover permissões antigas
      await prisma.rolePermission.deleteMany({
        where: { roleId: id },
      });

      // Adicionar novas permissões
      for (const perm of validatedData.permissions) {
        const [module, action] = perm.split(':');
        if (module && action) {
          let permission = await prisma.permission.findFirst({
            where: {
              module,
              action,
              scope: 'all',
            },
          });

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

          await prisma.rolePermission.create({
            data: {
              roleId: role.id,
              permissionId: permission.id,
            },
          });
        }
      }
    }

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE',
        module: 'security',
        recordId: id,
        oldData: existingRole,
        newData: role,
        ipAddress: request.headers.get('x-forwarded-for') || '',
        userAgent: request.headers.get('user-agent') || '',
      },
    });

    return NextResponse.json(role);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Erro ao atualizar perfil:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar perfil' },
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

    const existingRole = await prisma.role.findUnique({
      where: { id },
    });

    if (!existingRole) {
      return NextResponse.json(
        { error: 'Perfil não encontrado' },
        { status: 404 }
      );
    }

    if (existingRole.isMaster) {
      return NextResponse.json(
        { error: 'Não é permitido excluir o perfil Master' },
        { status: 403 }
      );
    }

    // Verificar se tem usuários vinculados
    const usersCount = await prisma.userRole.count({
      where: { roleId: id },
    });

    if (usersCount > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir perfil com usuários vinculados' },
        { status: 400 }
      );
    }

    await prisma.role.delete({
      where: { id },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'DELETE',
        module: 'security',
        recordId: id,
        oldData: existingRole,
        ipAddress: request.headers.get('x-forwarded-for') || '',
        userAgent: request.headers.get('user-agent') || '',
      },
    });

    return NextResponse.json(
      { message: 'Perfil excluído com sucesso' }
    );
  } catch (error) {
    console.error('Erro ao excluir perfil:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir perfil' },
      { status: 500 }
    );
  }
}
