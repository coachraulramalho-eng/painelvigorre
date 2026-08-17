import { NextResponse } from 'next/server';
import { 
  processSignature, 
  declineSignature, 
  markAsViewed,
  validateSignatureToken
} from '@/lib/services/signature.service';
import { prisma } from '@/lib/db/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, signatureData, fields, action, reason } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Token é obrigatório' },
        { status: 400 }
      );
    }

    // Validar token
    const requestData = await validateSignatureToken(token);
    if (!requestData) {
      return NextResponse.json(
        { error: 'Solicitação de assinatura inválida' },
        { status: 404 }
      );
    }

    if (requestData.status === 'expired') {
      return NextResponse.json(
        { error: 'Solicitação de assinatura expirada' },
        { status: 400 }
      );
    }

    if (requestData.status === 'signed') {
      return NextResponse.json(
        { error: 'Documento já assinado' },
        { status: 400 }
      );
    }

    if (requestData.status === 'declined') {
      return NextResponse.json(
        { error: 'Solicitação de assinatura foi recusada' },
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
        result = await declineSignature(token, reason);
        break;

      case 'view':
        await markAsViewed(token);
        result = { success: true, message: 'Documento marcado como visualizado' };
        break;

      default:
        return NextResponse.json(
          { error: 'Ação inválida. Use: sign, decline ou view' },
          { status: 400 }
        );
    }

    // Registrar auditoria
    await prisma.auditLog.create({
      data: {
        userId: 'system',
        action: action.toUpperCase(),
        module: 'signature',
        recordId: requestData.id,
        newData: { action, signer: requestData.signerEmail },
      },
    });

    return NextResponse.json({
      success: true,
      result,
      message: action === 'sign' ? 'Documento assinado com sucesso!' :
               action === 'decline' ? 'Assinatura recusada' :
               'Documento visualizado',
    });
  } catch (error) {
    console.error('Erro ao processar assinatura:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao processar assinatura' },
      { status: 500 }
    );
  }
}
