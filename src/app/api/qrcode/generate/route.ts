import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { generateQRCodeDataURL, generateQRCodeSVG } from '@/lib/services/qrcode.service';

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
    const { data, type, options } = body;

    if (!data) {
      return NextResponse.json(
        { error: 'Dados são obrigatórios' },
        { status: 400 }
      );
    }

    let qrCode: string;
    const format = options?.format || 'dataURL';

    if (format === 'svg') {
      qrCode = await generateQRCodeSVG(data, options);
    } else {
      qrCode = await generateQRCodeDataURL(data, options);
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
      qrCode = await generateQRCodeSVG(data);
    } else {
      qrCode = await generateQRCodeDataURL(data);
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
