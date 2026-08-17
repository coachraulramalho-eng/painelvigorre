'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Calendar,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export default function FluxoCaixaPage() {
  const [period, setPeriod] = useState('month');

  const cashFlow = {
    saldoInicial: 45000.00,
    entradas: 63200.00,
    saidas: 28450.00,
    saldo: 79750.00,
    projetado: 85000.00,
  };

  const entradas = [
    { descricao: 'Recebimento - Empresa ABC', valor: 15000.00, data: '2026-08-17', status: 'Recebido' },
    { descricao: 'Recebimento - Tech Solutions', valor: 8500.00, data: '2026-08-20', status: 'Pendente' },
    { descricao: 'Venda - Grupo XYZ', valor: 22000.00, data: '2026-08-10', status: 'Recebido' },
    { descricao: 'Consultoria - Startup Inovação', valor: 5500.00, data: '2026-09-01', status: 'Pendente' },
    { descricao: 'Serviços - Empresa Beta', valor: 12000.00, data: '2026-08-25', status: 'Pendente' },
  ];

  const saidas = [
    { descricao: 'Licença Software', valor: 3500.00, data: '2026-09-10', status: 'Pendente' },
    { descricao: 'Campanha LinkedIn', valor: 5000.00, data: '2026-08-15', status: 'Vencido' },
    { descricao: 'Serviços Contábeis', valor: 1200.00, data: '2026-08-05', status: 'Pago' },
    { descricao: 'Aluguel Escritório', valor: 4500.00, data: '2026-09-01', status: 'Pendente' },
    { descricao: 'Internet e Telefonia', valor: 850.00, data: '2026-08-28', status: 'Pendente' },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Fluxo de Caixa</h1>
          <p className="text-muted-foreground">Acompanhe a movimentação financeira da Vigorre</p>
        </div>
        <div className="flex gap-2">
          <div className="flex gap-1 bg-secondary rounded-lg p-1">
            {['week', 'month', 'quarter'].map((p) => (
              <Button
                key={p}
                variant={period === p ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPeriod(p)}
              >
                {p === 'week' ? 'Semana' : p === 'month' ? 'Mês' : 'Trimestre'}
              </Button>
            ))}
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Saldo Inicial</p>
                <p className="text-2xl font-bold">{formatCurrency(cashFlow.saldoInicial)}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Entradas</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(cashFlow.entradas)}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Saídas</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(cashFlow.saidas)}</p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Saldo Atual</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(cashFlow.saldo)}</p>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detalhamento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Entradas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5 text-green-600" />
              Entradas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {entradas.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <div>
                  <p className="font-medium">{item.descricao}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.data).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600">{formatCurrency(item.valor)}</p>
                  <Badge variant={item.status === 'Recebido' ? 'success' : 'warning'}>
                    {item.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Saídas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowDownRight className="h-5 w-5 text-red-600" />
              Saídas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {saidas.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <div>
                  <p className="font-medium">{item.descricao}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.data).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-red-600">{formatCurrency(item.valor)}</p>
                  <Badge variant={item.status === 'Pago' ? 'success' : item.status === 'Vencido' ? 'destructive' : 'warning'}>
                    {item.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Projeção */}
      <Card>
        <CardHeader>
          <CardTitle>Projeção para Próximos Dias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Saldo Projetado</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(cashFlow.projetado)}</p>
              </div>
              <Badge variant="outline" className="px-4 py-2">
                +{formatCurrency(cashFlow.projetado - cashFlow.saldo)}
              </Badge>
            </div>
            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${(cashFlow.projetado / 100000) * 100}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              *Projeção baseada em recebimentos e pagamentos previstos para os próximos 30 dias
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
