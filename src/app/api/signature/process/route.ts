import { NextResponse } from 'next/server';
import { processSignature, declineSignature, markAsViewed } from '@/lib/services/signature.service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, signatureData, fields, action } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Token é obrigatório' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'sign':
        if (!signatureData) {
          return NextResponse.json(
            { error: 'Assinatura é obrigatória' },
            { status: 400 }
          );
        }
        result = await processSignature(token, signatureData, fields);
        break;

      case 'decline':
        result = await declineSignature(token, body.reason);
        break;

      case 'view':
        await markAsViewed(token);
        result = { success: true, message: 'Documento marcado como visualizado' };
        break;

      default:
        return NextResponse.json(
          { error: 'Ação inválida' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error('Erro ao processar assinatura:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao processar assinatura' },
      { status: 500 }
    );
  }
}
