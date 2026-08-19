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
  User,
  Users,
  Briefcase,
  DollarSign,
  CheckCircle,
  XCircle,
  Search,
  Filter
} from 'lucide-react';

interface Representative {
  id: string;
  name: string;
  email: string;
  type: string;
  document: string;
  phone: string;
  region: string;
  services: string;
  status: string;
  totalCommissions: number;
  commissionsCount: number;
  agreementsCount: number;
  createdAt: string;
}

export default function RepresentantesPage() {
  const [representantes, setRepresentantes] = useState<Representative[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadRepresentantes();
  }, [statusFilter]);

  const loadRepresentantes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/comercial/representantes?${params}`);
      if (response.ok) {
        const data = await response.json();
        setRepresentantes(data.representatives || []);
      }
    } catch (error) {
      console.error('Erro ao carregar representantes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      'Ativo': 'success',
      'Inativo': 'secondary',
      'Em análise': 'warning',
    };
    return variants[status] || 'secondary';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const columns = [
    { 
      key: 'name', 
      label: 'Representante',
      render: (value: string, row: Representative) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-medium">{value}</p>
            <p className="text-xs text-muted-foreground">{row.email}</p>
          </div>
        </div>
      )
    },
    { 
      key: 'type', 
      label: 'Tipo',
      render: (value: string) => (
        <Badge variant="outline" className="text-xs">
          {value === 'Autônomo/Pessoa Física' ? 'PF' : 'PJ'}
        </Badge>
      )
    },
    { key: 'document', label: 'Documento' },
    { key: 'region', label: 'Região' },
    { 
      key: 'totalCommissions', 
      label: 'Total Comissões',
      render: (value: number) => (
        <span className="font-medium text-green-600">
          {formatCurrency(value)}
        </span>
      )
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (value: string) => (
        <Badge variant={getStatusBadge(value)}>
          {value === 'Ativo' && <CheckCircle className="h-3 w-3 mr-1" />}
          {value === 'Inativo' && <XCircle className="h-3 w-3 mr-1" />}
          {value}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (_: any, row: Representative) => (
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
  const total = representantes.length;
  const ativos = representantes.filter(r => r.status === 'Ativo').length;
  const totalComissoes = representantes.reduce((acc, r) => acc + r.totalCommissions, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Representantes"
        description="Gerencie todos os representantes comerciais"
        actions={
          <Button asChild className="gap-2">
            <Link href="/comercial/representantes/novo">
              <Plus className="h-4 w-4" />
              Novo Representante
            </Link>
          </Button>
        }
      />

      {/* Métricas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ativos</p>
                <p className="text-2xl font-bold text-green-600">{ativos}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total em Comissões</p>
                <p className="text-2xl font-bold">{formatCurrency(totalComissoes)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-600" />
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
              placeholder="Buscar representantes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadRepresentantes()}
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
          <option value="Inativo">Inativo</option>
          <option value="Em análise">Em análise</option>
        </select>
        <Button variant="outline" className="gap-2" onClick={loadRepresentantes}>
          <Filter className="h-4 w-4" />
          Aplicar Filtros
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={representantes}
        loading={loading}
        onSearch={loadRepresentantes}
      />
    </div>
  );
}
