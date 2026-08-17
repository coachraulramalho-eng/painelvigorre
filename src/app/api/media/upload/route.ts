import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { uploadMediaFile, uploadMultipleMedia } from '@/lib/services/media.service';

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
    const files = formData.getAll('files') as File[];
    const category = formData.get('category') as string || 'geral';
    const tags = JSON.parse(formData.get('tags') as string || '[]');
    const description = formData.get('description') as string;
    const campaignId = formData.get('campaignId') as string;
    const makeThumbnail = formData.get('makeThumbnail') !== 'false';
    const resizeWidth = formData.get('resizeWidth') ? parseInt(formData.get('resizeWidth') as string) : undefined;
    const resizeHeight = formData.get('resizeHeight') ? parseInt(formData.get('resizeHeight') as string) : undefined;

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      );
    }

    const uploadOptions = {
      category,
      tags,
      description,
      campaignId,
      makeThumbnail,
      resizeOptions: resizeWidth || resizeHeight ? {
        width: resizeWidth,
        height: resizeHeight,
        fit: 'cover' as const,
      } : undefined,
    };

    let results;

    if (files.length === 1) {
      const media = await uploadMediaFile(files[0], token.id as string, uploadOptions);
      results = [media];
    } else {
      results = await uploadMultipleMedia(files, token.id as string, uploadOptions);
    }

    // Registrar auditoria
    await prisma.auditLog.create({
      data: {
        userId: token.id as string,
        action: 'CREATE',
        module: 'media',
        recordId: results[0]?.id || '',
        newData: { count: results.length, category },
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      media: results,
      count: results.length,
    });
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao fazer upload' },
      { status: 500 }
    );
  }
}

import { prisma } from '@/lib/db/prisma';
