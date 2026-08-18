import { NextResponse } from 'next/server';

// 🔓 Rota pública - NÃO requer autenticação
export const dynamic = 'force-dynamic';

export async function GET() {
  // ⚠️ NUNCA exponha variáveis sensíveis em produção!
  // Este é apenas para diagnóstico temporário

  const envStatus = {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ? '✅ Configurado' : '❌ FALTANDO',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✅ Configurado' : '❌ FALTANDO',
    DATABASE_URL: process.env.DATABASE_URL ? '✅ Configurado' : '❌ FALTANDO',
    DIRECT_URL: process.env.DIRECT_URL ? '✅ Configurado' : '❌ FALTANDO',
    JWT_SECRET: process.env.JWT_SECRET ? '✅ Configurado' : '❌ FALTANDO',
    NODE_ENV: process.env.NODE_ENV || 'não definido',
    VERCEL_ENV: process.env.VERCEL_ENV || 'não definido',
    VERCEL_URL: process.env.VERCEL_URL || 'não definido',
  };

  return NextResponse.json({
    status: 'ok',
    env: envStatus,
    timestamp: new Date().toISOString(),
    message: 'Variáveis marcadas como "✅ Configurado" estão presentes',
  });
}
