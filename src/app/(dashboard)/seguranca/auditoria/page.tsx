'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Activity, 
  User, 
  Users,
  FileText, 
  DollarSign,
  Settings,
  Shield,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface Log {
  id: string;
  user: string;
  action: string;
  module: string;
  timestamp: string;
  ipAddress: string;
  details: string;
}

export default function AuditoriaPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    total: 0,
    today: 0,
    actions: {} as Record<string, number>,
  });

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const response = await fetch('/api/admin/audit');
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
        setMetrics(data.metrics || {});
      }
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action: string) => {
    const variants: Record<string, any> = {
      'CREATE': 'success',
      'UPDATE': 'warning',
      'DELETE': 'destructive',
      'LOGIN': 'default',
      'LOGOUT': 'secondary',
      'APPROVE': 'success',
      'REJECT': 'destructive',
    };
    return variants[action] || 'secondary';
  };

  const getModuleIcon = (module: string) => {
    const icons: Record<string, any> = {
      'auth': User,
      'commercial': FileText,
      'financial': DollarSign,
      'admin': Settings,
      'security': Shield,
      'settings': Settings,
    };
    return icons[module] || Activity;
  };

  const columns = [
    { 
      key: 'user', 
      label: 'Usuário',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>{value}</span>
        </div>
      )
    },
    { 
      key: 'action', 
      label: 'Ação',
      render: (value: string) => (
        <Badge variant={getActionBadge(value)}>{value}</Badge>
      )
    },
    { 
      key: 'module', 
      label: 'Módulo',
      render: (value: string) => {
        const Icon = getModuleIcon(value);
        return (
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span className="capitalize">{value}</span>
          </div>
        );
      }
    },
    { 
      key: 'timestamp', 
      label: 'Data/Hora',
      render: (value: string) => new Date(value).toLocaleString('pt-BR')
    },
    { key: 'ipAddress', label: 'IP' },
    { key: 'details', label: 'Detalhes' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Auditoria"
        description="Visualize todas as ações dos usuários"
        badge={`${metrics.total} registros`}
      />

      {/* Métricas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Ações</p>
                <p className="text-2xl font-bold">{metrics.total}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hoje</p>
                <p className="text-2xl font-bold">{metrics.today}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ações por Usuário</p>
                <p className="text-2xl font-bold">
                  {Object.keys(metrics.actions || {}).length}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        loading={loading}
        pageSize={20}
      />
    </div>
  );
}
