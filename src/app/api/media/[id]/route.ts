import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/db/prisma';
import { getMediaById, deleteMedia, updateMedia } from '@/lib/services/media.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = await getToken({ req: request as any });
    
    if (!token) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const media = await getMediaById(id);

    if (!media) {
      return NextResponse.json(
        { error: 'Mídia não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      media,
    });
  } catch (error) {
    console.error('Erro ao buscar mídia:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar mídia' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = await getToken({ req: request as any });
    
    if (!token) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, tags, category } = body;

    const media = await updateMedia(id, {
      name,
      description,
      tags,
      category,
    });

    if (!media) {
      return NextResponse.json(
        { error: 'Mídia não encontrada' },
        { status: 404 }
      );
    }

    await prisma.auditLog.create({
      data: {
        userId: token.id as string,
        action: 'UPDATE',
        module: 'media',
        recordId: id,
        newData: { name, description, tags, category },
      },
    });

    return NextResponse.json({
      success: true,
      media,
    });
  } catch (error) {
    console.error('Erro ao atualizar mídia:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar mídia' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = await getToken({ req: request as any });
    
    if (!token) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const success = await deleteMedia(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Mídia não encontrada ou não pôde ser removida' },
        { status: 404 }
      );
    }

    await prisma.auditLog.create({
      data: {
        userId: token.id as string,
        action: 'DELETE',
        module: 'media',
        recordId: id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Mídia excluída com sucesso',
    });
  } catch (error) {
    console.error('Erro ao excluir mídia:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir mídia' },
      { status: 500 }
    );
  }
}
