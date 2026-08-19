'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, Edit, Trash2, CheckCircle } from 'lucide-react';

interface Followup {
  id: string;
  lead: string;
  description: string;
  date: string;
  status: string;
  responsible: string;
}

export default function FollowupsPage() {
  const [followups, setFollowups] = useState<Followup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFollowups();
  }, []);

  const loadFollowups = async () => {
    try {
      const response = await fetch('/api/comercial/followups');
      if (response.ok) {
        const data = await response.json();
        setFollowups(data);
      }
    } catch (error) {
      console.error('Erro ao carregar follow-ups:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      'Pendente': 'warning',
      'Concluído': 'success',
      'Atrasado': 'destructive',
      'Cancelado': 'secondary',
    };
    return variants[status] || 'secondary';
  };

  const columns = [
    { key: 'lead', label: 'Lead' },
    { key: 'description', label: 'Descrição' },
    { key: 'date', label: 'Data' },
    { 
      key: 'status', 
      label: 'Status', 
      render: (value: string) => (
        <Badge variant={getStatusBadge(value)}>{value}</Badge>
      )
    },
    { key: 'responsible', label: 'Responsável' },
    {
      key: 'actions',
      label: 'Ações',
      render: (_: any, row: Followup) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <CheckCircle className="h-4 w-4 text-success" />
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
        title="Follow-ups"
        description="Gerencie todos os follow-ups"
        actions={
          <Button asChild className="gap-2">
            <Link href="/comercial/followups/novo">
              <Plus className="h-4 w-4" />
              Novo Follow-up
            </Link>
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={followups}
        loading={loading}
      />
    </div>
  );
}
