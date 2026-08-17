'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Download,
  Eye,
  Edit,
  Trash2,
  FileSignature,
  Calendar,
  Building,
  User,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FolderOpen
} from 'lucide-react';

export default function DocumentosPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('todos');

  useEffect(() => {
    loadDocuments();
  }, [search, activeTab]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (activeTab !== 'todos') params.append('category', activeTab);
      params.append('limit', '50');

      const response = await fetch(`/api/documents?${params}`);
      if (!response.ok) throw new Error('Erro ao carregar documentos');
      
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      'Ativo': 'success',
      'Arquivado': 'secondary',
      'Assinado': 'success',
      'Pendente': 'warning',
      'Recusado': 'destructive',
      'Expirado': 'secondary',
    };
    return variants[status] || 'default';
  };

  const getFileIcon = (fileUrl: string) => {
    const extension = fileUrl.split('.').pop()?.toLowerCase();
    const icons: Record<string, any> = {
      pdf: '📄',
      doc: '📝',
      docx: '📝',
      xls: '📊',
      xlsx: '📊',
      jpg: '🖼️',
      jpeg: '🖼️',
      png: '🖼️',
      webp: '🖼️',
    };
    return icons[extension || ''] || '📄';
  };

  const categories = [
    { value: 'todos', label: 'Todos' },
    { value: 'Contratos', label: 'Contratos' },
    { value: 'Propostas', label: 'Propostas' },
    { value: 'Documentos empresariais', label: 'Empresariais' },
    { value: 'Funcionários', label: 'Funcionários' },
    { value: 'Representantes', label: 'Representantes' },
    { value: 'Fornecedores', label: 'Fornecedores' },
    { value: 'Materiais comerciais', label: 'Comerciais' },
    { value: 'Outros', label: 'Outros' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documentos"
        description="Gerencie todos os documentos da Vigorre"
        badge={`${documents.length} documentos`}
        actions={
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Documento
          </Button>
        }
      />

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar documentos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filtros
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap">
          {categories.map((cat) => (
            <TabsTrigger key={cat.value} value={cat.value}>
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>Nenhum documento encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((doc) => (
                <Card key={doc.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="text-2xl">
                          {getFileIcon(doc.fileUrl)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium truncate">{doc.title}</p>
                            <Badge variant="outline" className="text-xs">
                              v{doc.version || '1.0'}
                            </Badge>
                            <Badge variant={getStatusBadge(doc.status)}>
                              {doc.status}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <FolderOpen className="h-3 w-3" />
                              {doc.category}
                            </span>
                            {doc.company && (
                              <span className="flex items-center gap-1">
                                <Building className="h-3 w-3" />
                                {doc.company.name}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {doc.responsible?.name || '—'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(doc.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          {doc.notes && (
                            <p className="text-sm text-muted-foreground mt-1 truncate">
                              {doc.notes}
                            </p>
                          )}
                          {doc.signatureRequests && doc.signatureRequests.length > 0 && (
                            <div className="flex items-center gap-2 mt-2">
                              <FileSignature className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {doc.signatureRequests.filter((s: any) => s.status === 'signed').length}/
                                {doc.signatureRequests.length} assinaturas
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
