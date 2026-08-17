'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building, Phone, Mail, Calendar, MoreVertical } from 'lucide-react';

interface LeadCardProps {
  lead?: {
    id: string;
    name: string;
    company: string;
    phone: string;
    email: string;
    status: string;
    origin: string;
    createdAt: string;
    responsible: string;
  };
}

export function LeadCard({ lead }: LeadCardProps) {
  const defaultLead = {
    id: '1',
    name: 'João Silva',
    company: 'Empresa ABC',
    phone: '(11) 98765-4321',
    email: 'joao@empresaabc.com',
    status: 'Em contato',
    origin: 'LinkedIn',
    createdAt: '2026-08-10',
    responsible: 'Maria Santos',
  };

  const data = lead || defaultLead;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Novo': 'bg-blue-100 text-blue-700',
      'Em contato': 'bg-yellow-100 text-yellow-700',
      'Qualificado': 'bg-green-100 text-green-700',
      'Não qualificado': 'bg-gray-100 text-gray-700',
      'Convertido': 'bg-purple-100 text-purple-700',
      'Perdido': 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <Link href={`/comercial/crm/${data.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate">{data.name}</h4>
              <p className="text-sm text-muted-foreground truncate">{data.company}</p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-2">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{data.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{data.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-3 w-3 flex-shrink-0" />
              <span>{new Date(data.createdAt).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <Badge className={getStatusColor(data.status)}>
              {data.status}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {data.responsible}
            </span>
          </div>

          <div className="mt-2">
            <Badge variant="outline" className="text-xs">
              {data.origin}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
