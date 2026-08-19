'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Shield, 
  Users,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface Perfil {
  id: string;
  name: string;
  description: string;
  isMaster: boolean;
  usersCount: number;
  permissionsCount: number;
  createdAt: string;
}

export default function PerfisPage() {
  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPerfis();
  }, []);

  const loadPerfis = async () => {
    try {
      const response = await fetch('/api/admin/roles');
      if (response.ok) {
        const data = await response.json();
        setPerfis(data);
      }
    } catch (error) {
      console.error('Erro ao carregar perfis:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { 
      key: 'name', 
      label: 'Perfil',
      render: (value: string, row: Perfil) => (
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{value}</span>
          {row.isMaster && (
            <Badge variant="default" className="ml-2">Master</Badge>
          )}
        </div>
      )
    },
    { key: 'description', label: 'Descrição' },
    { 
      key: 'usersCount', 
      label: 'Usuários',
      render: (value: number) => (
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>{value}</span>
        </div>
      )
    },
    { 
      key: 'permissionsCount', 
      label: 'Permissões',
      render: (value: number) => (
        <Badge variant="outline">{value} módulos</Badge>
      )
    },
    { 
      key: 'createdAt', 
      label: 'Criado em',
      render: (value: string) => new Date(value).toLocaleDateString('pt-BR')
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (_: any, row: Perfil) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Eye className="h-4 w-4" />
          </Button>
          {!row.isMaster && (
            <>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Perfis de Acesso"
        description="Gerencie os perfis e permissões do sistema"
        actions={
          <Button asChild className="gap-2">
            <Link href="/seguranca/perfis/novo">
              <Plus className="h-4 w-4" />
              Novo Perfil
            </Link>
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={perfis}
        loading={loading}
      />
    </div>
  );
}
