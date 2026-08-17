import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { createSignatureRequest } from '@/lib/services/signature.service';

export async function POST(request: Request) {
  try {
    const token = await getToken({ req: request as any });
    
    if (!token) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { documentId, signers, expiresInDays } = body;

    if (!documentId) {
      return NextResponse.json(
        { error: 'ID do documento é obrigatório' },
        { status: 400 }
      );
    }

    if (!signers || signers.length === 0) {
      return NextResponse.json(
        { error: 'Pelo menos um signatário é obrigatório' },
        { status: 400 }
      );
    }

    const requests = await createSignatureRequest(documentId, signers, expiresInDays);

    return NextResponse.json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error('Erro ao criar solicitação de assinatura:', error);
    return NextResponse.json(
      { error: 'Erro ao criar solicitação de assinatura' },
      { status: 500 }
    );
  }
}
