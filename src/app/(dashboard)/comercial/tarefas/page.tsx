'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, Edit, Trash2, CheckCircle } from 'lucide-react';

export default function TarefasPage() {
  const [tarefas, setTarefas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTarefas();
  }, []);

  const loadTarefas = async () => {
    try {
      const response = await fetch('/api/tarefas');
      if (response.ok) {
        const data = await response.json();
        setTarefas(data);
      }
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, any> = {
      'Alta': 'destructive',
      'Média': 'warning',
      'Baixa': 'secondary',
    };
    return variants[priority] || 'secondary';
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      'A fazer': 'secondary',
      'Em andamento': 'warning',
      'Concluída': 'success',
      'Cancelada': 'destructive',
      'Atrasada': 'destructive',
    };
    return variants[status] || 'secondary';
  };

  const columns = [
    { key: 'title', label: 'Título' },
    { key: 'priority', label: 'Prioridade', render: (value) => (
      <Badge variant={getPriorityBadge(value)}>{value}</Badge>
    )},
    { key: 'status', label: 'Status', render: (value) => (
      <Badge variant={getStatusBadge(value)}>{value}</Badge>
    )},
    { key: 'dueDate', label: 'Prazo' },
    { key: 'responsible', label: 'Responsável' },
    {
      key: 'actions',
      label: 'Ações',
      render: (_, row) => (
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
        title="Tarefas"
        description="Gerencie todas as tarefas do sistema"
        actions={
          <Button asChild className="gap-2">
            <Link href="/comercial/tarefas/novo">
              <Plus className="h-4 w-4" />
              Nova Tarefa
            </Link>
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={tarefas}
        loading={loading}
      />
    </div>
  );
}
