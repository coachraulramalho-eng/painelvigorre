'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { PipelineKanban } from '@/components/comercial/PipelineKanban';
import { ActivityTimeline } from '@/components/comercial/ActivityTimeline';
import { LeadCard } from '@/components/comercial/LeadCard';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Users, 
  FileText, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function CRMPage() {
  const { data: session } = useSession();
  const [view, setView] = useState<'pipeline' | 'activities' | 'leads'>('pipeline');
  const [searchTerm, setSearchTerm] = useState('');

  const metrics = [
    { label: 'Leads Ativos', value: 47, icon: Users, color: 'text-blue-600' },
    { label: 'Propostas', value: 24, icon: FileText, color: 'text-yellow-600' },
    { label: 'Em Negociação', value: 8, icon: Clock, color: 'text-orange-600' },
    { label: 'Conversão', value: '34%', icon: TrendingUp, color: 'text-green-600' },
  ];

  const recentActivities = [
    { type: 'Ligação', description: 'Contato inicial com Empresa ABC', date: '2026-08-17 14:30', responsible: 'João Silva' },
    { type: 'E-mail', description: 'Envio de proposta para Cliente XYZ', date: '2026-08-17 11:15', responsible: 'Maria Santos' },
    { type: 'Reunião', description: 'Apresentação comercial com Diretoria', date: '2026-08-17 09:00', responsible: 'Carlos Lima' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">CRM - Gestão Comercial</h1>
          <p className="text-muted-foreground">Gerencie leads, oportunidades e relacionamentos</p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Lead
          </Button>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filtros
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

      {/* Barra de ferramentas */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-lg border shadow-sm">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar leads, empresas, contatos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={view === 'pipeline' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('pipeline')}
          >
            Pipeline
          </Button>
          <Button
            variant={view === 'leads' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('leads')}
          >
            Leads
          </Button>
          <Button
            variant={view === 'activities' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('activities')}
          >
            Atividades
          </Button>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {view === 'pipeline' && <PipelineKanban />}
          {view === 'leads' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <LeadCard key={i} />
              ))}
            </div>
          )}
          {view === 'activities' && <ActivityTimeline activities={recentActivities} />}
        </div>

        {/* Sidebar - Atividades Recentes */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Atividades Recentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0">
                  <div className="mt-1">
                    {activity.type === 'Ligação' && <Badge variant="outline" className="bg-blue-50">📞</Badge>}
                    {activity.type === 'E-mail' && <Badge variant="outline" className="bg-green-50">✉️</Badge>}
                    {activity.type === 'Reunião' && <Badge variant="outline" className="bg-purple-50">👥</Badge>}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.responsible} • {new Date(activity.date).toLocaleDateString('pt-BR')} às {new Date(activity.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Próximos Passos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { task: 'Ligar para Cliente A', priority: 'Alta', date: 'Hoje' },
                { task: 'Enviar proposta revisada', priority: 'Média', date: 'Amanhã' },
                { task: 'Agendar reunião com equipe', priority: 'Baixa', date: '20/08' },
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
