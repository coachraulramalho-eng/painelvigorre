'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/format';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig: Record<string, { variant: any; icon: string; label: string }> = {
  // Leads
  'Novo': { variant: 'default', icon: '🆕', label: 'Novo' },
  'Em contato': { variant: 'warning', icon: '📞', label: 'Em Contato' },
  'Qualificado': { variant: 'success', icon: '✅', label: 'Qualificado' },
  'Não qualificado': { variant: 'secondary', icon: '❌', label: 'Não Qualificado' },
  'Convertido': { variant: 'success', icon: '🔄', label: 'Convertido' },
  'Perdido': { variant: 'destructive', icon: '💔', label: 'Perdido' },
  
  // Propostas
  'Rascunho': { variant: 'secondary', icon: '📄', label: 'Rascunho' },
  'Aguardando aprovação': { variant: 'warning', icon: '⏳', label: 'Aguardando Aprovação' },
  'Aprovada': { variant: 'success', icon: '✅', label: 'Aprovada' },
  'Enviada': { variant: 'default', icon: '📤', label: 'Enviada' },
  'Em negociação': { variant: 'warning', icon: '🤝', label: 'Em Negociação' },
  'Ganha': { variant: 'success', icon: '🏆', label: 'Ganha' },
  'Perdida': { variant: 'destructive', icon: '💔', label: 'Perdida' },
  'Cancelada': { variant: 'destructive', icon: '🚫', label: 'Cancelada' },
  'Expirada': { variant: 'secondary', icon: '⏰', label: 'Expirada' },
  
  // Financeiro
  'Previsto': { variant: 'secondary', icon: '📅', label: 'Previsto' },
  'A vencer': { variant: 'warning', icon: '⏰', label: 'A Vencer' },
  'Vencido': { variant: 'destructive', icon: '⚠️', label: 'Vencido' },
  'Recebido': { variant: 'success', icon: '💰', label: 'Recebido' },
  'Pago': { variant: 'success', icon: '✅', label: 'Pago' },
  'Faturado': { variant: 'default', icon: '📄', label: 'Faturado' },
  
  // Geral
  'Ativo': { variant: 'success', icon: '🟢', label: 'Ativo' },
  'Inativo': { variant: 'secondary', icon: '🔴', label: 'Inativo' },
  'Pendente': { variant: 'warning', icon: '⏳', label: 'Pendente' },
  'Concluído': { variant: 'success', icon: '✅', label: 'Concluído' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { variant: 'secondary', icon: '📌', label: status };
  
  return (
    <Badge variant={config.variant as any} className={cn('gap-1', className)}>
      <span>{config.icon}</span>
      {config.label}
    </Badge>
  );
}
