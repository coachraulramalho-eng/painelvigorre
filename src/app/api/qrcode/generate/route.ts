import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/db/prisma';
import { 
  generateQRCodeDataURL, 
  generateQRCodeSVG,
  generateQRCodeBuffer,
  generateQRCodeWithLogo,
  generatePaymentQRCodeWithLogo,
  generateProposalQRCodeWithLogo,
  generateContractQRCodeWithLogo,
  generateDocumentQRCodeWithLogo,
  generateLeadQRCodeWithLogo,
  getLogoBase64,
  validateQRCodeData,
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
    const { data, type, options, specificType, includeLogo = true } = body;

    if (!data && !specificType) {
      return NextResponse.json(
        { error: 'Dados são obrigatórios' },
        { status: 400 }
      );
    }

    let qrCode: string;
    let format = options?.format || 'dataURL';
    let metadata: any = {};

    // Carregar logo se necessário
    const logoBase64 = includeLogo ? getLogoBase64() : undefined;

    // Gerar QR Code específico se solicitado
    if (specificType) {
      switch (specificType) {
        case 'payment':
          qrCode = await generatePaymentQRCodeWithLogo(
            data.link, 
            data.value, 
            data.client,
            logoBase64
          );
          metadata = { 
            type: 'payment', 
            client: data.client, 
            value: data.value, 
            hasLogo: !!logoBase64 
          };
          break;

        case 'proposal':
          qrCode = await generateProposalQRCodeWithLogo(
            data.id,
            data.number,
            logoBase64
          );
          metadata = { 
            type: 'proposal', 
            id: data.id, 
            number: data.number, 
            hasLogo: !!logoBase64 
          };
          break;

        case 'contract':
          qrCode = await generateContractQRCodeWithLogo(
            data.id,
            data.title,
            logoBase64
          );
          metadata = { 
            type: 'contract', 
            id: data.id, 
            title: data.title, 
            hasLogo: !!logoBase64 
          };
          break;

        case 'document':
          qrCode = await generateDocumentQRCodeWithLogo(
            data.id,
            data.title,
            logoBase64
          );
          metadata = { 
            type: 'document', 
            id: data.id, 
            title: data.title, 
            hasLogo: !!logoBase64 
          };
          break;

        case 'lead':
          qrCode = await generateLeadQRCodeWithLogo(
            data.id,
            data.name,
            logoBase64
          );
          metadata = { 
            type: 'lead', 
            id: data.id, 
            name: data.name, 
            hasLogo: !!logoBase64 
          };
          break;

        default:
          return NextResponse.json(
            { error: 'Tipo específico inválido' },
            { status: 400 }
          );
      }
    } else {
      // Gerar QR Code genérico com logo
      if (includeLogo && logoBase64) {
        qrCode = await generateQRCodeWithLogo(data, logoBase64, options);
      } else if (format === 'svg') {
        qrCode = await generateQRCodeSVG(data, options);
      } else if (format === 'buffer') {
        const buffer = await generateQRCodeBuffer(data, options);
        return new NextResponse(buffer, {
          headers: {
            'Content-Type': 'image/png',
            'Content-Disposition': `attachment; filename="qrcode-vigorre.png"`,
          },
        });
      } else {
        qrCode = await generateQRCodeDataURL(data, options);
      }
    }

    // Registrar no banco (opcional)
    try {
      await prisma.qRCode.create({
        data: {
          data: typeof data === 'string' ? data : JSON.stringify(data),
          type: type || 'custom',
          relatedId: data?.id,
          url: data?.url,
        },
      });
    } catch (error) {
      // Não falhar se não conseguir registrar
      console.warn('Não foi possível registrar QR Code:', error);
    }

    return NextResponse.json({
      success: true,
      qrCode,
      format,
      metadata,
      hasLogo: !!logoBase64,
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
    const includeLogo = searchParams.get('logo') !== 'false';

    if (!data) {
      return NextResponse.json(
        { error: 'Dados são obrigatórios' },
        { status: 400 }
      );
    }

    let qrCode: string;
    const logoBase64 = includeLogo ? getLogoBase64() : undefined;

    if (includeLogo && logoBase64) {
      qrCode = await generateQRCodeWithLogo(
        decodeURIComponent(data),
        logoBase64
      );
    } else if (format === 'svg') {
      qrCode = await generateQRCodeSVG(decodeURIComponent(data));
    } else {
      qrCode = await generateQRCodeDataURL(decodeURIComponent(data));
    }

    return NextResponse.json({
      success: true,
      qrCode,
      format,
      hasLogo: !!logoBase64,
    });
  } catch (error) {
    console.error('Erro ao gerar QR Code:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar QR Code' },
      { status: 500 }
    );
  }
}
