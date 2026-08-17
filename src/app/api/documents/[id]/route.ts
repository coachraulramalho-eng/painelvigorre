import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/db/prisma';
import fs from 'fs';
import path from 'path';

const DOCUMENT_DIR = path.join(process.cwd(), 'public', 'documents');

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

    const document = await prisma.document.findUnique({
      where: { id },
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
            phone: true,
            email: true,
          },
        },
        proposal: {
          select: {
            id: true,
            number: true,
            title: true,
            finalValue: true,
          },
        },
        contract: {
          select: {
            id: true,
            title: true,
            value: true,
            startDate: true,
            endDate: true,
          },
        },
        signatureRequests: {
          include: {
            fields: true,
          },
        },
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Documento não encontrado' },
        { status: 404 }
      );
    }

    if (token.role !== 'ADM Master') {
      const userPermissions = token.permissions as string[] || [];
      if (!userPermissions.includes('signature:view:all')) {
        if (document.responsibleId !== token.id) {
          return NextResponse.json(
            { error: 'Sem permissão para visualizar este documento' },
            { status: 403 }
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      document,
    });
  } catch (error) {
    console.error('Erro ao buscar documento:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar documento' },
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
    const { title, category, status, notes, version } = body;

    const existingDocument = await prisma.document.findUnique({
      where: { id },
    });

    if (!existingDocument) {
      return NextResponse.json(
        { error: 'Documento não encontrado' },
        { status: 404 }
      );
    }

    if (token.role !== 'ADM Master') {
      if (existingDocument.responsibleId !== token.id) {
        return NextResponse.json(
          { error: 'Sem permissão para editar este documento' },
          { status: 403 }
        );
      }
    }

    const document = await prisma.document.update({
      where: { id },
      data: {
        title: title || existingDocument.title,
        category: category || existingDocument.category,
        status: status || existingDocument.status,
        notes: notes !== undefined ? notes : existingDocument.notes,
        version: version || existingDocument.version,
      },
      include: {
        responsible: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: token.id as string,
        action: 'UPDATE',
        module: 'document',
        recordId: id,
        oldData: existingDocument,
        newData: document,
        ipAddress: request.headers.get('x-forwarded-for') || '',
        userAgent: request.headers.get('user-agent') || '',
      },
    });

    return NextResponse.json({
      success: true,
      document,
    });
  } catch (error) {
    console.error('Erro ao atualizar documento:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar documento' },
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

    const existingDocument = await prisma.document.findUnique({
      where: { id },
    });

    if (!existingDocument) {
      return NextResponse.json(
        { error: 'Documento não encontrado' },
        { status: 404 }
      );
    }

    if (token.role !== 'ADM Master') {
      return NextResponse.json(
        { error: 'Apenas ADM Master pode excluir documentos' },
        { status: 403 }
      );
    }

    const signatureRequests = await prisma.signatureRequest.findMany({
      where: { documentId: id },
    });

    if (signatureRequests.length > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir um documento com solicitações de assinatura' },
        { status: 400 }
      );
    }

    const filepath = path.join(DOCUMENT_DIR, path.basename(existingDocument.fileUrl));
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }

    await prisma.document.delete({
      where: { id },
    });

    await prisma.auditLog.create({
      data: {
        userId: token.id as string,
        action: 'DELETE',
        module: 'document',
        recordId: id,
        oldData: existingDocument,
        ipAddress: request.headers.get('x-forwarded-for') || '',
        userAgent: request.headers.get('user-agent') || '',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Documento excluído com sucesso',
    });
  } catch (error) {
    console.error('Erro ao excluir documento:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir documento' },
      { status: 500 }
    );
  }
}
