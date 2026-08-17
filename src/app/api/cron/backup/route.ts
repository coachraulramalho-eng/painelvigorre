import { NextResponse } from 'next/server';
import { scheduleBackup } from '@/lib/services/backup.service';

export async function POST() {
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

    await scheduleBackup();

    return NextResponse.json({
      success: true,
      message: 'Backup executado com sucesso',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erro ao executar backup:', error);
    return NextResponse.json(
      { error: 'Erro ao executar backup' },
      { status: 500 }
    );
  }
}
