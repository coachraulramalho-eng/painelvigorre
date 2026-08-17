'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Filter, 
  Download,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  DollarSign,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function ContasReceberPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const mockReceivables = [
    { 
      id: 1, 
      cliente: 'Empresa ABC', 
      descricao: 'Recrutamento Executivo',
      valor: 'R$ 15.000,00',
      vencimento: '2026-09-15',
      status: 'A vencer',
      parcela: '1/3',
      responsavel: 'João Silva'
    },
    { 
      id: 2, 
      cliente: 'Tech Solutions', 
      descricao: 'Consultoria em Gestão',
      valor: 'R$ 8.500,00',
      vencimento: '2026-08-20',
      status: 'Vencido',
      parcela: '2/2',
      responsavel: 'Maria Santos'
    },
    { 
      id: 3, 
      cliente: 'Grupo XYZ', 
      descricao: 'Recrutamento e Seleção',
      valor: 'R$ 22.000,00',
      vencimento: '2026-08-10',
      status: 'Recebido',
      parcela: 'Única',
      responsavel: 'Carlos Lima'
    },
    { 
      id: 4, 
      cliente: 'Startup Inovação', 
      descricao: 'Diagnóstico Organizacional',
      valor: 'R$ 5.500,00',
      vencimento: '2026-09-01',
      status: 'Previsto',
      parcela: '1/2',
      responsavel: 'Ana Paula'
    },
    { 
      id: 5, 
      cliente: 'Empresa Beta', 
      descricao: 'Consultoria Estratégica',
      valor: 'R$ 12.000,00',
      vencimento: '2026-08-25',
      status: 'A vencer',
      parcela: '3/4',
      responsavel: 'Pedro Oliveira'
    },
  ];

  const metrics = [
    { label: 'Total a Receber', value: 'R$ 63.000,00', color: 'text-blue-600' },
    { label: 'Vencidos', value: 'R$ 8.500,00', color: 'text-red-600' },
    { label: 'A Vencer', value: 'R$ 27.000,00', color: 'text-yellow-600' },
    { label: 'Recebido (mês)', value: 'R$ 22.000,00', color: 'text-green-600' },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      'Previsto': 'secondary',
      'A vencer': 'warning',
      'Vencido': 'destructive',
      'Recebido': 'success',
    };
    return variants[status] || 'default';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, any> = {
      'Previsto': Clock,
      'A vencer': Calendar,
      'Vencido': XCircle,
      'Recebido': CheckCircle,
    };
    return icons[status] || Clock;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Contas a Receber</h1>
          <p className="text-muted-foreground">Gerencie todos os recebimentos da Vigorre</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Recebimento
        </Button>
      </div>

      {/* Métricas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">{metric.label}</p>
              <p className={`text-2xl font-bold mt-1 ${metric.color}`}>{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar cliente, descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary">
              <tr>
                <th className="text-left text-sm font-medium text-muted-foreground p-3">Cliente</th>
                <th className="text-left text-sm font-medium text-muted-foreground p-3">Descrição</th>
                <th className="text-left text-sm font-medium text-muted-foreground p-3">Valor</th>
                <th className="text-left text-sm font-medium text-muted-foreground p-3">Vencimento</th>
                <th className="text-left text-sm font-medium text-muted-foreground p-3">Status</th>
                <th className="text-left text-sm font-medium text-muted-foreground p-3">Parcela</th>
                <th className="text-right text-sm font-medium text-muted-foreground p-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {mockReceivables.map((item) => {
                const StatusIcon = getStatusIcon(item.status);
                return (
                  <tr key={item.id} className="border-t hover:bg-secondary/50 transition-colors">
                    <td className="p-3">
                      <div>
                        <p className="font-medium">{item.cliente}</p>
                        <p className="text-xs text-muted-foreground">{item.responsavel}</p>
                      </div>
                    </td>
                    <td className="p-3">
                      <p className="text-sm">{item.descricao}</p>
                    </td>
                    <td className="p-3">
                      <p className="font-medium">{item.valor}</p>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">
                          {new Date(item.vencimento).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant={getStatusBadge(item.status)} className="gap-1">
                        <StatusIcon className="h-3 w-3" />
                        {item.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-sm">{item.parcela}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {item.status !== 'Recebido' && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-success">
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between p-4 border-t">
          <p className="text-sm text-muted-foreground">
            Mostrando 1-5 de 23 recebimentos
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="default" size="sm">1</Button>
            <Button variant="outline" size="sm">2</Button>
            <Button variant="outline" size="sm">3</Button>
            <Button variant="outline" size="sm">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
