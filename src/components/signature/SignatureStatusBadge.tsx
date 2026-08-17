'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/format';
import { 
  Clock, 
  Eye, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Ban
} from 'lucide-react';

interface SignatureStatusBadgeProps {
  status: 'pending' | 'viewed' | 'signed' | 'declined' | 'expired' | 'cancelled';
  className?: string;
}

const statusConfig: Record<string, { variant: any; icon: any; label: string }> = {
  pending: { variant: 'warning', icon: Clock, label: 'Pendente' },
  viewed: { variant: 'default', icon: Eye, label: 'Visualizado' },
  signed: { variant: 'success', icon: CheckCircle, label: 'Assinado' },
  declined: { variant: 'destructive', icon: XCircle, label: 'Recusado' },
  expired: { variant: 'secondary', icon: AlertCircle, label: 'Expirado' },
  cancelled: { variant: 'secondary', icon: Ban, label: 'Cancelado' },
};

export function SignatureStatusBadge({ status, className }: SignatureStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={cn('gap-1', className)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
