'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Building,
  UserPlus,
  FileSignature,
  Eye,
  Loader2,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

interface DashboardMetrics {
  commercial: {
    leads: { total: number; new: number; qualified: number; converted: number };
    proposals: { 
      total: number; sent: number; negotiation: number; 
      won: number; lost: number; conversionRate: number;
    };
  };
  financial: {
    receivable: { total: number; overdue: number };
    paid: { total: number };
    payable: { total: number; overdue: number };
    expenses: { total: number };
    result: number;
  };
  representatives: { total: number; totalCommissions: number; pendingCommissions: number };
  contracts: { active: number; expiring: number };
  tasks: { pending: number; overdue: number };
  user: { leads: number; proposals: number; tasks: number } | null;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const response = await fetch('/api/dashboard/metrics');
      if (!response.ok) {
        throw new Error('Erro ao carregar métricas');
      }
      const data = await response.json();
      setMetrics(data.metrics);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={loadMetrics} className="mt-4">
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  const isMaster = session?.user?.role === 'ADM Master';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">
            {isMaster ? 'Dashboard Geral' : 'Meu Dashboard'}
          </h1>
          <p className="text-muted-foreground">
            {isMaster 
              ? 'Visão completa da empresa' 
              : `Bem-vindo, ${session?.user?.name || 'Usuário'}`
            }
          </p>
        </div>
        <Badge variant="outline" className="px-4 py-2">
          {session?.user?.role || 'Funcionário'}
        </Badge>
      </div>

      {/* Métricas do Usuário (para não-ADM) */}
      {!isMaster && metrics.user && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Meus Leads</p>
                  <p className="text-2xl font-bold">{formatNumber(metrics.user.leads)}</p>
                </div>
                <UserPlus className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Minhas Propostas</p>
                  <p className="text-2xl font-bold">{formatNumber(metrics.user.proposals)}</p>
                </div>
                <FileText className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Minhas Tarefas</p>
                  <p className="text-2xl font-bold">{formatNumber(metrics.user.tasks)}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* LEADS */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-primary">📊 Leads</h2>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/comercial/leads">
            Ver todos <ArrowUpRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{formatNumber(metrics.commercial.leads.total)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Novos</p>
            <p className="text-2xl font-bold text-blue-600">{formatNumber(metrics.commercial.leads.new)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Qualificados</p>
            <p className="text-2xl font-bold text-green-600">{formatNumber(metrics.commercial.leads.qualified)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Convertidos</p>
            <p className="text-2xl font-bold text-purple-600">{formatNumber(metrics.commercial.leads.converted)}</p>
          </CardContent>
        </Card>
      </div>

      {/* PROPOSTAS */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-primary">📄 Propostas</h2>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/comercial/propostas">
            Ver todos <ArrowUpRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{formatNumber(metrics.commercial.proposals.total)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Enviadas</p>
            <p className="text-2xl font-bold text-blue-600">{formatNumber(metrics.commercial.proposals.sent)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Em Negociação</p>
            <p className="text-2xl font-bold text-yellow-600">{formatNumber(metrics.commercial.proposals.negotiation)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Ganhas</p>
            <p className="text-2xl font-bold text-green-600">{formatNumber(metrics.commercial.proposals.won)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Perdidas</p>
            <p className="text-2xl font-bold text-red-600">{formatNumber(metrics.commercial.proposals.lost)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Taxa de Conversão */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
              <p className="text-2xl font-bold">{metrics.commercial.proposals.conversionRate}%</p>
            </div>
            <div className="w-24 h-24 rounded-full border-4 border-primary flex items-center justify-center">
              <span className="text-xl font-bold text-primary">
                {metrics.commercial.proposals.conversionRate}%
              </span>
            </div>
          </div>
          <Progress 
            value={metrics.commercial.proposals.conversionRate} 
            className="mt-4 h-2"
          />
        </CardContent>
      </Card>

      {/* FINANCEIRO (apenas ADM Master) */}
      {isMaster && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-primary">💰 Financeiro</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/financeiro/contas-receber">
                Ver todos <ArrowUpRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Recebido</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(metrics.financial.paid.total)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">A Receber</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(metrics.financial.receivable.total)}
                </p>
                {metrics.financial.receivable.overdue > 0 && (
                  <Badge variant="destructive" className="mt-2">
                    {metrics.financial.receivable.overdue} vencidos
                  </Badge>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Despesas</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(metrics.financial.expenses.total)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Resultado</p>
                <p className={`text-2xl font-bold ${
                  metrics.financial.result >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(metrics.financial.result)}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {metrics.financial.result >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {metrics.financial.result >= 0 ? 'Lucro' : 'Prejuízo'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* REPRESENTANTES, CONTRATOS, TAREFAS */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Representantes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatNumber(metrics.representatives.total)}</p>
                <p className="text-sm text-muted-foreground">
                  Comissões: {formatCurrency(metrics.representatives.totalCommissions)}
                </p>
                {metrics.representatives.pendingCommissions > 0 && (
                  <Badge variant="warning" className="mt-2">
                    {metrics.representatives.pendingCommissions} pendentes
                  </Badge>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Contratos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatNumber(metrics.contracts.active)}</p>
                <p className="text-sm text-muted-foreground">Ativos</p>
                {metrics.contracts.expiring > 0 && (
                  <Badge variant="warning" className="mt-2">
                    {metrics.contracts.expiring} vencem em 30 dias
                  </Badge>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Tarefas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatNumber(metrics.tasks.pending)}</p>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                {metrics.tasks.overdue > 0 && (
                  <Badge variant="destructive" className="mt-2">
                    {metrics.tasks.overdue} atrasadas
                  </Badge>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Ações Rápidas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Button asChild className="gap-2">
          <Link href="/comercial/leads/novo">
            <UserPlus className="h-4 w-4" />
            Novo Lead
          </Link>
        </Button>
        <Button asChild className="gap-2" variant="outline">
          <Link href="/comercial/propostas/novo">
            <FileText className="h-4 w-4" />
            Nova Proposta
          </Link>
        </Button>
        <Button asChild className="gap-2" variant="outline">
          <Link href="/documentos/assinatura">
            <FileSignature className="h-4 w-4" />
            Solicitar Assinatura
          </Link>
        </Button>
        <Button asChild className="gap-2" variant="outline">
          <Link href="/relatorios">
            <Eye className="h-4 w-4" />
            Ver Relatórios
          </Link>
        </Button>
      </div>
    </div>
  );
}
