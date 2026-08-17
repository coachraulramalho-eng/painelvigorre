import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { uploadMediaFile } from '@/lib/services/media.service';

export async function POST(request: Request) {
  try {
    const token = await getToken({ req: request as any });
    
    if (!token) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string || 'geral';
    const tags = JSON.parse(formData.get('tags') as string || '[]');
    const description = formData.get('description') as string;
    const campaignId = formData.get('campaignId') as string;
    const makeThumbnail = formData.get('makeThumbnail') !== 'false';

    if (!file) {
      return NextResponse.json(
        { error: 'Arquivo não enviado' },
        { status: 400 }
      );
    }

    const media = await uploadMediaFile(file, token.id as string, {
      category,
      tags,
      description,
      campaignId,
      makeThumbnail,
    });

    return NextResponse.json({
      success: true,
      media,
    });
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao fazer upload' },
      { status: 500 }
    );
  }
}
