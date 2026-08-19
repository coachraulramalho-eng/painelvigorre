'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, DollarSign, CheckCircle } from 'lucide-react';

interface Comissao {
  id: string;
  representative: string;
  proposal: string;
  value: number;
  status: string;
  paymentDate: string;
}

interface Metrics {
  totalPendente: number;
  totalPago: number;
  totalPrevisto: number;
}

export default function ComissoesPage() {
  const [comissoes, setComissoes] = useState<Comissao[]>([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<Metrics>({
    totalPendente: 0,
    totalPago: 0,
    totalPrevisto: 0,
  });

  useEffect(() => {
    loadComissoes();
  }, []);

  const loadComissoes = async () => {
    try {
      const response = await fetch('/api/comercial/comissoes');
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const columns = [
    { key: 'representative', label: 'Representante' },
    { key: 'proposal', label: 'Proposta' },
    { 
      key: 'value', 
      label: 'Valor', 
      render: (value: number) => formatCurrency(value) 
    },
    { 
      key: 'status', 
      label: 'Status', 
      render: (value: string) => (
        <Badge variant={getStatusBadge(value)}>{value}</Badge>
      )
    },
    { key: 'paymentDate', label: 'Data Pagamento' },
    {
      key: 'actions',
      label: 'Ações',
      render: (_: any, row: Comissao) => (
        <div className="flex gap-1">
          {row.status === 'Pendente' && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-success">
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
                <p className="text-2xl font-bold">{formatCurrency(metrics.totalPrevisto)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendente</p>
                <p className="text-2xl font-bold text-yellow-600">{formatCurrency(metrics.totalPendente)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pago</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(metrics.totalPago)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={comissoes}
        loading={loading}
      />
    </div>
  );
}
