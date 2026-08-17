'use client';

import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, DollarSign, Users, FileText, Clock, CheckCircle } from 'lucide-react';

export default function DashboardPage() {
  const { data: session } = useSession();

  const metrics = [
    {
      title: 'Propostas Enviadas',
      value: '24',
      change: '+12%',
      icon: FileText,
      color: 'text-blue-600',
    },
    {
      title: 'Em Negociação',
      value: '8',
      change: '-2%',
      icon: Clock,
      color: 'text-yellow-600',
    },
    {
      title: 'Vendas',
      value: '16',
      change: '+8%',
      icon: CheckCircle,
      color: 'text-green-600',
    },
    {
      title: 'Receita do Mês',
      value: 'R$ 142.500',
      change: '+23%',
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      title: 'Leads',
      value: '47',
      change: '+15%',
      icon: Users,
      color: 'text-purple-600',
    },
    {
      title: 'Taxa Conversão',
      value: '34%',
      change: '+5%',
      icon: TrendingUp,
      color: 'text-primary',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">
            Bem-vindo, {session?.user?.name || 'Usuário'}
          </h1>
          <p className="text-muted-foreground">
            Visão geral do painel Vigorre ADM™
          </p>
        </div>
        <Badge variant="outline" className="px-4 py-2">
          ADM Master
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className={`text-xs ${metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {metric.change} em relação ao mês anterior
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pipeline Comercial</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { stage: 'Novos Leads', count: 12, color: 'bg-gray-300' },
                { stage: 'Qualificados', count: 8, color: 'bg-blue-300' },
                { stage: 'Propostas', count: 6, color: 'bg-yellow-300' },
                { stage: 'Negociação', count: 4, color: 'bg-orange-300' },
                { stage: 'Fechados', count: 3, color: 'bg-green-500' },
              ].map((item) => (
                <div key={item.stage} className="flex items-center justify-between">
                  <span className="text-sm">{item.stage}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color}`}
                        style={{ width: `${(item.count / 12) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximas Ações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { task: 'Follow-up: Cliente A', date: 'Hoje', priority: 'Alta' },
                { task: 'Reunião: Proposta #123', date: 'Amanhã', priority: 'Média' },
                { task: 'Enviar contrato', date: '20/08', priority: 'Alta' },
                { task: 'Ligar para representante', date: '21/08', priority: 'Baixa' },
              ].map((task, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-secondary rounded">
                  <div>
                    <p className="text-sm font-medium">{task.task}</p>
                    <p className="text-xs text-muted-foreground">{task.date}</p>
                  </div>
                  <Badge
                    variant={
                      task.priority === 'Alta' ? 'destructive' :
                      task.priority === 'Média' ? 'default' : 'secondary'
                    }
                  >
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
