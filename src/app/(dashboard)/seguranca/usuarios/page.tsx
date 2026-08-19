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
  User,
  Shield,
  CheckCircle,
  XCircle,
  Lock,
  Unlock
} from 'lucide-react';

interface Usuario {
  id: string;
  name: string;
  email: string;
  active: boolean;
  roles: string[];
  lastLoginAt: string;
  createdAt: string;
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsuarios();
  }, []);

  const loadUsuarios = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsuarios(data);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentStatus }),
      });

      if (response.ok) {
        loadUsuarios();
      }
    } catch (error) {
      console.error('Erro ao alterar status do usuário:', error);
    }
  };

  const columns = [
    { 
      key: 'name', 
      label: 'Usuário',
      render: (value: string, row: Usuario) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="font-medium">{value}</p>
            <p className="text-xs text-muted-foreground">{row.email}</p>
          </div>
        </div>
      )
    },
    { 
      key: 'roles', 
      label: 'Perfis',
      render: (value: string[]) => (
        <div className="flex flex-wrap gap-1">
          {value.map((role) => (
            <Badge key={role} variant="outline" className="text-xs">
              {role}
            </Badge>
          ))}
        </div>
      )
    },
    { 
      key: 'active', 
      label: 'Status',
      render: (value: boolean) => (
        <Badge variant={value ? 'success' : 'secondary'}>
          {value ? (
            <CheckCircle className="h-3 w-3 mr-1" />
          ) : (
            <XCircle className="h-3 w-3 mr-1" />
          )}
          {value ? 'Ativo' : 'Inativo'}
        </Badge>
      )
    },
    { 
      key: 'lastLoginAt', 
      label: 'Último Login',
      render: (value: string) => value ? new Date(value).toLocaleString('pt-BR') : 'Nunca'
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (_: any, row: Usuario) => (
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => toggleUserStatus(row.id, row.active)}
          >
            {row.active ? (
              <Lock className="h-4 w-4 text-destructive" />
            ) : (
              <Unlock className="h-4 w-4 text-success" />
            )}
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
        title="Usuários"
        description="Gerencie os usuários do sistema"
        actions={
          <Button asChild className="gap-2">
            <Link href="/seguranca/usuarios/novo">
              <Plus className="h-4 w-4" />
              Novo Usuário
            </Link>
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={usuarios}
        loading={loading}
      />
    </div>
  );
}
