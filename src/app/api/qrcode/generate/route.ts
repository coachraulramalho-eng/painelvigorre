import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { 
  generateQRCodeDataURL, 
  generateQRCodeSVG,
  generateQRCodeBuffer,
  validateQRCodeData,
  generatePaymentQRCode,
  generateProposalQRCode,
  generateContractQRCode,
  generateDocumentQRCode,
  generateLeadQRCode
} from '@/lib/services/qrcode.service';

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
    const { data, type, options, specificType } = body;

    if (!data && !specificType) {
      return NextResponse.json(
        { error: 'Dados são obrigatórios' },
        { status: 400 }
      );
    }

    let qrCode: string;
    let format = options?.format || 'dataURL';
    let metadata: any = {};

    // Gerar QR Code específico se solicitado
    if (specificType) {
      switch (specificType) {
        case 'payment':
          qrCode = await generatePaymentQRCode(data.link, data.value, data.client);
          metadata = { type: 'payment', client: data.client, value: data.value };
          break;
        case 'proposal':
          qrCode = await generateProposalQRCode(data.id, data.number);
          metadata = { type: 'proposal', id: data.id, number: data.number };
          break;
        case 'contract':
          qrCode = await generateContractQRCode(data.id, data.title);
          metadata = { type: 'contract', id: data.id, title: data.title };
          break;
        case 'document':
          qrCode = await generateDocumentQRCode(data.id, data.title);
          metadata = { type: 'document', id: data.id, title: data.title };
          break;
        case 'lead':
          qrCode = await generateLeadQRCode(data.id, data.name);
          metadata = { type: 'lead', id: data.id, name: data.name };
          break;
        default:
          return NextResponse.json(
            { error: 'Tipo específico inválido' },
            { status: 400 }
          );
      }
    } else {
      // Gerar QR Code genérico
      if (format === 'svg') {
        qrCode = await generateQRCodeSVG(data, options);
      } else if (format === 'buffer') {
        const buffer = await generateQRCodeBuffer(data, options);
        return new NextResponse(buffer, {
          headers: {
            'Content-Type': 'image/png',
            'Content-Disposition': `attachment; filename="qrcode.png"`,
          },
        });
      } else {
        qrCode = await generateQRCodeDataURL(data, options);
      }
    }

    // Registrar no banco (opcional)
    if (type) {
      await prisma.qRCode.create({
        data: {
          data: typeof data === 'string' ? data : JSON.stringify(data),
          type: type || 'custom',
          relatedId: data.id,
          url: data.url,
        },
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      qrCode,
      format,
      metadata,
    });
  } catch (error) {
    console.error('Erro ao gerar QR Code:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao gerar QR Code' },
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
    const data = searchParams.get('data');
    const format = searchParams.get('format') || 'dataURL';

    if (!data) {
      return NextResponse.json(
        { error: 'Dados são obrigatórios' },
        { status: 400 }
      );
    }

    let qrCode: string;
    if (format === 'svg') {
      qrCode = await generateQRCodeSVG(decodeURIComponent(data));
    } else {
      qrCode = await generateQRCodeDataURL(decodeURIComponent(data));
    }

    return NextResponse.json({
      success: true,
      qrCode,
      format,
    });
  } catch (error) {
    console.error('Erro ao gerar QR Code:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar QR Code' },
      { status: 500 }
    );
  }
}

// Import necessário para o registro no banco
import { prisma } from '@/lib/db/prisma';
