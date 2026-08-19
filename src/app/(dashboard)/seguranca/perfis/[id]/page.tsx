'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { 
  ArrowLeft, 
  Edit, 
  Shield, 
  Users, 
  Key,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  FileText,
  DollarSign,
  Briefcase,
  Settings,
  Megaphone,
  UserCog,
  Image,
  FileSignature
} from 'lucide-react';

interface Permission {
  id: string;
  module: string;
  action: string;
  scope: string;
  description: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  isMaster: boolean;
  users: User[];
  permissions: Permission[];
  usersCount: number;
  permissionsCount: number;
  createdAt: string;
}

const MODULE_ICONS: Record<string, any> = {
  dashboard: FileText,
  commercial: Briefcase,
  financial: DollarSign,
  marketing: Megaphone,
  admin: Settings,
  security: Shield,
  settings: Settings,
  media: Image,
  signature: FileSignature,
};

const MODULE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  commercial: 'Comercial',
  financial: 'Financeiro',
  marketing: 'Marketing',
  admin: 'Administrativo',
  security: 'Segurança',
  settings: 'Configurações',
  media: 'Mídia',
  signature: 'Assinatura',
};

export default function VisualizarPerfilPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<Role | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRole();
  }, [id]);

  const loadRole = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/roles/${id}`);
      if (response.ok) {
        const data = await response.json();
        setRole(data);
      } else {
        setError('Perfil não encontrado');
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const getModuleIcon = (module: string) => {
    const Icon = MODULE_ICONS[module] || Shield;
    return Icon;
  };

  const getActionBadge = (action: string) => {
    const variants: Record<string, any> = {
      'view': 'default',
      'create': 'success',
      'edit': 'warning',
      'delete': 'destructive',
      'approve': 'success',
      'export': 'default',
      'upload': 'default',
      'sign': 'default',
    };
    return variants[action] || 'default';
  };

  const userColumns = [
    { key: 'name', label: 'Nome' },
    { key: 'email', label: 'E-mail' },
  ];

  const permissionColumns = [
    { 
      key: 'module', 
      label: 'Módulo',
      render: (value: string) => {
        const Icon = getModuleIcon(value);
        return (
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span>{MODULE_LABELS[value] || value}</span>
          </div>
        );
      }
    },
    { 
      key: 'action', 
      label: 'Ação',
      render: (value: string) => (
        <Badge variant={getActionBadge(value)} className="capitalize">
          {value}
        </Badge>
      )
    },
    { 
      key: 'scope', 
      label: 'Alcance',
      render: (value: string) => (
        <Badge variant="outline">
          {value === 'all' ? 'Todos' : value === 'own' ? 'Próprios' : 'Equipe'}
        </Badge>
      )
    },
    { key: 'description', label: 'Descrição' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !role) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
        <p className="text-muted-foreground">{error || 'Perfil não encontrado'}</p>
        <Button asChild className="mt-4">
          <Link href="/seguranca/perfis">Voltar</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={role.name}
        description={role.description || 'Perfil de acesso do sistema'}
        badge={role.isMaster ? 'Master' : undefined}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/seguranca/perfis">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Link>
            </Button>
            {!role.isMaster && (
              <Button asChild>
                <Link href={`/seguranca/perfis/${id}/editar`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Link>
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações Principais */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Informações do Perfil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-medium">{role.name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Usuários</p>
                  <p className="font-medium">{role.usersCount} vinculados</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Key className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Permissões</p>
                  <p className="font-medium">{role.permissionsCount} módulos</p>
                </div>
              </div>
              <div className="flex items-start gap-3 col-span-2">
                <p className="text-sm text-muted-foreground">Descrição</p>
                <p className="font-medium">{role.description || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
              {role.isMaster ? (
                <>
                  <CheckCircle className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo</p>
                    <p className="font-medium text-primary">Perfil Master</p>
                    <p className="text-xs text-muted-foreground">Acesso total ao sistema</p>
                  </div>
                </>
              ) : (
                <>
                  <Shield className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo</p>
                    <p className="font-medium">Perfil Personalizado</p>
                    <p className="text-xs text-muted-foreground">Permissões configuráveis</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usuários Vinculados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Usuários Vinculados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {role.users && role.users.length > 0 ? (
            <DataTable
              columns={userColumns}
              data={role.users}
              pageSize={5}
            />
          ) : (
            <p className="text-muted-foreground text-center py-4">
              Nenhum usuário vinculado a este perfil
            </p>
          )}
        </CardContent>
      </Card>

      {/* Permissões */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Permissões
          </CardTitle>
        </CardHeader>
        <CardContent>
          {role.permissions && role.permissions.length > 0 ? (
            <DataTable
              columns={permissionColumns}
              data={role.permissions}
              pageSize={10}
            />
          ) : (
            <p className="text-muted-foreground text-center py-4">
              Nenhuma permissão configurada
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
