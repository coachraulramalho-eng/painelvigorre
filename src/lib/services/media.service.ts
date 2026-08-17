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
    throw new Error('Tipo de arquivo não permitido');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Arquivo muito grande. Máximo: 50MB');
  }

  // Gerar nome único
  const id = randomUUID();
  const extension = file.name.split('.').pop();
  const filename = `${id}.${extension}`;
  const filepath = path.join(MEDIA_DIR, filename);

  // Salvar arquivo
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(filepath, buffer);

  // Detectar tipo
  const mediaType = detectMediaType(file.type);

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
      size: file.size,
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
  return 'other';
};

// ========== CRUD ==========
export const getMediaById = async (id: string): Promise<MediaFile | null> => {
  return prisma.media.findUnique({
    where: { id },
  });
};

export const getMediaByCategory = async (category: string): Promise<MediaFile[]> => {
  return prisma.media.findMany({
    where: { category },
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
    orderBy: { createdAt: 'desc' },
  });
};

export const getMediaByCampaign = async (campaignId: string): Promise<MediaFile[]> => {
  return prisma.media.findMany({
    where: { campaignId },
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

  return {
    total,
    byType: byType.map(item => ({ type: item.type, count: item._count })),
    byCategory: byCategory.map(item => ({ category: item.category, count: item._count })),
  };
};
