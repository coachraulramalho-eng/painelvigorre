import QRCode from 'qrcode';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// ========== TIPOS ==========
interface QRCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  format?: 'dataURL' | 'svg' | 'buffer' | 'png';
  logo?: {
    path?: string;
    base64?: string;
    size?: number;
    margin?: number;
  };
}

// ========== CAMINHO DA LOGO ==========
const LOGO_PATH = path.join(process.cwd(), 'public', 'logo-vigorre-qr.png');

// ========== GERAÇÃO DE QR CODE ==========
export const generateQRCodeDataURL = async (
  data: string,
  options: QRCodeOptions = {}
): Promise<string> => {
  const defaultOptions: QRCodeOptions = {
    width: 400,
    margin: 2,
    color: {
      dark: '#0B2B4A',
      light: '#FFFFFF',
    },
    errorCorrectionLevel: 'H',
  };

  const finalOptions = { ...defaultOptions, ...options };

  try {
    let qrBuffer = await QRCode.toBuffer(data, {
      width: finalOptions.width,
      margin: finalOptions.margin,
      color: finalOptions.color,
      errorCorrectionLevel: finalOptions.errorCorrectionLevel,
      type: 'png',
    });

    // Se tiver logo, sobrepor
    if (finalOptions.logo) {
      qrBuffer = await overlayLogo(qrBuffer, finalOptions.logo);
    }

    return `data:image/png;base64,${qrBuffer.toString('base64')}`;
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
    width: 400,
    margin: 2,
    color: {
      dark: '#0B2B4A',
      light: '#FFFFFF',
    },
    errorCorrectionLevel: 'H',
  };

  const finalOptions = { ...defaultOptions, ...options };

  try {
    let qrBuffer = await QRCode.toBuffer(data, {
      width: finalOptions.width,
      margin: finalOptions.margin,
      color: finalOptions.color,
      errorCorrectionLevel: finalOptions.errorCorrectionLevel,
      type: 'png',
    });

    if (finalOptions.logo) {
      qrBuffer = await overlayLogo(qrBuffer, finalOptions.logo);
    }

    return qrBuffer;
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
    width: 400,
    margin: 2,
    color: {
      dark: '#0B2B4A',
      light: '#FFFFFF',
    },
    errorCorrectionLevel: 'H',
  };

  const finalOptions = { ...defaultOptions, ...options };

  try {
    // SVG não suporta logo diretamente, usamos buffer e convertemos
    if (finalOptions.logo) {
      const buffer = await generateQRCodeBuffer(data, finalOptions);
      return `data:image/png;base64,${buffer.toString('base64')}`;
    }

    return await QRCode.toString(data, { 
      ...finalOptions, 
      type: 'svg' 
    });
  } catch (error) {
    console.error('Erro ao gerar QR Code SVG:', error);
    throw error;
  }
};

// ========== SOBREPOSIÇÃO DE LOGO ==========
export const overlayLogo = async (
  qrBuffer: Buffer,
  logoOptions: { path?: string; base64?: string; size?: number; margin?: number }
): Promise<Buffer> => {
  try {
    // Carregar logo
    let logoBuffer: Buffer;

    if (logoOptions.base64) {
      logoBuffer = Buffer.from(logoOptions.base64.split(',')[1] || logoOptions.base64, 'base64');
    } else if (logoOptions.path) {
      logoBuffer = fs.readFileSync(logoOptions.path);
    } else {
      // Usar logo padrão
      logoBuffer = fs.readFileSync(LOGO_PATH);
    }

    // Obter dimensões do QR Code
    const qrMetadata = await sharp(qrBuffer).metadata();
    const qrSize = qrMetadata.width || 400;

    // Calcular tamanho do logo
    const logoSize = logoOptions.size || Math.round(qrSize * 0.25);
    const margin = logoOptions.margin || Math.round(logoSize * 0.1);

    // Criar imagem com o logo centralizado
    const result = await sharp(qrBuffer)
      .composite([
        {
          input: await sharp(logoBuffer)
            .resize(logoSize, logoSize, {
              fit: 'contain',
              background: { r: 255, g: 255, b: 255, alpha: 1 },
            })
            .toBuffer(),
          gravity: 'center',
        },
      ])
      .png()
      .toBuffer();

    return result;
  } catch (error) {
    console.error('Erro ao sobrepor logo:', error);
    // Retornar QR Code sem logo em caso de erro
    return qrBuffer;
  }
};

// ========== VALIDAÇÃO ==========
export const validateQRCodeData = (data: string): boolean => {
  try {
    const parsed = JSON.parse(data);
    return parsed && typeof parsed === 'object';
  } catch {
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

// ========== GERAÇÃO COM LOGO (FUNÇÃO ESPECÍFICA) ==========
export const generateQRCodeWithLogo = async (
  data: string,
  logoBase64?: string,
  options: QRCodeOptions = {}
): Promise<string> => {
  const finalOptions: QRCodeOptions = {
    ...options,
    logo: {
      base64: logoBase64,
      size: 100,
      margin: 10,
    },
  };

  return generateQRCodeDataURL(data, finalOptions);
};

// ========== GERAR QR CODE DE PAGAMENTO COM LOGO ==========
export const generatePaymentQRCodeWithLogo = async (
  paymentLink: string,
  value: number,
  client: string,
  logoBase64?: string
): Promise<string> => {
  const data = JSON.stringify({
    type: 'payment',
    link: paymentLink,
    value,
    client,
    timestamp: new Date().toISOString(),
  });

  return generateQRCodeWithLogo(data, logoBase64, {
    width: 300,
    color: {
      dark: '#0B2B4A',
      light: '#FFFFFF',
    },
    logo: {
      size: 80,
      margin: 8,
    },
  });
};

// ========== GERAR QR CODE DE PROPOSTA COM LOGO ==========
export const generateProposalQRCodeWithLogo = async (
  proposalId: string,
  proposalNumber: string,
  logoBase64?: string
): Promise<string> => {
  const data = JSON.stringify({
    type: 'proposal',
    id: proposalId,
    number: proposalNumber,
    url: `${process.env.NEXTAUTH_URL}/comercial/propostas/${proposalId}`,
  });

  return generateQRCodeWithLogo(data, logoBase64, {
    width: 280,
    color: {
      dark: '#0B2B4A',
      light: '#FFFFFF',
    },
    logo: {
      size: 70,
      margin: 6,
    },
  });
};

// ========== GERAR QR CODE DE CONTRATO COM LOGO ==========
export const generateContractQRCodeWithLogo = async (
  contractId: string,
  contractTitle: string,
  logoBase64?: string
): Promise<string> => {
  const data = JSON.stringify({
    type: 'contract',
    id: contractId,
    title: contractTitle,
    url: `${process.env.NEXTAUTH_URL}/contratos/${contractId}`,
  });

  return generateQRCodeWithLogo(data, logoBase64, {
    width: 280,
    color: {
      dark: '#0B2B4A',
      light: '#FFFFFF',
    },
    logo: {
      size: 70,
      margin: 6,
    },
  });
};
