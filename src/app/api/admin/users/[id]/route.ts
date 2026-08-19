import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { hash } from 'bcryptjs';
import { z } from 'zod';

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  active: z.boolean().optional(),
  roleIds: z.array(z.string()).optional(),
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

    const user = await prisma.user.findUnique({
      where: { id },
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
        representatives: true,
        employees: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    const { password, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar usuário' },
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
    const validatedData = updateUserSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Não permitir desativar o próprio usuário
    if (validatedData.active === false && id === session.user.id) {
      return NextResponse.json(
        { error: 'Não é possível desativar seu próprio usuário' },
        { status: 403 }
      );
    }

    const updateData: any = {};
    if (validatedData.name) updateData.name = validatedData.name;
    if (validatedData.email) updateData.email = validatedData.email;
    if (validatedData.active !== undefined) updateData.active = validatedData.active;
    if (validatedData.password) {
      updateData.password = await hash(validatedData.password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    // Atualizar roles se fornecidas
    if (validatedData.roleIds !== undefined) {
      await prisma.userRole.deleteMany({
        where: { userId: id },
      });

      for (const roleId of validatedData.roleIds) {
        await prisma.userRole.create({
          data: {
            userId: id,
            roleId,
          },
        });
      }
    }

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE',
        module: 'security',
        recordId: id,
        oldData: existingUser,
        newData: user,
        ipAddress: request.headers.get('x-forwarded-for') || '',
        userAgent: request.headers.get('user-agent') || '',
      },
    });

    const { password, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Erro ao atualizar usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar usuário' },
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

    // Não permitir deletar o próprio usuário
    if (id === session.user.id) {
      return NextResponse.json(
        { error: 'Não é possível deletar seu próprio usuário' },
        { status: 403 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se tem relacionamentos
    const hasRelations = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            leadsResponsible: true,
            proposals: true,
            tasks: true,
            contracts: true,
          },
        },
      },
    });

    if (hasRelations && (hasRelations._count.leadsResponsible > 0 || 
        hasRelations._count.proposals > 0 || 
        hasRelations._count.tasks > 0 || 
        hasRelations._count.contracts > 0)) {
      return NextResponse.json(
        { error: 'Não é possível excluir usuário com atividades vinculadas' },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'DELETE',
        module: 'security',
        recordId: id,
        oldData: existingUser,
        ipAddress: request.headers.get('x-forwarded-for') || '',
        userAgent: request.headers.get('user-agent') || '',
      },
    });

    return NextResponse.json(
      { message: 'Usuário excluído com sucesso' }
    );
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir usuário' },
      { status: 500 }
    );
  }
}

// PATCH para ativar/desativar usuário
export async function PATCH(
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
    const { active } = body;

    if (active === undefined) {
      return NextResponse.json(
        { error: 'Status é obrigatório' },
        { status: 400 }
      );
    }

    // Não permitir desativar o próprio usuário
    if (active === false && id === session.user.id) {
      return NextResponse.json(
        { error: 'Não é possível desativar seu próprio usuário' },
        { status: 403 }
      );
    }

    const user = await prisma.user.update({
      where: { id },
      data: { active },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: active ? 'ACTIVATE' : 'DEACTIVATE',
        module: 'security',
        recordId: id,
        newData: { active },
        ipAddress: request.headers.get('x-forwarded-for') || '',
        userAgent: request.headers.get('user-agent') || '',
      },
    });

    const { password, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Erro ao alterar status do usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao alterar status do usuário' },
      { status: 500 }
    );
  }
}
