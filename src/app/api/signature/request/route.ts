import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { createSignatureRequest } from '@/lib/services/signature.service';
import { prisma } from '@/lib/db/prisma';

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
    const { documentId, signers, expiresInDays, sendEmails } = body;

    if (!documentId) {
      return NextResponse.json(
        { error: 'ID do documento é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se documento existe
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Documento não encontrado' },
        { status: 404 }
      );
    }

    if (!signers || signers.length === 0) {
      return NextResponse.json(
        { error: 'Pelo menos um signatário é obrigatório' },
        { status: 400 }
      );
    }

    // Validar signatários
    for (const signer of signers) {
      if (!signer.name || !signer.email) {
        return NextResponse.json(
          { error: 'Nome e e-mail são obrigatórios para todos os signatários' },
          { status: 400 }
        );
      }
    }

    const requests = await createSignatureRequest(
      documentId,
      signers,
      expiresInDays || 7
    );

    // Registrar auditoria
    await prisma.auditLog.create({
      data: {
        userId: token.id as string,
        action: 'CREATE',
        module: 'signature',
        recordId: documentId,
        newData: { signers: signers.map((s: any) => s.email) },
      },
    });

    return NextResponse.json({
      success: true,
      requests,
      message: `Solicitação de assinatura criada para ${requests.length} signatário(s)`,
    });
  } catch (error) {
    console.error('Erro ao criar solicitação de assinatura:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao criar solicitação de assinatura' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const token = await getToken({ req: request as any });
    
    if (!token) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');

    if (!documentId) {
      return NextResponse.json(
        { error: 'ID do documento é obrigatório' },
        { status: 400 }
      );
    }

    const requests = await prisma.signatureRequest.findMany({
      where: { documentId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error('Erro ao buscar solicitações:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar solicitações' },
      { status: 500 }
    );
  }
}
