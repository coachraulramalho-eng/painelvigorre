import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token é obrigatório' },
        { status: 400 }
      );
    }

    const signatureRequest = await prisma.signatureRequest.findFirst({
      where: { token },
      include: {
        document: {
          include: {
            company: true,
          },
        },
      },
    });

    if (!signatureRequest) {
      return NextResponse.json(
        { error: 'Solicitação de assinatura não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      signatureRequest,
    });
  } catch (error) {
    console.error('Erro ao buscar status da assinatura:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar status da assinatura' },
      { status: 500 }
    );
  }
}
