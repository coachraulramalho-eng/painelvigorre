import { prisma } from '@/lib/db/prisma';
import { randomUUID } from 'crypto';
import { createHash } from 'crypto';

// ========== TIPOS ==========
interface SignatureRequest {
  id: string;
  documentId: string;
  documentTitle: string;
  signerName: string;
  signerEmail: string;
  signerPhone?: string;
  status: 'pending' | 'viewed' | 'signed' | 'declined' | 'expired' | 'cancelled';
  signatureData?: string; // Base64 da assinatura
  signatureDate?: Date;
  ipAddress?: string;
  userAgent?: string;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface SignatureField {
  id: string;
  name: string;
  type: 'signature' | 'initial' | 'date' | 'text' | 'checkbox' | 'radio';
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  required: boolean;
  value?: string;
  signerId: string;
}

// ========== CRIAÇÃO DE SOLICITAÇÃO ==========
export const createSignatureRequest = async (
  documentId: string,
  signers: Array<{ name: string; email: string; phone?: string }>,
  expiresInDays: number = 7
): Promise<SignatureRequest[]> => {
  const requests: SignatureRequest[] = [];

  for (const signer of signers) {
    const id = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const request = await prisma.signatureRequest.create({
      data: {
        id,
        documentId,
        documentTitle: await getDocumentTitle(documentId),
        signerName: signer.name,
        signerEmail: signer.email,
        signerPhone: signer.phone,
        status: 'pending',
        expiresAt,
        token: generateSignatureToken(id, signer.email),
      },
    });

    requests.push(request);

    // Enviar e-mail de convite
    await sendSignatureInvitation(request, signer);
  }

  return requests;
};

// ========== GERAÇÃO DE TOKEN ==========
const generateSignatureToken = (requestId: string, email: string): string => {
  const data = `${requestId}:${email}:${process.env.SIGNATURE_SECRET}`;
  return createHash('sha256').update(data).digest('hex').substring(0, 32);
};

// ========== OBTENÇÃO DO DOCUMENTO ==========
const getDocumentTitle = async (documentId: string): Promise<string> => {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
  });
  return document?.title || 'Documento';
};

// ========== ENVIO DE CONVITE ==========
const sendSignatureInvitation = async (
  request: SignatureRequest,
  signer: { name: string; email: string }
) => {
  const signatureUrl = `${process.env.NEXTAUTH_URL}/assinatura/${request.token}`;

  // Criar notificação
  await prisma.notification.create({
    data: {
      userId: 'system',
      type: 'info',
      title: '📝 Solicitação de Assinatura',
      message: `${signer.name} foi convidado para assinar "${request.documentTitle}"`,
      link: `/documentos/${request.documentId}`,
    },
  });

  // Enviar e-mail (via service)
  // await sendSignatureEmail(signer.email, signer.name, request.documentTitle, signatureUrl);
};

// ========== PROCESSAMENTO DE ASSINATURA ==========
export const processSignature = async (
  token: string,
  signatureData: string, // Base64 da assinatura desenhada
  fields?: Array<{ id: string; value: string }>
): Promise<SignatureRequest | null> => {
  // Verificar token
  const request = await prisma.signatureRequest.findFirst({
    where: { token },
  });

  if (!request) {
    throw new Error('Solicitação de assinatura inválida');
  }

  if (request.status === 'signed') {
    throw new Error('Documento já assinado');
  }

  if (request.expiresAt && new Date() > request.expiresAt) {
    throw new Error('Solicitação de assinatura expirada');
  }

  // Atualizar solicitação
  const updatedRequest = await prisma.signatureRequest.update({
    where: { id: request.id },
    data: {
      status: 'signed',
      signatureData,
      signatureDate: new Date(),
    },
  });

  // Processar campos preenchidos
  if (fields && fields.length > 0) {
    for (const field of fields) {
      await prisma.signatureField.update({
        where: { id: field.id },
        data: { value: field.value },
      });
    }
  }

  // Verificar se todos os signatários assinaram
  await checkAllSignatures(request.documentId);

  return updatedRequest;
};

// ========== VERIFICAÇÃO DE ASSINATURAS ==========
export const checkAllSignatures = async (documentId: string): Promise<boolean> => {
  const requests = await prisma.signatureRequest.findMany({
    where: { documentId },
  });

  const allSigned = requests.every((r) => r.status === 'signed');

  if (allSigned) {
    // Atualizar status do documento
    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'Assinado' },
    });

    // Criar notificação
    await prisma.notification.create({
      data: {
        userId: 'system',
        type: 'success',
        title: '✅ Documento Assinado',
        message: `Todos os signatários assinaram o documento "${await getDocumentTitle(documentId)}"`,
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

  return prisma.signatureRequest.update({
    where: { id: request.id },
    data: {
      status: 'declined',
      notes: reason,
    },
  });
};

// ========== VISUALIZAÇÃO ==========
export const markAsViewed = async (token: string): Promise<void> => {
  await prisma.signatureRequest.updateMany({
    where: { token },
    data: { status: 'viewed' },
  });
};

// ========== CAMPOS DE ASSINATURA ==========
export const createSignatureFields = async (
  documentId: string,
  fields: Omit<SignatureField, 'id'>[]
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
        required: field.required,
        signerId: field.signerId,
      },
    });
    created.push(result);
  }

  return created;
};

export const getSignatureFields = async (documentId: string): Promise<SignatureField[]> => {
  return prisma.signatureField.findMany({
    where: { documentId },
    orderBy: { page: 'asc' },
  });
};

// ========== EXPIRAÇÃO ==========
export const expirePendingSignatures = async () => {
  const expired = await prisma.signatureRequest.updateMany({
    where: {
      status: 'pending',
      expiresAt: { lt: new Date() },
    },
    data: { status: 'expired' },
  });

  return expired.count;
};
