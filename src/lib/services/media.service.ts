import { prisma } from '@/lib/db/prisma';
import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// ========== TIPOS ==========
interface MediaFile {
  id: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  type: 'image' | 'video' | 'document' | 'other';
  category: string;
  tags: string[];
  description?: string;
  uploadedBy: string;
  campaignId?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UploadOptions {
  category: string;
  tags?: string[];
  description?: string;
  campaignId?: string;
  makeThumbnail?: boolean;
  thumbnailSize?: number;
  resizeOptions?: {
    width?: number;
    height?: number;
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  };
}

// ========== CONFIGURAÇÃO ==========
const MEDIA_DIR = path.join(process.cwd(), 'public', 'media');
const THUMBNAIL_DIR = path.join(process.cwd(), 'public', 'media', 'thumbnails');
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'video/mp4',
  'video/webm',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const THUMBNAIL_SIZE = 300;

// ========== INICIALIZAÇÃO ==========
const initializeDirectories = () => {
  if (!fs.existsSync(MEDIA_DIR)) {
    fs.mkdirSync(MEDIA_DIR, { recursive: true });
  }
  if (!fs.existsSync(THUMBNAIL_DIR)) {
    fs.mkdirSync(THUMBNAIL_DIR, { recursive: true });
  }
};

initializeDirectories();

// ========== UPLOAD ==========
export const uploadMediaFile = async (
  file: File,
  userId: string,
  options: UploadOptions
): Promise<MediaFile> => {
  // Validar arquivo
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error(`Tipo de arquivo não permitido: ${file.type}`);
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`Arquivo muito grande. Máximo: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }

  // Gerar nome único
  const id = randomUUID();
  const extension = file.name.split('.').pop() || '';
  const filename = `${id}.${extension}`;
  const filepath = path.join(MEDIA_DIR, filename);

  // Salvar arquivo
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(filepath, buffer);

  // Detectar tipo
  const mediaType = detectMediaType(file.type);

  // Processar imagem se necessário
  let processedBuffer: Buffer = buffer;

  if (mediaType === 'image' && options.resizeOptions) {
    const resized = await sharp(buffer)
      .resize(
        options.resizeOptions.width,
        options.resizeOptions.height,
        { fit: options.resizeOptions.fit || 'cover' }
      )
      .toBuffer();
    
    // Salvar a imagem redimensionada (sobrescrever)
    fs.writeFileSync(filepath, resized);
    processedBuffer = resized;
  }

  // Gerar thumbnail se for imagem
  let thumbnailUrl: string | undefined;
  if (mediaType === 'image' && options.makeThumbnail !== false) {
    thumbnailUrl = await generateThumbnail(filename, options.thumbnailSize || THUMBNAIL_SIZE);
  }

  // Salvar no banco
  const media = await prisma.media.create({
    data: {
      id,
      name: file.name,
      originalName: file.name,
      mimeType: file.type,
      size: processedBuffer.length,
      url: `/media/${filename}`,
      thumbnailUrl: thumbnailUrl ? `/media/thumbnails/${thumbnailUrl}` : undefined,
      type: mediaType,
      category: options.category,
      tags: options.tags || [],
      description: options.description,
      uploadedBy: userId,
      campaignId: options.campaignId,
    },
  });

  return media;
};

export const uploadMultipleMedia = async (
  files: File[],
  userId: string,
  options: UploadOptions
): Promise<MediaFile[]> => {
  const results: MediaFile[] = [];
  
  for (const file of files) {
    try {
      const media = await uploadMediaFile(file, userId, options);
      results.push(media);
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
    }
  }

  return results;
};

// ========== THUMBNAIL ==========
export const generateThumbnail = async (
  filename: string,
  size: number = THUMBNAIL_SIZE
): Promise<string> => {
  const inputPath = path.join(MEDIA_DIR, filename);
  const outputFilename = `thumb-${filename}`;
  const outputPath = path.join(THUMBNAIL_DIR, outputFilename);

  try {
    await sharp(inputPath)
      .resize(size, size, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: 80 })
      .toFile(outputPath);

    return outputFilename;
  } catch (error) {
    console.error('Erro ao gerar thumbnail:', error);
    return '';
  }
};

// ========== DETECÇÃO ==========
const detectMediaType = (mimeType: string): MediaFile['type'] => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType === 'application/pdf') return 'document';
  if (mimeType.includes('document') || mimeType.includes('word')) return 'document';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'document';
  return 'other';
};

// ========== CRUD ==========
export const getMediaById = async (id: string): Promise<MediaFile | null> => {
  return prisma.media.findUnique({
    where: { id },
    include: {
      uploadedByUser: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

export const getMediaByCategory = async (category: string): Promise<MediaFile[]> => {
  return prisma.media.findMany({
    where: { category },
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
  });
};

export const getMediaByTags = async (tags: string[]): Promise<MediaFile[]> => {
  return prisma.media.findMany({
    where: {
      tags: {
        hasSome: tags,
      },
    },
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
  });
};

export const getMediaByCampaign = async (campaignId: string): Promise<MediaFile[]> => {
  return prisma.media.findMany({
    where: { campaignId },
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
  });
};

export const deleteMedia = async (id: string): Promise<boolean> => {
  try {
    const media = await prisma.media.findUnique({
      where: { id },
    });

    if (!media) return false;

    // Deletar arquivo físico
    const filepath = path.join(MEDIA_DIR, path.basename(media.url));
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }

    // Deletar thumbnail
    if (media.thumbnailUrl) {
      const thumbPath = path.join(THUMBNAIL_DIR, path.basename(media.thumbnailUrl));
      if (fs.existsSync(thumbPath)) {
        fs.unlinkSync(thumbPath);
      }
    }

    // Deletar registro
    await prisma.media.delete({
      where: { id },
    });

    return true;
  } catch (error) {
    console.error('Erro ao deletar mídia:', error);
    return false;
  }
};

export const updateMedia = async (
  id: string,
  data: Partial<Pick<MediaFile, 'name' | 'description' | 'tags' | 'category'>>
): Promise<MediaFile | null> => {
  return prisma.media.update({
    where: { id },
    data,
    include: {
      uploadedByUser: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

// ========== ESTATÍSTICAS ==========
export const getMediaStats = async () => {
  const total = await prisma.media.count();
  const byType = await prisma.media.groupBy({
    by: ['type'],
    _count: true,
  });
  const byCategory = await prisma.media.groupBy({
    by: ['category'],
    _count: true,
  });
  const totalSize = await prisma.media.aggregate({
    _sum: {
      size: true,
    },
  });

  return {
    total,
    totalSizeMB: totalSize._sum.size ? (totalSize._sum.size / 1024 / 1024).toFixed(2) : 0,
    byType: byType.map(item => ({ type: item.type, count: item._count })),
    byCategory: byCategory.map(item => ({ category: item.category, count: item._count })),
  };
};

// ========== BUSCA AVANÇADA ==========
export const searchMedia = async (
  query: string,
  filters?: {
    category?: string;
    type?: string;
    tags?: string[];
    startDate?: Date;
    endDate?: Date;
  },
  limit: number = 50,
  offset: number = 0
): Promise<{ items: MediaFile[]; total: number }> => {
  const where: any = {};

  if (query) {
    where.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
      { tags: { has: query } },
    ];
  }

  if (filters?.category) where.category = filters.category;
  if (filters?.type) where.type = filters.type;
  if (filters?.tags && filters.tags.length > 0) {
    where.tags = { hasSome: filters.tags };
  }
  if (filters?.startDate) where.createdAt = { gte: filters.startDate };
  if (filters?.endDate) {
    where.createdAt = { ...where.createdAt, lte: filters.endDate };
  }

  const [items, total] = await Promise.all([
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

  return { items, total };
};
