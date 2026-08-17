'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { SignatureStatusBadge } from '@/components/signature/SignatureStatusBadge';
import { 
  FileSignature, 
  Plus, 
  Search, 
  Filter, 
  Eye,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function AssinaturaPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const response = await fetch('/api/signature/status?documentId=all');
      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Erro ao carregar solicitações:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Pendentes', value: '12', icon: Clock, color: 'text-yellow-600' },
    { label: 'Assinados', value: '34', icon: CheckCircle, color: 'text-green-600' },
    { label: 'Recusados', value: '4', icon: XCircle, color: 'text-red-600' },
    { label: 'Expirados', value: '2', icon: AlertCircle, color: 'text-gray-600' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assinatura Digital"
        description="Gerencie solicitações de assinatura de documentos"
        badge="Novo"
        actions={
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Solicitação
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Lista */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Solicitações Recentes</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 w-48"
                />
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Filtrar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Carregando...
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileSignature className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Nenhuma solicitação de assinatura</p>
              </div>
            ) : (
              requests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <FileSignature className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium truncate">{request.documentTitle}</p>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <span>Signatário: {request.signerName}</span>
                          <span>• {request.signerEmail}</span>
                          <span>• {new Date(request.createdAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <SignatureStatusBadge status={request.status} />
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {request.status === 'pending' && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600">
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Paginação */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Mostrando 1-5 de {requests.length} solicitações
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="default" size="sm">1</Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
