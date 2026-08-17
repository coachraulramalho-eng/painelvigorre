'use client';

import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Grid3x3, 
  List, 
  Search, 
  Upload, 
  Trash2, 
  Edit, 
  Download,
  Image,
  Video,
  FileText,
  MoreVertical,
  FolderOpen,
  X,
  Check,
  Loader2,
  Eye,
  Link2,
  Tag,
  Calendar
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { formatDate, formatFileSize } from '@/lib/utils/format';

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
  uploadedByUser?: { name: string; email: string };
  campaignId?: string;
  createdAt: string;
}

interface MediaGalleryProps {
  category?: string;
  selectable?: boolean;
  onSelect?: (media: MediaFile) => void;
  onUpload?: (files: File[]) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string, data: any) => void;
}

export function MediaGallery({ 
  category, 
  selectable = false,
  onSelect,
  onUpload,
  onDelete,
  onEdit,
}: MediaGalleryProps) {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState<MediaFile | null>(null);
  const [deleting, setDeleting] = useState<MediaFile | null>(null);

  const loadMedia = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (search) params.append('search', search);
      params.append('limit', '100');

      const response = await fetch(`/api/media/list?${params}`);
      if (!response.ok) throw new Error('Erro ao carregar mídias');
      
      const data = await response.json();
      setMedia(data.media || []);
    } catch (error) {
      console.error('Erro ao carregar mídias:', error);
    } finally {
      setLoading(false);
    }
  }, [category, search]);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      for (const file of files) {
        formData.append('files', file);
      }
      formData.append('category', category || 'geral');

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Erro ao fazer upload');

      const data = await response.json();
      setMedia(prev => [...data.media, ...prev]);
      
      if (onUpload) {
        onUpload(Array.from(files));
      }
    } catch (error) {
      console.error('Erro no upload:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/media/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erro ao excluir');

      setMedia(prev => prev.filter(m => m.id !== id));
      setSelected(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });

      if (onDelete) onDelete(id);
    } catch (error) {
      console.error('Erro ao excluir:', error);
    } finally {
      setDeleting(null);
    }
  };

  const handleEdit = async (id: string, data: any) => {
    try {
      const response = await fetch(`/api/media/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Erro ao atualizar');

      const result = await response.json();
      setMedia(prev => prev.map(m => m.id === id ? result.media : m));
      setEditing(null);

      if (onEdit) onEdit(id, data);
    } catch (error) {
      console.error('Erro ao editar:', error);
    }
  };

  const handleSelect = (media: MediaFile) => {
    if (selectable && onSelect) {
      onSelect(media);
    } else {
      setSelected(prev => {
        const newSet = new Set(prev);
        if (newSet.has(media.id)) {
          newSet.delete(media.id);
        } else {
          newSet.add(media.id);
        }
        return newSet;
      });
    }
  };

  const getFileIcon = (type: string, mimeType: string) => {
    if (type === 'image') return <Image className="h-8 w-8 text-blue-500" />;
    if (type === 'video') return <Video className="h-8 w-8 text-purple-500" />;
    if (mimeType === 'application/pdf') return <FileText className="h-8 w-8 text-red-500" />;
    return <FileText className="h-8 w-8 text-gray-500" />;
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, any> = {
      image: 'default',
      video: 'secondary',
      document: 'outline',
    };
    return variants[type] || 'outline';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar arquivos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setViewMode('grid')}>
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setViewMode('list')}>
            <List className="h-4 w-4" />
          </Button>
        </div>

        <div className="relative">
          <Button 
            onClick={() => document.getElementById('file-upload')?.click()}
            className="gap-2"
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Upload
          </Button>
          <input
            id="file-upload"
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
            accept="image/*,video/*,application/pdf,.doc,.docx"
          />
        </div>

        {selected.size > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{selected.size} selecionados</Badge>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {media.map((item) => (
            <Card 
              key={item.id}
              className={`cursor-pointer hover:shadow-md transition-shadow ${
                selected.has(item.id) ? 'ring-2 ring-primary' : ''
              } ${selectable ? 'hover:ring-2 hover:ring-primary/50' : ''}`}
              onClick={() => handleSelect(item)}
            >
              <CardContent className="p-3">
                <div className="aspect-square relative bg-secondary rounded-lg overflow-hidden">
                  {item.type === 'image' && item.thumbnailUrl ? (
                    <img 
                      src={item.thumbnailUrl} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      {getFileIcon(item.type, item.mimeType)}
                    </div>
                  )}
                  
                  {selected.has(item.id) && (
                    <div className="absolute top-2 right-2 bg-primary rounded-full p-1">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>

                <div className="mt-2">
                  <p className="text-sm font-medium truncate" title={item.name}>
                    {item.name}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <Badge variant={getTypeBadge(item.type)} className="text-xs">
                      {item.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(item.size)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-1 mt-2">
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Eye className="h-3 w-3" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditing(item)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeleting(item)}>
                        <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                        Excluir
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="h-4 w-4 mr-2" />
                        Baixar
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link2 className="h-4 w-4 mr-2" />
                        Copiar Link
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary">
              <tr>
                <th className="text-left text-sm font-medium text-muted-foreground p-3">
                  <input type="checkbox" />
                </th>
                <th className="text-left text-sm font-medium text-muted-foreground p-3">Arquivo</th>
                <th className="text-left text-sm font-medium text-muted-foreground p-3">Categoria</th>
                <th className="text-left text-sm font-medium text-muted-foreground p-3">Tags</th>
                <th className="text-left text-sm font-medium text-muted-foreground p-3">Tamanho</th>
                <th className="text-left text-sm font-medium text-muted-foreground p-3">Enviado</th>
                <th className="text-right text-sm font-medium text-muted-foreground p-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {media.map((item) => (
                <tr key={item.id} className="border-t hover:bg-secondary/50">
                  <td className="p-3">
                    <input 
                      type="checkbox" 
                      checked={selected.has(item.id)}
                      onChange={() => handleSelect(item)}
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded bg-secondary flex items-center justify-center">
                        {getFileIcon(item.type, item.mimeType)}
                      </div>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.originalName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge variant="outline">{item.category}</Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {item.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{item.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-sm">{formatFileSize(item.size)}</td>
                  <td className="p-3 text-sm">
                    {formatDate(item.createdAt)}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Download className="h-3 w-3" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditing(item)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDeleting(item)}>
                            <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {media.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <FolderOpen className="h-16 w-16 mb-4 opacity-30" />
          <p className="text-lg font-medium">Nenhum arquivo encontrado</p>
          <p className="text-sm">Faça upload de arquivos para começar</p>
        </div>
      )}

      {/* Edit Dialog */}
      {editing && (
        <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Arquivo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome</label>
                <Input 
                  defaultValue={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Categoria</label>
                <Input 
                  defaultValue={editing.category}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Tags (separadas por vírgula)</label>
                <Input 
                  defaultValue={editing.tags.join(', ')}
                  onChange={(e) => setEditing({ 
                    ...editing, 
                    tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                  })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Descrição</label>
                <Input 
                  defaultValue={editing.description || ''}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
              <Button onClick={() => handleEdit(editing.id, editing)}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation */}
      {deleting && (
        <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
            </DialogHeader>
            <p>
              Tem certeza que deseja excluir <strong>{deleting.name}</strong>?
              Esta ação não pode ser desfeita.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleting(null)}>Cancelar</Button>
              <Button variant="destructive" onClick={() => handleDelete(deleting.id)}>
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
