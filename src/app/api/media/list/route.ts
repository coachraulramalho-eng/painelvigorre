import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/db/prisma';

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
    const category = searchParams.get('category');
    const type = searchParams.get('type');
    const tags = searchParams.get('tags')?.split(',');
    const campaignId = searchParams.get('campaignId');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};

    if (category) where.category = category;
    if (type) where.type = type;
    if (campaignId) where.campaignId = campaignId;
    if (tags && tags.length > 0) where.tags = { hasSome: tags };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [media, total] = await Promise.all([
      prisma.media.findMany({
        where,
        include: {
          uploadedByUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.media.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      media,
      pagination: {
        total,
        limit,
        offset,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Erro ao listar mídias:', error);
    return NextResponse.json(
      { error: 'Erro ao listar mídias' },
      { status: 500 }
    );
  }
}
