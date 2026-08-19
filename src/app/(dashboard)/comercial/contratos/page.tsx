'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, Edit, Trash2, FileSignature } from 'lucide-react';

interface Contrato {
  id: string;
  title: string;
  company: string;
  value: string;
  startDate: string;
  endDate: string;
  status: string;
}

export default function ContratosPage() {
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContratos();
  }, []);

  const loadContratos = async () => {
    try {
      const response = await fetch('/api/contratos');
      if (response.ok) {
        const data = await response.json();
        setContratos(data);
      }
    } catch (error) {
      console.error('Erro ao carregar contratos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      'Ativo': 'success',
      'Próximo do vencimento': 'warning',
      'Encerrado': 'secondary',
      'Cancelado': 'destructive',
    };
    return variants[status] || 'secondary';
  };

  const columns = [
    { key: 'title', label: 'Título' },
    { key: 'company', label: 'Cliente' },
    { key: 'value', label: 'Valor' },
    { key: 'startDate', label: 'Início' },
    { key: 'endDate', label: 'Término' },
    { 
      key: 'status', 
      label: 'Status', 
      render: (value: string) => (
        <Badge variant={getStatusBadge(value)}>{value}</Badge>
      )
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (_: any, row: Contrato) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <FileSignature className="h-4 w-4" />
          </Button>
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contratos"
        description="Gerencie todos os contratos da empresa"
        actions={
          <Button asChild className="gap-2">
            <Link href="/comercial/contratos/novo">
              <Plus className="h-4 w-4" />
              Novo Contrato
            </Link>
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={contratos}
        loading={loading}
      />
    </div>
  );
}
