'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { 
  Calendar, 
  DollarSign, 
  User, 
  Building, 
  Eye, 
  Edit, 
  Send,
  MoreVertical 
} from 'lucide-react';

interface ProposalCardProps {
  proposal: {
    id: string;
    number: string;
    title: string;
    client: string;
    value: number;
    status: string;
    createdAt: string;
    responsible: string;
  };
  onView?: () => void;
  onEdit?: () => void;
  onSend?: () => void;
}

export function ProposalCard({ proposal, onView, onEdit, onSend }: ProposalCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                #{proposal.number}
              </span>
              <Badge variant="outline">{proposal.title}</Badge>
            </div>
            <h4 className="font-semibold mt-1">{proposal.client}</h4>
          </div>
          <StatusBadge status={proposal.status} />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{formatCurrency(proposal.value)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{new Date(proposal.createdAt).toLocaleDateString('pt-BR')}</span>
          </div>
          <div className="flex items-center gap-2 col-span-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{proposal.responsible}</span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-end gap-1 pt-3 border-t">
          <Button variant="ghost" size="sm" className="gap-1" onClick={onView}>
            <Eye className="h-3 w-3" />
            Visualizar
          </Button>
          <Button variant="ghost" size="sm" className="gap-1" onClick={onEdit}>
            <Edit className="h-3 w-3" />
            Editar
          </Button>
          {proposal.status !== 'Enviada' && proposal.status !== 'Ganha' && (
            <Button variant="ghost" size="sm" className="gap-1 text-green-600" onClick={onSend}>
              <Send className="h-3 w-3" />
              Enviar
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
