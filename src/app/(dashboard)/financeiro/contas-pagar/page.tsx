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

export default function ContasPagarPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const mockPayables = [
    { 
      id: 1, 
      fornecedor: 'Fornecedor TI Ltda', 
      descricao: 'Licença Software',
      valor: 'R$ 3.500,00',
      vencimento: '2026-09-10',
      status: 'A vencer',
      categoria: 'Tecnologia',
      responsavel: 'Carlos Lima'
    },
    { 
      id: 2, 
      fornecedor: 'Serviços Marketing', 
      descricao: 'Campanha LinkedIn',
      valor: 'R$ 5.000,00',
      vencimento: '2026-08-15',
      status: 'Vencido',
      categoria: 'Marketing',
      responsavel: 'Ana Paula'
    },
    { 
      id: 3, 
      fornecedor: 'Escritório Contábil', 
      descricao: 'Serviços Contábeis',
      valor: 'R$ 1.200,00',
      vencimento: '2026-08-05',
      status: 'Pago',
      categoria: 'Administrativo',
      responsavel: 'João Silva'
    },
    { 
      id: 4, 
      fornecedor: 'Aluguel', 
      descricao: 'Aluguel Escritório',
      valor: 'R$ 4.500,00',
      vencimento: '2026-09-01',
      status: 'Prevista',
      categoria: 'Administrativo',
      responsavel: 'Maria Santos'
    },
    { 
      id: 5, 
      fornecedor: 'Internet Provider', 
      descricao: 'Internet e Telefonia',
      valor: 'R$ 850,00',
      vencimento: '2026-08-28',
      status: 'A vencer',
      categoria: 'Tecnologia',
      responsavel: 'Pedro Oliveira'
    },
  ];

  const metrics = [
    { label: 'Total a Pagar', value: 'R$ 15.050,00', color: 'text-red-600' },
    { label: 'Vencidos', value: 'R$ 5.000,00', color: 'text-red-600' },
    { label: 'A Vencer', value: 'R$ 4.350,00', color: 'text-yellow-600' },
    { label: 'Pagos (mês)', value: 'R$ 1.200,00', color: 'text-green-600' },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      'Prevista': 'secondary',
      'A vencer': 'warning',
      'Vencido': 'destructive',
      'Pago': 'success',
    };
    return variants[status] || 'default';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, any> = {
      'Prevista': Clock,
      'A vencer': Calendar,
      'Vencido': XCircle,
      'Pago': CheckCircle,
    };
    return icons[status] || Clock;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Contas a Pagar</h1>
          <p className="text-muted-foreground">Gerencie todas as obrigações financeiras da Vigorre</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Despesa
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
                  placeholder="Buscar fornecedor, descrição..."
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
                <th className="text-left text-sm font-medium text-muted-foreground p-3">Fornecedor</th>
                <th className="text-left text-sm font-medium text-muted-foreground p-3">Descrição</th>
                <th className="text-left text-sm font-medium text-muted-foreground p-3">Valor</th>
                <th className="text-left text-sm font-medium text-muted-foreground p-3">Vencimento</th>
                <th className="text-left text-sm font-medium text-muted-foreground p-3">Categoria</th>
                <th className="text-left text-sm font-medium text-muted-foreground p-3">Status</th>
                <th className="text-right text-sm font-medium text-muted-foreground p-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {mockPayables.map((item) => {
                const StatusIcon = getStatusIcon(item.status);
                return (
                  <tr key={item.id} className="border-t hover:bg-secondary/50 transition-colors">
                    <td className="p-3">
                      <div>
                        <p className="font-medium">{item.fornecedor}</p>
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
                      <Badge variant="outline">{item.categoria}</Badge>
                    </td>
                    <td className="p-3">
                      <Badge variant={getStatusBadge(item.status)} className="gap-1">
                        <StatusIcon className="h-3 w-3" />
                        {item.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {item.status !== 'Pago' && (
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
            Mostrando 1-5 de 18 contas
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
