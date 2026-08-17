import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';

const DOCUMENT_DIR = path.join(process.cwd(), 'public', 'documents');

if (!fs.existsSync(DOCUMENT_DIR)) {
  fs.mkdirSync(DOCUMENT_DIR, { recursive: true });
}

const documentSchema = z.object({
  title: z.string().min(2, 'Título é obrigatório'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  companyId: z.string().optional(),
  proposalId: z.string().optional(),
  contractId: z.string().optional(),
  notes: z.string().optional(),
  status: z.string().default('Ativo'),
});

export async function GET(request: NextRequest) {
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
    const status = searchParams.get('status');
    const companyId = searchParams.get('companyId');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};

    if (category) where.category = category;
    if (status) where.status = status;
    if (companyId) where.companyId = companyId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (token.role !== 'ADM Master') {
      const userPermissions = token.permissions as string[] || [];
      if (!userPermissions.includes('signature:view:all')) {
        where.responsibleId = token.id;
      }
    }

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        include: {
          responsible: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          company: {
            select: {
              id: true,
              name: true,
              document: true,
            },
          },
          proposal: {
            select: {
              id: true,
              number: true,
              title: true,
            },
          },
          contract: {
            select: {
              id: true,
              title: true,
              value: true,
            },
          },
          signatureRequests: {
            select: {
              id: true,
              signerName: true,
              signerEmail: true,
              status: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.document.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      documents,
      pagination: {
        total,
        limit,
        offset,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Erro ao buscar documentos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar documentos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    const title = formData.get('title') as string;
    const category = formData.get('category') as string;
    const companyId = formData.get('companyId') as string;
    const proposalId = formData.get('proposalId') as string;
    const contractId = formData.get('contractId') as string;
    const notes = formData.get('notes') as string;
    const status = formData.get('status') as string || 'Ativo';

    if (!file) {
      return NextResponse.json(
        { error: 'Arquivo é obrigatório' },
        { status: 400 }
      );
    }

    if (!title) {
      return NextResponse.json(
        { error: 'Título é obrigatório' },
        { status: 400 }
      );
    }

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo não permitido' },
        { status: 400 }
      );
    }

    const id = randomUUID();
    const extension = file.name.split('.').pop() || '';
    const filename = `${id}.${extension}`;
    const filepath = path.join(DOCUMENT_DIR, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filepath, buffer);

    const document = await prisma.document.create({
      data: {
        id,
        title,
        category,
        fileUrl: `/documents/${filename}`,
        version: '1.0',
        status,
        notes,
        responsibleId: token.id as string,
        companyId: companyId || null,
        proposalId: proposalId || null,
        contractId: contractId || null,
      },
      include: {
        responsible: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: token.id as string,
        action: 'CREATE',
        module: 'document',
        recordId: document.id,
        newData: { title, category, fileSize: file.size },
        ipAddress: request.headers.get('x-forwarded-for') || '',
        userAgent: request.headers.get('user-agent') || '',
      },
    });

    return NextResponse.json({
      success: true,
      document,
    });
  } catch (error) {
    console.error('Erro ao criar documento:', error);
    return NextResponse.json(
      { error: 'Erro ao criar documento' },
      { status: 500 }
    );
  }
}
