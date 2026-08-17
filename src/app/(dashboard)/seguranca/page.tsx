'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Shield, 
  Lock, 
  Key,
  Eye,
  Edit,
  Plus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  UserCog,
  Activity,
  Database,
  AlertTriangle
} from 'lucide-react';

export default function SegurancaPage() {
  const users = [
    { id: 1, name: 'João Silva', email: 'joao@vigorre.com', role: 'ADM Master', status: 'Ativo', lastLogin: '2026-08-17 14:30' },
    { id: 2, name: 'Maria Santos', email: 'maria@vigorre.com', role: 'Gestor Comercial', status: 'Ativo', lastLogin: '2026-08-17 10:15' },
    { id: 3, name: 'Carlos Lima', email: 'carlos@vigorre.com', role: 'Representante', status: 'Ativo', lastLogin: '2026-08-16 16:45' },
    { id: 4, name: 'Ana Paula', email: 'ana@vigorre.com', role: 'Marketing', status: 'Inativo', lastLogin: '2026-08-10 09:00' },
  ];

  const logs = [
    { id: 1, user: 'João Silva', action: 'Login', module: 'Autenticação', timestamp: '2026-08-17 14:30', ip: '192.168.1.1' },
    { id: 2, user: 'Maria Santos', action: 'CREATE', module: 'Comercial', timestamp: '2026-08-17 14:25', ip: '192.168.1.2' },
    { id: 3, user: 'João Silva', action: 'APPROVE', module: 'Financeiro', timestamp: '2026-08-17 14:20', ip: '192.168.1.1' },
    { id: 4, user: 'Carlos Lima', action: 'EDIT', module: 'Comercial', timestamp: '2026-08-17 14:10', ip: '192.168.1.3' },
  ];

  const metrics = [
    { label: 'Usuários Ativos', value: users.filter(u => u.status === 'Ativo').length, icon: Users, color: 'text-blue-600' },
    { label: 'Sessões Ativas', value: 3, icon: Activity, color: 'text-green-600' },
    { label: 'Alertas de Segurança', value: 0, icon: AlertTriangle, color: 'text-green-600' },
    { label: 'Total de Logs', value: logs.length, icon: Database, color: 'text-purple-600' },
  ];

  const getStatusBadge = (status: string) => {
    return status === 'Ativo' ? 'success' : 'secondary';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Segurança</h1>
          <p className="text-muted-foreground">Gerencie usuários, permissões e auditoria do sistema</p>
        </div>
        <div className="flex gap-2">
          <Button className="gap-2">
            <UserCog className="h-4 w-4" />
            Novo Usuário
          </Button>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <p className="text-2xl font-bold mt-1">{metric.value}</p>
                </div>
                <metric.icon className={`h-8 w-8 ${metric.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Usuários */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Usuários</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Search className="h-3 w-3" />
                Buscar
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-3 w-3" />
                Filtrar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary">
                <tr>
                  <th className="text-left text-sm font-medium text-muted-foreground p-3">Nome</th>
                  <th className="text-left text-sm font-medium text-muted-foreground p-3">E-mail</th>
                  <th className="text-left text-sm font-medium text-muted-foreground p-3">Perfil</th>
                  <th className="text-left text-sm font-medium text-muted-foreground p-3">Status</th>
                  <th className="text-left text-sm font-medium text-muted-foreground p-3">Último Login</th>
                  <th className="text-right text-sm font-medium text-muted-foreground p-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t hover:bg-secondary/50 transition-colors">
                    <td className="p-3">
                      <p className="font-medium">{user.name}</p>
                    </td>
                    <td className="p-3 text-sm">{user.email}</td>
                    <td className="p-3">
                      <Badge variant="outline">{user.role}</Badge>
                    </td>
                    <td className="p-3">
                      <Badge variant={getStatusBadge(user.status)}>
                        {user.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-sm">
                      {new Date(user.lastLogin).toLocaleString('pt-BR')}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Lock className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Permissões e Auditoria */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Permissões */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Perfis e Permissões</CardTitle>
              <Button variant="outline" size="sm" className="gap-2">
                <Plus className="h-3 w-3" />
                Novo Perfil
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {['ADM Master', 'Gestor Comercial', 'Comercial', 'Representante', 'Financeiro', 'Marketing'].map((role) => (
              <div key={role} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{role}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Módulos: {role === 'ADM Master' ? 'Todos' : '3'}</Badge>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Auditoria */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Auditoria Recente</CardTitle>
              <Button variant="outline" size="sm" className="gap-2">
                <Eye className="h-3 w-3" />
                Ver Todos
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[400px] overflow-y-auto">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 p-3 bg-secondary rounded-lg">
                <div className="mt-1">
                  {log.action === 'Login' ? (
                    <Key className="h-4 w-4 text-blue-600" />
                  ) : log.action === 'CREATE' ? (
                    <Plus className="h-4 w-4 text-green-600" />
                  ) : log.action === 'APPROVE' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Edit className="h-4 w-4 text-yellow-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{log.user}</p>
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-sm">
                    <Badge variant="outline" className="text-xs">{log.action}</Badge>
                    {' '}{log.module}
                  </p>
                  <p className="text-xs text-muted-foreground">{log.ip}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
