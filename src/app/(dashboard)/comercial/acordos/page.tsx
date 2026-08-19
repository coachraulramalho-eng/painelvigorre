'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';

interface Acordo {
  id: string;
  representative: string;
  client: string;
  service: string;
  percentage: string;
  validity: string;
  status: string;
}

export default function AcordosPage() {
  const [acordos, setAcordos] = useState<Acordo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAcordos();
  }, []);

  const loadAcordos = async () => {
    try {
      const response = await fetch('/api/comercial/acordos');
      if (response.ok) {
        const data = await response.json();
        setAcordos(data);
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
    { key: 'representative', label: 'Representante' },
    { key: 'client', label: 'Cliente' },
    { key: 'service', label: 'Serviço' },
    { key: 'percentage', label: 'Comissão %' },
    { key: 'validity', label: 'Vigência' },
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

      <DataTable
        columns={columns}
        data={acordos}
        loading={loading}
      />
    </div>
  );
}
