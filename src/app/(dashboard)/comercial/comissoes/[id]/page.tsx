'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/PageHeader';
import { 
  ArrowLeft, 
  DollarSign,
  User,
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  CreditCard
} from 'lucide-react';

interface Commission {
  id: string;
  representativeId: string;
  proposalId: string;
  value: number;
  status: string;
  paymentDate: string;
  notes: string;
  createdAt: string;
  representative: {
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
  proposal: {
    id: string;
    number: string;
    title: string;
    finalValue: number;
  };
  accountReceivable: {
    id: string;
    description: string;
    value: number;
    status: string;
  };
}

export default function VisualizarComissaoPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [comissao, setComissao] = useState<Commission | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadComissao();
  }, [id]);

  const loadComissao = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/comercial/comissoes/${id}`);
      if (response.ok) {
        const data = await response.json();
        setComissao(data.commission);
      } else {
        setError('Comissão não encontrada');
      }
    } catch (error) {
      console.error('Erro ao carregar comissão:', error);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      'Prevista': 'secondary',
      'Aprovada': 'success',
      'Pendente': 'warning',
      'Paga': 'success',
    };
    return variants[status] || 'secondary';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, any> = {
      'Prevista': Clock,
      'Aprovada': CheckCircle,
      'Pendente': Clock,
      'Paga': CheckCircle,
    };
    return icons[status] || Clock;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !comissao) {
    return (
      <div className="text-center py-12">
        <DollarSign className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">{error || 'Comissão não encontrada'}</p>
        <Button asChild className="mt-4">
          <Link href="/comercial/comissoes">Voltar</Link>
        </Button>
      </div>
    );
  }

  const StatusIcon = getStatusIcon(comissao.status);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Detalhes da Comissão"
        description="Informações da comissão do representante"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/comercial/comissoes">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Link>
            </Button>
            {comissao.status === 'Pendente' && (
              <Button className="gap-2">
                <CheckCircle className="h-4 w-4" />
                Marcar como Paga
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações Principais */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Informações da Comissão</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Representante</p>
                  <p className="font-medium">{comissao.representative?.user?.name || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Proposta</p>
                  <p className="font-medium">
                    {comissao.proposal ? `#${comissao.proposal.number} - ${comissao.proposal.title}` : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Valor</p>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(comissao.value)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Conta a Receber</p>
                  <p className="font-medium">
                    {comissao.accountReceivable?.description || 'N/A'}
                    {comissao.accountReceivable?.value && ` (${formatCurrency(comissao.accountReceivable.value)})`}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
              <StatusIcon className={`h-8 w-8 ${
                comissao.status === 'Paga' ? 'text-green-600' :
                comissao.status === 'Pendente' ? 'text-yellow-600' :
                comissao.status === 'Aprovada' ? 'text-green-600' :
                'text-gray-400'
              }`} />
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={getStatusBadge(comissao.status)}>
                  {comissao.status}
                </Badge>
              </div>
            </div>

            {comissao.paymentDate && (
              <div className="flex items-center gap-2 p-2 bg-secondary rounded-lg">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Data de Pagamento</p>
                  <p className="font-medium">
                    {new Date(comissao.paymentDate).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            )}

            <div className="p-3 bg-secondary rounded-lg">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Criado em {new Date(comissao.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Observações */}
      {comissao.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{comissao.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
