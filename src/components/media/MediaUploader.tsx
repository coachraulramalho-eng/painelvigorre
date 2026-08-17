'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils/format';
import { 
  Upload, 
  X, 
  File, 
  Image, 
  Video, 
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  preview?: string;
}

interface MediaUploaderProps {
  onUploadComplete?: (files: UploadFile[]) => void;
  onUploadStart?: () => void;
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
  category?: string;
}

export function MediaUploader({
  onUploadComplete,
  onUploadStart,
  accept = 'image/*,video/*,application/pdf,.doc,.docx',
  maxSize = 50 * 1024 * 1024, // 50MB
  multiple = true,
  category = 'geral',
}: MediaUploaderProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      progress: 0,
      status: 'pending',
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
    }));

    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: accept ? { '': [accept] } : undefined,
    maxSize,
    multiple,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
  });

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    if (onUploadStart) onUploadStart();

    const formData = new FormData();
    const pendingFiles = files.filter(f => f.status === 'pending');

    for (const file of pendingFiles) {
      formData.append('files', file.file);
    }
    formData.append('category', category);

    try {
      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erro ao fazer upload');
      }

      const data = await response.json();

      // Atualizar status dos arquivos
      setFiles(prev => 
        prev.map(f => {
          if (f.status === 'pending') {
            return { ...f, status: 'success', progress: 100 };
          }
          return f;
        })
      );

      if (onUploadComplete) {
        onUploadComplete(data.media);
      }
    } catch (error) {
      setFiles(prev =>
        prev.map(f => {
          if (f.status === 'pending') {
            return { ...f, status: 'error', error: error instanceof Error ? error.message : 'Erro no upload' };
          }
          return f;
        })
      );
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return Image;
    if (file.type.startsWith('video/')) return Video;
    if (file.type === 'application/pdf') return FileText;
    return File;
  };

  const getFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors',
          isDragging ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'
        )}
      >
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-lg font-medium">
          {isDragging ? 'Solte os arquivos aqui' : 'Arraste arquivos ou clique para selecionar'}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          PNG, JPG, GIF, WebP, SVG, MP4, PDF, DOC, DOCX • até {maxSize / (1024 * 1024)}MB
        </p>
      </div>

      {/* Lista de Arquivos */}
      {files.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">{files.length} arquivo(s)</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFiles([])}
                  disabled={isUploading}
                >
                  Limpar todos
                </Button>
                <Button
                  size="sm"
                  onClick={uploadFiles}
                  disabled={isUploading || files.every(f => f.status === 'success')}
                  className="gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Enviar {files.filter(f => f.status === 'pending').length} arquivo(s)
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {files.map((file) => {
                const Icon = getFileIcon(file.file);
                return (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 p-2 bg-secondary rounded-lg"
                  >
                    {file.preview ? (
                      <img
                        src={file.preview}
                        alt={file.file.name}
                        className="h-10 w-10 rounded object-cover"
                      />
                    ) : (
                      <Icon className="h-8 w-8 text-muted-foreground" />
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {getFileSize(file.file.size)}
                      </p>
                    </div>

                    {file.status === 'uploading' && (
                      <div className="w-24">
                        <Progress value={file.progress} className="h-2" />
                      </div>
                    )}

                    {file.status === 'success' && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}

                    {file.status === 'error' && (
                      <div className="flex items-center gap-1 text-red-500">
                        <AlertCircle className="h-5 w-5" />
                        <span className="text-xs">{file.error}</span>
                      </div>
                    )}

                    {file.status === 'pending' && !isUploading && (
                      <button
                        onClick={() => removeFile(file.id)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
