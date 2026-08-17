import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { validateSignatureToken } from '@/lib/services/signature.service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const documentId = searchParams.get('documentId');

    if (token) {
      // Buscar por token
      const requestData = await validateSignatureToken(token);
      
      if (!requestData) {
        return NextResponse.json(
          { error: 'Solicitação de assinatura não encontrada' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        signatureRequest: requestData,
      });
    }

    if (documentId) {
      // Buscar todas as solicitações de um documento
      const requests = await prisma.signatureRequest.findMany({
        where: { documentId },
        include: {
          document: {
            include: {
              company: true,
              responsible: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      });

      const allSigned = requests.every((r) => r.status === 'signed');
      const anyDeclined = requests.some((r) => r.status === 'declined');
      const anyPending = requests.some((r) => r.status === 'pending' || r.status === 'viewed');

      return NextResponse.json({
        success: true,
        requests,
        summary: {
          total: requests.length,
          signed: requests.filter((r) => r.status === 'signed').length,
          pending: requests.filter((r) => r.status === 'pending' || r.status === 'viewed').length,
          declined: requests.filter((r) => r.status === 'declined').length,
          expired: requests.filter((r) => r.status === 'expired').length,
          allSigned,
          anyDeclined,
          anyPending,
          status: allSigned ? 'completed' : anyDeclined ? 'declined' : anyPending ? 'pending' : 'unknown',
        },
      });
    }

    return NextResponse.json(
      { error: 'Token ou documentId é obrigatório' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Erro ao buscar status da assinatura:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar status da assinatura' },
      { status: 500 }
    );
  }
}
