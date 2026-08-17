import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  roleId: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Usuário já existe' },
        { status: 400 }
      );
    }

    // Hash da senha
    const hashedPassword = await hash(validatedData.password, 10);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        active: true,
      },
    });

    // Atribuir role se especificada
    if (validatedData.roleId) {
      await prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: validatedData.roleId,
        },
      });
    }

    // Remover senha do retorno
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json(
      { 
        message: 'Usuário criado com sucesso',
        user: userWithoutPassword 
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Erro ao criar usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno ao criar usuário' },
      { status: 500 }
    );
  }
}
