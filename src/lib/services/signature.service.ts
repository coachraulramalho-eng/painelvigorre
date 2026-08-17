import { prisma } from '@/lib/db/prisma';
import { randomUUID } from 'crypto';
import { createHash } from 'crypto';

// ========== TIPOS ==========
export interface SignatureRequest {
  id: string;
  documentId: string;
  documentTitle: string;
  signerName: string;
  signerEmail: string;
  signerPhone: string | null;
  status: 'pending' | 'viewed' | 'signed' | 'declined' | 'expired' | 'cancelled';
  signatureData: string | null;
  signatureDate: Date | null;
  token: string;
  ipAddress: string | null;
  userAgent: string | null;
  notes: string | null;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  document?: any;
  fields?: SignatureField[];
}

export interface SignatureField {
  id: string;
  documentId: string;
  name: string;
  type: 'signature' | 'initial' | 'date' | 'text' | 'checkbox' | 'radio';
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  required: boolean;
  value: string | null;
  signerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SignatureFieldInput {
  name: string;
  type: 'signature' | 'initial' | 'date' | 'text' | 'checkbox' | 'radio';
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  required?: boolean;
  signerId: string;
}

// ========== CRIAÇÃO DE SOLICITAÇÃO ==========
export const createSignatureRequest = async (
  documentId: string,
  signers: Array<{ name: string; email: string; phone?: string }>,
  expiresInDays: number = 7
): Promise<SignatureRequest[]> => {
  const requests: SignatureRequest[] = [];

  const document = await prisma.document.findUnique({
    where: { id: documentId },
  });

  if (!document) {
    throw new Error('Documento não encontrado');
  }

  for (const signer of signers) {
    const id = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const request = await prisma.signatureRequest.create({
      data: {
        id,
        documentId,
        documentTitle: document.title,
        signerName: signer.name,
        signerEmail: signer.email,
        signerPhone: signer.phone || null,
        status: 'pending',
        expiresAt,
        token: generateSignatureToken(id, signer.email),
      },
    });

    requests.push(request as SignatureRequest);

    // Registrar auditoria
    await prisma.auditLog.create({
      data: {
        userId: 'system',
        action: 'CREATE',
        module: 'signature',
        recordId: id,
        newData: { signer: signer.email, document: documentId },
      },
    });

    // Enviar notificação
    await prisma.notification.create({
      data: {
        userId: 'system',
        type: 'info',
        title: '📝 Solicitação de Assinatura',
        message: `${signer.name} foi convidado para assinar "${document.title}"`,
        link: `/documentos/${documentId}`,
      },
    });
  }

  return requests;
};

// ========== GERAÇÃO DE TOKEN ==========
const generateSignatureToken = (requestId: string, email: string): string => {
  const secret = process.env.SIGNATURE_SECRET || 'vigorre-signature-secret';
  const data = `${requestId}:${email}:${secret}`;
  return createHash('sha256').update(data).digest('hex').substring(0, 64);
};

// ========== VALIDAÇÃO DE TOKEN ==========
export const validateSignatureToken = async (token: string): Promise<SignatureRequest | null> => {
  const request = await prisma.signatureRequest.findFirst({
    where: { token },
    include: {
      document: {
        include: {
          company: true,
          responsible: true,
        },
      },
    },
  });

  if (!request) {
    return null;
  }

  if (request.expiresAt && new Date() > request.expiresAt) {
    await prisma.signatureRequest.update({
      where: { id: request.id },
      data: { status: 'expired' },
    });
    return { ...request, status: 'expired' } as SignatureRequest;
  }

  return request as SignatureRequest;
};

// ========== PROCESSAMENTO DE ASSINATURA ==========
export const processSignature = async (
  token: string,
  signatureData: string,
  fields?: Array<{ id: string; value: string }>
): Promise<SignatureRequest | null> => {
  const request = await prisma.signatureRequest.findFirst({
    where: { token },
  });

  if (!request) {
    throw new Error('Solicitação de assinatura inválida');
  }

  if (request.status === 'signed') {
    throw new Error('Documento já assinado');
  }

  if (request.status === 'declined') {
    throw new Error('Solicitação de assinatura foi recusada');
  }

  if (request.expiresAt && new Date() > request.expiresAt) {
    throw new Error('Solicitação de assinatura expirada');
  }

  if (!signatureData || signatureData.length < 100) {
    throw new Error('Assinatura inválida ou muito curta');
  }

  const updatedRequest = await prisma.signatureRequest.update({
    where: { id: request.id },
    data: {
      status: 'signed',
      signatureData,
      signatureDate: new Date(),
    },
  });

  if (fields && fields.length > 0) {
    for (const field of fields) {
      await prisma.signatureField.update({
        where: { id: field.id },
        data: { value: field.value },
      });
    }
  }

  await prisma.auditLog.create({
    data: {
      userId: 'system',
      action: 'SIGN',
      module: 'signature',
      recordId: request.id,
      newData: { signer: request.signerEmail, signedAt: new Date() },
    },
  });

  await checkAllSignatures(request.documentId);

  return updatedRequest as SignatureRequest;
};

// ========== VERIFICAÇÃO DE ASSINATURAS ==========
export const checkAllSignatures = async (documentId: string): Promise<boolean> => {
  const requests = await prisma.signatureRequest.findMany({
    where: { documentId },
  });

  const allSigned = requests.every((r) => r.status === 'signed');
  const anyDeclined = requests.some((r) => r.status === 'declined');

  if (allSigned) {
    await prisma.document.update({
      where: { id: documentId },
      data: { 
        status: 'Assinado',
        updatedAt: new Date(),
      },
    });

    await prisma.notification.create({
      data: {
        userId: 'system',
        type: 'success',
        title: '✅ Documento Assinado por Todos',
        message: `Todos os signatários assinaram o documento "${requests[0]?.documentTitle || documentId}"`,
        link: `/documentos/${documentId}`,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: 'system',
        action: 'COMPLETE',
        module: 'signature',
        recordId: documentId,
        newData: { status: 'completed', signedAt: new Date() },
      },
    });

    return true;
  }

  if (anyDeclined) {
    await prisma.document.update({
      where: { id: documentId },
      data: { 
        status: 'Recusado',
        updatedAt: new Date(),
      },
    });

    await prisma.notification.create({
      data: {
        userId: 'system',
        type: 'error',
        title: '❌ Documento Recusado',
        message: `Um signatário recusou a assinatura do documento "${requests[0]?.documentTitle || documentId}"`,
        link: `/documentos/${documentId}`,
      },
    });
  }

  return allSigned;
};

// ========== RECUSA ==========
export const declineSignature = async (
  token: string,
  reason?: string
): Promise<SignatureRequest | null> => {
  const request = await prisma.signatureRequest.findFirst({
    where: { token },
  });

  if (!request) {
    throw new Error('Solicitação de assinatura inválida');
  }

  if (request.status === 'signed') {
    throw new Error('Documento já foi assinado');
  }

  const updatedRequest = await prisma.signatureRequest.update({
    where: { id: request.id },
    data: {
      status: 'declined',
      notes: reason || null,
    },
  });

  await checkAllSignatures(request.documentId);

  return updatedRequest as SignatureRequest;
};

// ========== VISUALIZAÇÃO ==========
export const markAsViewed = async (token: string): Promise<void> => {
  await prisma.signatureRequest.updateMany({
    where: { token, status: 'pending' },
    data: { status: 'viewed' },
  });
};

// ========== CAMPOS DE ASSINATURA ==========
export const createSignatureFields = async (
  documentId: string,
  fields: SignatureFieldInput[]
): Promise<SignatureField[]> => {
  const created: SignatureField[] = [];

  for (const field of fields) {
    const result = await prisma.signatureField.create({
      data: {
        id: randomUUID(),
        documentId,
        name: field.name,
        type: field.type,
        x: field.x,
        y: field.y,
        width: field.width,
        height: field.height,
        page: field.page,
        required: field.required !== undefined ? field.required : true,
        signerId: field.signerId,
      },
    });
    created.push(result as SignatureField);
  }

  return created;
};

export const getSignatureFields = async (documentId: string): Promise<SignatureField[]> => {
  const fields = await prisma.signatureField.findMany({
    where: { documentId },
    orderBy: [
      { page: 'asc' },
      { y: 'asc' },
      { x: 'asc' },
    ],
  });
  return fields as SignatureField[];
};

export const updateSignatureField = async (
  fieldId: string,
  data: Partial<SignatureField>
): Promise<SignatureField | null> => {
  const field = await prisma.signatureField.update({
    where: { id: fieldId },
    data,
  });
  return field as SignatureField | null;
};

export const deleteSignatureField = async (fieldId: string): Promise<boolean> => {
  try {
    await prisma.signatureField.delete({
      where: { id: fieldId },
    });
    return true;
  } catch {
    return false;
  }
};

// ========== EXPIRAÇÃO ==========
export const expirePendingSignatures = async (): Promise<number> => {
  const expired = await prisma.signatureRequest.updateMany({
    where: {
      status: 'pending',
      expiresAt: { lt: new Date() },
    },
    data: { status: 'expired' },
  });

  return expired.count;
};

// ========== RELATÓRIOS ==========
export const getSignatureStats = async () => {
  const total = await prisma.signatureRequest.count();
  const byStatus = await prisma.signatureRequest.groupBy({
    by: ['status'],
    _count: true,
  });
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const todayCount = await prisma.signatureRequest.count({
    where: {
      createdAt: { gte: todayStart },
    },
  });

  return {
    total,
    today: todayCount,
    byStatus: byStatus.map(item => ({ status: item.status, count: item._count })),
  };
};

// ========== ENVIO DE CONVITE (EMAIL) ==========
export const sendSignatureInvitationEmail = async (
  requestId: string
): Promise<boolean> => {
  try {
    const request = await prisma.signatureRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      return false;
    }

    const signatureUrl = `${process.env.NEXTAUTH_URL}/assinatura/${request.token}`;
    console.log(`📧 Enviando convite para ${request.signerEmail}: ${signatureUrl}`);

    return true;
  } catch (error) {
    console.error('Erro ao enviar convite:', error);
    return false;
  }
};
