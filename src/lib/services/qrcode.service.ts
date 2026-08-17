import QRCode from 'qrcode';

// ========== TIPOS ==========
interface QRCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  format?: 'dataURL' | 'svg' | 'buffer';
}

// ========== GERAÇÃO DE QR CODE ==========
export const generateQRCodeDataURL = async (
  data: string,
  options: QRCodeOptions = {}
): Promise<string> => {
  const defaultOptions: QRCodeOptions = {
    width: 300,
    margin: 2,
    color: {
      dark: '#0B2B4A',
      light: '#FFFFFF',
    },
    errorCorrectionLevel: 'H',
  };

  const finalOptions = { ...defaultOptions, ...options };

  try {
    return await QRCode.toDataURL(data, finalOptions);
  } catch (error) {
    console.error('Erro ao gerar QR Code:', error);
    throw error;
  }
};

export const generateQRCodeBuffer = async (
  data: string,
  options: QRCodeOptions = {}
): Promise<Buffer> => {
  const defaultOptions: QRCodeOptions = {
    width: 300,
    margin: 2,
    color: {
      dark: '#0B2B4A',
      light: '#FFFFFF',
    },
    errorCorrectionLevel: 'H',
  };

  const finalOptions = { ...defaultOptions, ...options };

  try {
    return await QRCode.toBuffer(data, finalOptions);
  } catch (error) {
    console.error('Erro ao gerar QR Code:', error);
    throw error;
  }
};

export const generateQRCodeSVG = async (
  data: string,
  options: QRCodeOptions = {}
): Promise<string> => {
  const defaultOptions: QRCodeOptions = {
    width: 300,
    margin: 2,
    color: {
      dark: '#0B2B4A',
      light: '#FFFFFF',
    },
    errorCorrectionLevel: 'H',
  };

  const finalOptions = { ...defaultOptions, ...options };

  try {
    return await QRCode.toString(data, { ...finalOptions, type: 'svg' });
  } catch (error) {
    console.error('Erro ao gerar QR Code SVG:', error);
    throw error;
  }
};

// ========== FUNÇÕES ESPECÍFICAS ==========
export const generatePaymentQRCode = async (
  paymentLink: string,
  value: number,
  client: string
): Promise<string> => {
  const data = JSON.stringify({
    type: 'payment',
    link: paymentLink,
    value,
    client,
    timestamp: new Date().toISOString(),
  });

  return generateQRCodeDataURL(data, {
    width: 250,
    color: {
      dark: '#0B2B4A',
      light: '#FFFFFF',
    },
  });
};

export const generateProposalQRCode = async (
  proposalId: string,
  proposalNumber: string
): Promise<string> => {
  const data = JSON.stringify({
    type: 'proposal',
    id: proposalId,
    number: proposalNumber,
    url: `${process.env.NEXTAUTH_URL}/comercial/propostas/${proposalId}`,
  });

  return generateQRCodeDataURL(data, {
    width: 200,
    color: {
      dark: '#0B2B4A',
      light: '#FFFFFF',
    },
  });
};

export const generateContractQRCode = async (
  contractId: string,
  contractTitle: string
): Promise<string> => {
  const data = JSON.stringify({
    type: 'contract',
    id: contractId,
    title: contractTitle,
    url: `${process.env.NEXTAUTH_URL}/contratos/${contractId}`,
  });

  return generateQRCodeDataURL(data, {
    width: 200,
    color: {
      dark: '#0B2B4A',
      light: '#FFFFFF',
    },
  });
};

export const generateDocumentQRCode = async (
  documentId: string,
  documentTitle: string
): Promise<string> => {
  const data = JSON.stringify({
    type: 'document',
    id: documentId,
    title: documentTitle,
    url: `${process.env.NEXTAUTH_URL}/documentos/${documentId}`,
  });

  return generateQRCodeDataURL(data, {
    width: 200,
    color: {
      dark: '#0B2B4A',
      light: '#FFFFFF',
    },
  });
};

export const generateLeadQRCode = async (
  leadId: string,
  leadName: string
): Promise<string> => {
  const data = JSON.stringify({
    type: 'lead',
    id: leadId,
    name: leadName,
    url: `${process.env.NEXTAUTH_URL}/comercial/crm/${leadId}`,
  });

  return generateQRCodeDataURL(data, {
    width: 200,
    color: {
      dark: '#0B2B4A',
      light: '#FFFFFF',
    },
  });
};

// ========== QR CODE COM LOGO (PREPARADO) ==========
export const generateQRCodeWithLogo = async (
  data: string,
  logoBase64: string,
  options: QRCodeOptions = {}
): Promise<string> => {
  // Esta função requer uma biblioteca adicional como canvas/sharp
  // Para implementação completa, usaríamos canvas para sobrepor o logo
  
  // Exemplo simplificado - retorna QR Code base por enquanto
  console.log('Logo será sobreposto ao QR Code (requer implementação com canvas/sharp)');
  return generateQRCodeDataURL(data, options);
};

// ========== VALIDAÇÃO ==========
export const validateQRCodeData = (data: string): boolean => {
  try {
    const parsed = JSON.parse(data);
    return parsed && typeof parsed === 'object';
  } catch {
    // Se não for JSON, consideramos válido (URL, texto, etc)
    return true;
  }
};

// ========== DECODE ==========
export const decodeQRCodeData = (data: string): any => {
  try {
    return JSON.parse(data);
  } catch {
    return { raw: data };
  }
};
