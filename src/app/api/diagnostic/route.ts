import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // 🔥 Lista apenas os NOMES das variáveis (não os valores)
  const envVars = {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ? '✅ definido' : '❌ faltando',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✅ definido' : '❌ faltando',
    DATABASE_URL: process.env.DATABASE_URL ? '✅ definido' : '❌ faltando',
    DIRECT_URL: process.env.DIRECT_URL ? '✅ definido' : '❌ faltando',
    JWT_SECRET: process.env.JWT_SECRET ? '✅ definido' : '❌ faltando',
  };

  // Verificar se o Prisma Client pode ser importado
  let prismaStatus = 'não testado';
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    await prisma.$connect();
    prismaStatus = 'conectado';
    await prisma.$disconnect();
  } catch (error: any) {
    prismaStatus = `erro: ${error.message?.substring(0, 100) || 'desconhecido'}`;
  }

  return NextResponse.json({
    status: 'ok',
    environment: envVars,
    prisma: prismaStatus,
    timestamp: new Date().toISOString(),
  });
}
