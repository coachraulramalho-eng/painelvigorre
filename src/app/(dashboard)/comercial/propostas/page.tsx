'use client';

import { useState } from 'react';
import Link from 'next/link';
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
  Send,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  FileText,
  DollarSign,
  Calendar
} from 'lucide-react';

export default function PropostasPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const mockProposals = [
    { 
      id: 'P001', 
      cliente: 'Empresa ABC', 
      titulo: 'Recrutamento Executivo',
      valor: 'R$ 15.000,00',
      data: '2026-08-10',
      status: 'Em negociação',
      responsavel: 'João Silva'
    },
    { 
      id: 'P002', 
      cliente: 'Tech Solutions', 
      titulo: 'Consultoria em Gestão',
      valor: 'R$ 8.500,00',
      data: '2026-08-12',
      status: 'Aguardando aprovação',
      responsavel: 'Maria Santos'
    },
    { 
      id: 'P003', 
      cliente: 'Grupo XYZ', 
      titulo: 'Recrutamento e Seleção',
      valor: 'R$ 22.000,00',
      data: '2026-08-08',
      status: 'Ganha',
      responsavel: 'Carlos Lima'
    },
    { 
      id: 'P004', 
      cliente: 'Startup Inovação', 
      titulo: 'Diagnóstico Organizacional',
      valor: 'R$ 5.500,00',
      data: '2026-08-14',
      status: 'Enviada',
      responsavel: 'Ana Paula'
    },
    { 
      id: 'P005', 
      cliente: 'Empresa Beta', 
      titulo: 'Consultoria Estratégica',
      valor: 'R$ 12.000,00',
      data: '2026-08-05',
      status: 'Perdida',
      responsavel: 'Pedro Oliveira'
    },
  ];

  const metrics = [
    { label: 'Total Propostas', value: 24, color: 'text-blue-600' },
    { label: 'Em Negociação', value: 8, color: 'text-yellow-600' },
    { label: 'Ganhas', value: 6, color: 'text-green-600' },
    { label: 'Perdidas', value: 4, color: 'text-red-600' },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      'Rascunho': 'secondary',
      'Em análise': 'secondary',
      'Aguardando aprovação': 'warning',
      'Aprovada': 'success',
      'Enviada': 'default',
      'Visualizada': 'default',
      'Em negociação': 'warning',
      'Aguardando decisão': 'warning',
      'Ganha': 'success',
      'Perdida': 'destructive',
      'Cancelada': 'destructive',
      'Expirada': 'secondary',
    };
    return variants[status] || 'default';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, any> = {
      'Rascunho': FileText,
      'Em análise': Clock,
      'Aguardando aprovação': Clock,
      'Aprovada': CheckCircle,
      'Enviada': Send,
      'Visualizada': Eye,
      'Em negociação': Clock,
      'Aguardando decisão': Clock,
      'Ganha': CheckCircle,
      'Perdida': XCircle,
      'Cancelada': XCircle,
    };
    return icons[status] || FileText;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Propostas</h1>
          <p className="text-muted-foreground">Gerencie todas as propostas comerciais da Vigorre</p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/comercial/propostas/novo">
            <Plus className="h-4 w-4" />
            Nova Proposta
          </Link>
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
                  placeholder="Buscar cliente, título..."
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
                <th className="text-left text-sm font-medium text-muted-foreground p-3">Número</th>
                <th className="text-left text-sm font-medium text-muted-foreground p-3">Cliente</th>
                <th className="text-left text-sm font-medium text-muted-foreground p-3">Título</th>
                <th className="text-left text-sm font-medium text-muted-foreground p-3">Valor</th>
                <th className="text-left text-sm font-medium text-muted-foreground p-3">Data</th>
                <th className="text-left text-sm font-medium text-muted-foreground p-3">Status</th>
                <th className="text-right text-sm font-medium text-muted-foreground p-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {mockProposals.map((proposal) => {
                const StatusIcon = getStatusIcon(proposal.status);
                return (
                  <tr key={proposal.id} className="border-t hover:bg-secondary/50 transition-colors">
                    <td className="p-3">
                      <p className="font-medium">#{proposal.id}</p>
                    </td>
                    <td className="p-3">
                      <div>
                        <p className="font-medium">{proposal.cliente}</p>
                        <p className="text-xs text-muted-foreground">{proposal.responsavel}</p>
                      </div>
                    </td>
                    <td className="p-3">
                      <p className="text-sm">{proposal.titulo}</p>
                    </td>
                    <td className="p-3">
                      <p className="font-medium">{proposal.valor}</p>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">
                          {new Date(proposal.data).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant={getStatusBadge(proposal.status)} className="gap-1">
                        <StatusIcon className="h-3 w-3" />
                        {proposal.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                        {proposal.status !== 'Enviada' && proposal.status !== 'Ganha' && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-success">
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
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
            Mostrando 1-5 de 32 propostas
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
