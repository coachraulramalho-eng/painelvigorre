import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { runDailyJobs } from '@/lib/services/cron.service';

export async function POST(request: NextRequest) {
  try {
    // Verificar secret para segurança
    const authHeader = request.headers.get('authorization');
    const secret = process.env.CRON_SECRET;

    if (secret && authHeader !== `Bearer ${secret}`) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    await runDailyJobs();

    return NextResponse.json({
      success: true,
      message: 'Jobs diários executados com sucesso',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erro ao executar jobs diários:', error);
    return NextResponse.json(
      { error: 'Erro ao executar jobs diários' },
      { status: 500 }
    );
  }
}
