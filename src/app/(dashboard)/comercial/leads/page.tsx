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
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function LeadsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const mockLeads = [
    { id: 1, name: 'Empresa ABC', contact: 'João Silva', phone: '(11) 98765-4321', email: 'joao@abc.com', status: 'Novo', origin: 'LinkedIn', date: '2026-08-17' },
    { id: 2, name: 'Tech Solutions', contact: 'Maria Santos', phone: '(11) 91234-5678', email: 'maria@tech.com', status: 'Em contato', origin: 'Site', date: '2026-08-16' },
    { id: 3, name: 'Grupo XYZ', contact: 'Carlos Lima', phone: '(11) 93456-7890', email: 'carlos@xyz.com', status: 'Qualificado', origin: 'Indicação', date: '2026-08-15' },
    { id: 4, name: 'Startup Inovação', contact: 'Ana Paula', phone: '(11) 94567-8901', email: 'ana@startup.com', status: 'Convertido', origin: 'Instagram', date: '2026-08-14' },
    { id: 5, name: 'Empresa Beta', contact: 'Pedro Oliveira', phone: '(11) 95678-9012', email: 'pedro@beta.com', status: 'Perdido', origin: 'Facebook', date: '2026-08-13' },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      'Novo': 'default',
      'Em contato': 'warning',
      'Qualificado': 'success',
      'Convertido': 'success',
      'Perdido': 'destructive',
    };
    return variants[status] || 'default';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Leads</h1>
          <p className="text-muted-foreground">Gerencie todos os leads da Vigorre</p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/comercial/leads/novo">
            <Plus className="h-4 w-4" />
            Novo Lead
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar leads..."
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

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary">
              <tr>
                <th className="text-left text-sm font-medium text-muted-foreground p-3">Lead</th>
                <th className="text-left text-sm font-medium text-muted-foreground p-3">Contato</th>
                <th className="text-left text-sm font-medium text-muted-foreground p-3">Status</th>
                <th className="text-left text-sm font-medium text-muted-foreground p-3">Origem</th>
                <th className="text-left text-sm font-medium text-muted-foreground p-3">Data</th>
                <th className="text-right text-sm font-medium text-muted-foreground p-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {mockLeads.map((lead) => (
                <tr key={lead.id} className="border-t hover:bg-secondary/50 transition-colors">
                  <td className="p-3">
                    <div>
                      <p className="font-medium">{lead.name}</p>
                      <p className="text-xs text-muted-foreground">{lead.email}</p>
                    </div>
                  </td>
                  <td className="p-3">
                    <div>
                      <p className="text-sm">{lead.contact}</p>
                      <p className="text-xs text-muted-foreground">{lead.phone}</p>
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge variant={getStatusBadge(lead.status)}>
                      {lead.status}
                    </Badge>
                  </td>
                  <td className="p-3 text-sm">{lead.origin}</td>
                  <td className="p-3 text-sm">
                    {new Date(lead.date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between p-4 border-t">
          <p className="text-sm text-muted-foreground">
            Mostrando 1-5 de 47 leads
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="default" size="sm">1</Button>
            <Button variant="outline" size="sm">2</Button>
            <Button variant="outline" size="sm">3</Button>
            <Button variant="outline" size="sm">4</Button>
            <Button variant="outline" size="sm">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
