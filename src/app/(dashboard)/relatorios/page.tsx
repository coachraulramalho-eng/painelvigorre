'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  FileText, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  Filter,
  Printer,
  Mail,
  Eye,
  BarChart3,
  PieChart,
  LineChart,
  ChevronDown
} from 'lucide-react';

export default function RelatoriosPage() {
  const [period, setPeriod] = useState('month');

  const reports = [
    {
      id: 1,
      name: 'Relatório de Vendas',
      description: 'Análise completa de vendas por período',
      icon: TrendingUp,
      color: 'text-green-600',
      lastGenerated: '2026-08-17',
      frequency: 'Mensal'
    },
    {
      id: 2,
      name: 'Relatório Financeiro',
      description: 'Receitas, despesas e fluxo de caixa',
      icon: DollarSign,
      color: 'text-blue-600',
      lastGenerated: '2026-08-16',
      frequency: 'Mensal'
    },
    {
      id: 3,
      name: 'Relatório Comercial',
      description: 'Pipeline, conversões e performance',
      icon: BarChart3,
      color: 'text-purple-600',
      lastGenerated: '2026-08-15',
      frequency: 'Semanal'
    },
    {
      id: 4,
      name: 'Relatório de Representantes',
      description: 'Desempenho e comissões dos representantes',
      icon: Users,
      color: 'text-orange-600',
      lastGenerated: '2026-08-14',
      frequency: 'Mensal'
    },
    {
      id: 5,
      name: 'Relatório de Marketing',
      description: 'Campanhas, leads e ROI',
      icon: PieChart,
      color: 'text-pink-600',
      lastGenerated: '2026-08-13',
      frequency: 'Mensal'
    },
    {
      id: 6,
      name: 'Relatório de Propostas',
      description: 'Propostas enviadas, ganhas e perdidas',
      icon: FileText,
      color: 'text-yellow-600',
      lastGenerated: '2026-08-12',
      frequency: 'Semanal'
    },
  ];

  const recentReports = [
    { name: 'Vendas - Agosto 2026', date: '2026-08-17', size: '2.4 MB', status: 'Concluído' },
    { name: 'Fluxo de Caixa - Semana 33', date: '2026-08-16', size: '1.8 MB', status: 'Concluído' },
    { name: 'Pipeline - Semana 33', date: '2026-08-15', size: '3.1 MB', status: 'Processando' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Relatórios</h1>
          <p className="text-muted-foreground">Analise e exporte relatórios gerenciais</p>
        </div>
        <div className="flex gap-2">
          <div className="flex gap-1 bg-secondary rounded-lg p-1">
            {['week', 'month', 'quarter', 'year'].map((p) => (
              <Button
                key={p}
                variant={period === p ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPeriod(p)}
              >
                {p === 'week' ? 'Semana' : p === 'month' ? 'Mês' : p === 'quarter' ? 'Trimestre' : 'Ano'}
              </Button>
            ))}
          </div>
          <Button className="gap-2">
            <Download className="h-4 w-4" />
            Exportar Todos
          </Button>
        </div>
      </div>

      {/* Cards de Relatórios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((report) => (
          <Card key={report.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-secondary ${report.color}`}>
                    <report.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{report.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Último: {new Date(report.lastGenerated).toLocaleDateString('pt-BR')}</span>
                </div>
                <Badge variant="outline">{report.frequency}</Badge>
              </div>
              <div className="mt-3 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 gap-1">
                  <Eye className="h-3 w-3" />
                  Visualizar
                </Button>
                <Button variant="outline" size="sm" className="flex-1 gap-1">
                  <Download className="h-3 w-3" />
                  Exportar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Relatórios Recentes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Relatórios Recentes</CardTitle>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-3 w-3" />
              Filtrar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary">
                <tr>
                  <th className="text-left text-sm font-medium text-muted-foreground p-3">Nome</th>
                  <th className="text-left text-sm font-medium text-muted-foreground p-3">Data</th>
                  <th className="text-left text-sm font-medium text-muted-foreground p-3">Tamanho</th>
                  <th className="text-left text-sm font-medium text-muted-foreground p-3">Status</th>
                  <th className="text-right text-sm font-medium text-muted-foreground p-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {recentReports.map((report, index) => (
                  <tr key={index} className="border-t hover:bg-secondary/50 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{report.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm">
                      {new Date(report.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-3 text-sm">{report.size}</td>
                    <td className="p-3">
                      <Badge variant={report.status === 'Concluído' ? 'success' : 'warning'}>
                        {report.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Printer className="h-4 w-4" />
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

      {/* Gráficos Rápidos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Vendas por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-end justify-between gap-2">
              {[60, 75, 85, 70, 90, 95].map((value, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                  <div 
                    className="w-full bg-primary rounded-t"
                    style={{ height: `${value}%` }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'][index]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Receitas vs Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span>Receitas</span>
                  <span className="font-medium text-green-600">R$ 63.200</span>
                </div>
                <div className="w-full bg-secondary h-2 rounded-full mt-1">
                  <div className="bg-green-600 h-full rounded-full" style={{ width: '70%' }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span>Despesas</span>
                  <span className="font-medium text-red-600">R$ 28.450</span>
                </div>
                <div className="w-full bg-secondary h-2 rounded-full mt-1">
                  <div className="bg-red-600 h-full rounded-full" style={{ width: '32%' }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span>Margem</span>
                  <span className="font-medium text-primary">55%</span>
                </div>
                <div className="w-full bg-secondary h-2 rounded-full mt-1">
                  <div className="bg-primary h-full rounded-full" style={{ width: '55%' }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Top Representantes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: 'João Silva', value: 'R$ 45.000', percentage: 40 },
              { name: 'Maria Santos', value: 'R$ 32.000', percentage: 28 },
              { name: 'Carlos Lima', value: 'R$ 25.000', percentage: 22 },
              { name: 'Ana Paula', value: 'R$ 12.000', percentage: 10 },
            ].map((rep, index) => (
              <div key={index}>
                <div className="flex items-center justify-between text-sm">
                  <span>{rep.name}</span>
                  <span className="font-medium">{rep.value}</span>
                </div>
                <div className="w-full bg-secondary h-1.5 rounded-full mt-1">
                  <div 
                    className="bg-primary h-full rounded-full" 
                    style={{ width: `${rep.percentage}%` }} 
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
