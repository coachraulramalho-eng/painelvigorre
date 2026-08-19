'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Handshake,
  Users,
  FileText,
  Search,
  Filter,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface Acordo {
  id: string;
  representativeId: string;
  representativeName: string;
  companyId: string;
  companyName: string;
  service: string;
  percentage: number;
  fixedValue: number;
  calculationBase: string;
  validityStart: string;
  validityEnd: string;
  status: string;
  notes: string;
  createdAt: string;
}

export default function AcordosPage() {
  const [acordos, setAcordos] = useState<Acordo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadAcordos();
  }, [statusFilter]);

  const loadAcordos = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`/api/comercial/acordos?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAcordos(data.agreements || []);
      }
    } catch (error) {
      console.error('Erro ao carregar acordos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      'Ativo': 'success',
      'Encerrado': 'secondary',
      'Cancelado': 'destructive',
    };
    return variants[status] || 'secondary';
  };

  const columns = [
    { 
      key: 'representativeName', 
      label: 'Representante',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    { 
      key: 'companyName', 
      label: 'Cliente',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span>{value || 'Geral'}</span>
        </div>
      )
    },
    { key: 'service', label: 'Serviço' },
    { 
      key: 'percentage', 
      label: 'Comissão %',
      render: (value: number) => value ? `${value}%` : '-'
    },
    { 
      key: 'fixedValue', 
      label: 'Valor Fixo',
      render: (value: number) => value ? `R$ ${value}` : '-'
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (value: string) => (
        <Badge variant={getStatusBadge(value)}>
          {value === 'Ativo' && <CheckCircle className="h-3 w-3 mr-1" />}
          {value === 'Cancelado' && <XCircle className="h-3 w-3 mr-1" />}
          {value}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (_: any, row: Acordo) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Métricas
  const total = acordos.length;
  const ativos = acordos.filter(a => a.status === 'Ativo').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Acordos Comerciais"
        description="Gerencie os acordos com representantes"
        actions={
          <Button asChild className="gap-2">
            <Link href="/comercial/acordos/novo">
              <Plus className="h-4 w-4" />
              Novo Acordo
            </Link>
          </Button>
        }
      />

      {/* Métricas */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Acordos</p>
                <p className="text-2xl font-bold">{total}</p>
              </div>
              <Handshake className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Acordos Ativos</p>
                <p className="text-2xl font-bold text-green-600">{ativos}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Buscar por representante ou serviço..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Todos os Status</option>
          <option value="Ativo">Ativo</option>
          <option value="Encerrado">Encerrado</option>
          <option value="Cancelado">Cancelado</option>
        </select>
        <Button variant="outline" className="gap-2" onClick={loadAcordos}>
          <Filter className="h-4 w-4" />
          Aplicar Filtros
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={acordos}
        loading={loading}
      />
    </div>
  );
}
