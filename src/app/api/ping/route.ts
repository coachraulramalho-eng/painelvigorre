import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'API está funcionando!',
    time: new Date().toISOString(),
    random: Math.random().toString(36).substring(7),
  });
}
