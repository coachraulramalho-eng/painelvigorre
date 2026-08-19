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
  User, 
  Mail, 
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  Lock,
  Unlock,
  Activity,
  FileText,
  Briefcase,
  Clock
} from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  email: string;
  active: boolean;
  lastLoginAt: string;
  createdAt: string;
  roles: { role: { id: string; name: string; description: string; isMaster: boolean } }[];
  _count: {
    leadsResponsible: number;
    proposals: number;
    tasks: number;
    contracts: number;
  };
}

export default function VisualizarUsuarioPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUser();
  }, [id]);

  const loadUser = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${id}`);
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        setError('Usuário não encontrado');
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async () => {
    if (!user) return;
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !user.active }),
      });

      if (response.ok) {
        loadUser();
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
        <p className="text-muted-foreground">{error || 'Usuário não encontrado'}</p>
        <Button asChild className="mt-4">
          <Link href="/seguranca/usuarios">Voltar</Link>
        </Button>
      </div>
    );
  }

  const roleColumns = [
    { 
      key: 'role', 
      label: 'Perfil',
      render: (_: any, row: { role: { name: string; description: string; isMaster: boolean } }) => (
        <div>
          <p className="font-medium">{row.role.name}</p>
          {row.role.isMaster && (
            <Badge variant="default" className="text-xs">Master</Badge>
          )}
          {row.role.description && (
            <p className="text-xs text-muted-foreground">{row.role.description}</p>
          )}
        </div>
      )
    },
  ];

  const activityColumns = [
    { key: 'type', label: 'Tipo' },
    { key: 'description', label: 'Descrição' },
    { key: 'date', label: 'Data' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={user.name}
        description={user.email}
        badge={user.active ? 'Ativo' : 'Inativo'}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/seguranca/usuarios">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/seguranca/usuarios/${id}/editar`}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações Principais */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-medium">{user.name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">E-mail</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Cadastrado em</p>
                  <p className="font-medium">
                    {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Último Login</p>
                  <p className="font-medium">
                    {user.lastLoginAt 
                      ? new Date(user.lastLoginAt).toLocaleString('pt-BR')
                      : 'Nunca'
                    }
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <div className="flex items-center gap-3">
                {user.active ? (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                ) : (
                  <XCircle className="h-8 w-8 text-red-600" />
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={user.active ? 'success' : 'secondary'}>
                    {user.active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleUserStatus}
                className="gap-1"
              >
                {user.active ? (
                  <Lock className="h-4 w-4" />
                ) : (
                  <Unlock className="h-4 w-4" />
                )}
                {user.active ? 'Desativar' : 'Ativar'}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="text-center p-2 bg-secondary rounded-lg">
                <p className="text-lg font-bold">{user._count.leadsResponsible}</p>
                <p className="text-xs text-muted-foreground">Leads</p>
              </div>
              <div className="text-center p-2 bg-secondary rounded-lg">
                <p className="text-lg font-bold">{user._count.proposals}</p>
                <p className="text-xs text-muted-foreground">Propostas</p>
              </div>
              <div className="text-center p-2 bg-secondary rounded-lg">
                <p className="text-lg font-bold">{user._count.tasks}</p>
                <p className="text-xs text-muted-foreground">Tarefas</p>
              </div>
              <div className="text-center p-2 bg-secondary rounded-lg">
                <p className="text-lg font-bold">{user._count.contracts}</p>
                <p className="text-xs text-muted-foreground">Contratos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Perfis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Perfis de Acesso
          </CardTitle>
        </CardHeader>
        <CardContent>
          {user.roles && user.roles.length > 0 ? (
            <DataTable
              columns={roleColumns}
              data={user.roles}
              pageSize={5}
            />
          ) : (
            <p className="text-muted-foreground text-center py-4">
              Nenhum perfil vinculado
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
