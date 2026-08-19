'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Eye, 
  DollarSign,
  CheckCircle,
  Clock,
  TrendingUp,
  Search,
  Filter,
  Loader2
} from 'lucide-react';

interface Commission {
  id: string;
  representativeId: string;
  representativeName: string;
  proposalId: string;
  proposalNumber: string;
  value: number;
  status: string;
  paymentDate: string;
  notes: string;
  createdAt: string;
}

export default function ComissoesPage() {
  const [comissoes, setComissoes] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalPrevisto: 0,
    totalPendente: 0,
    totalPago: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadComissoes();
  }, [statusFilter]);

  const loadComissoes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`/api/comercial/comissoes?${params}`);
      if (response.ok) {
        const data = await response.json();
        setComissoes(data.comissoes || []);
        setMetrics(data.metrics || {});
      }
    } catch (error) {
      console.error('Erro ao carregar comissões:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      'Prevista': 'secondary',
      'Aprovada': 'success',
      'Pendente': 'warning',
      'Paga': 'success',
    };
    return variants[status] || 'secondary';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, any> = {
      'Prevista': Clock,
      'Aprovada': CheckCircle,
      'Pendente': Clock,
      'Paga': CheckCircle,
    };
    return icons[status] || Clock;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleMarkAsPaid = async (id: string) => {
    try {
      const response = await fetch(`/api/comercial/comissoes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Paga' }),
      });

      if (response.ok) {
        loadComissoes();
      }
    } catch (error) {
      console.error('Erro ao marcar como paga:', error);
    }
  };

  const columns = [
    { 
      key: 'representativeName', 
      label: 'Representante',
      render: (value: string) => (
        <span className="font-medium">{value}</span>
      )
    },
    { 
      key: 'proposalNumber', 
      label: 'Proposta',
      render: (value: string) => (
        <Badge variant="outline">#{value}</Badge>
      )
    },
    { 
      key: 'value', 
      label: 'Valor',
      render: (value: number) => (
        <span className="font-medium">{formatCurrency(value)}</span>
      )
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (value: string) => {
        const Icon = getStatusIcon(value);
        return (
          <Badge variant={getStatusBadge(value)} className="gap-1">
            <Icon className="h-3 w-3" />
            {value}
          </Badge>
        );
      }
    },
    { 
      key: 'paymentDate', 
      label: 'Data Pagamento',
      render: (value: string) => value ? new Date(value).toLocaleDateString('pt-BR') : '-'
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (_: any, row: Commission) => (
        <div className="flex gap-1">
          {row.status === 'Pendente' && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-success"
              onClick={() => handleMarkAsPaid(row.id)}
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Comissões"
        description="Gerencie as comissões dos representantes"
      />

      {/* Métricas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Previsto</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(metrics.totalPrevisto)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendente</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(metrics.totalPendente)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pago</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(metrics.totalPago)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
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
              placeholder="Buscar por representante..."
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
          <option value="Prevista">Prevista</option>
          <option value="Aprovada">Aprovada</option>
          <option value="Pendente">Pendente</option>
          <option value="Paga">Paga</option>
        </select>
        <Button variant="outline" className="gap-2" onClick={loadComissoes}>
          <Filter className="h-4 w-4" />
          Aplicar Filtros
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={comissoes}
          loading={loading}
        />
      )}
    </div>
  );
}
