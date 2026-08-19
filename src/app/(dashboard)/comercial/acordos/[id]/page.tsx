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
  Edit, 
  Handshake,
  User,
  Building2,
  FileText,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Loader2
} from 'lucide-react';

interface Acordo {
  id: string;
  representativeId: string;
  companyId: string;
  service: string;
  percentage: number;
  fixedValue: number;
  calculationBase: string;
  validityStart: string;
  validityEnd: string;
  status: string;
  notes: string;
  createdAt: string;
  representative: {
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
  company: {
    id: string;
    name: string;
    document: string;
  };
}

export default function VisualizarAcordoPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [acordo, setAcordo] = useState<Acordo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAcordo();
  }, [id]);

  const loadAcordo = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/comercial/acordos/${id}`);
      if (response.ok) {
        const data = await response.json();
        setAcordo(data.agreement);
      } else {
        setError('Acordo não encontrado');
      }
    } catch (error) {
      console.error('Erro ao carregar acordo:', error);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      'Ativo': 'success',
      'Encerrado': 'secondary',
      'Cancelado': 'destructive',
    };
    return variants[status] || 'secondary';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, any> = {
      'Ativo': CheckCircle,
      'Encerrado': Clock,
      'Cancelado': XCircle,
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

  if (error || !acordo) {
    return (
      <div className="text-center py-12">
        <Handshake className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">{error || 'Acordo não encontrado'}</p>
        <Button asChild className="mt-4">
          <Link href="/comercial/acordos">Voltar</Link>
        </Button>
      </div>
    );
  }

  const StatusIcon = getStatusIcon(acordo.status);

  return (
    <div className="space-y-6">
      <PageHeader
        title={acordo.service}
        description="Detalhes do acordo comercial"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/comercial/acordos">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/comercial/acordos/${id}/editar`}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações Principais */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Informações do Acordo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Representante</p>
                  <p className="font-medium">{acordo.representative?.user?.name || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p className="font-medium">{acordo.company?.name || 'Geral'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Serviço</p>
                  <p className="font-medium">{acordo.service}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Comissão</p>
                  <p className="font-medium">
                    {acordo.percentage ? `${acordo.percentage}%` : 'N/A'}
                    {acordo.fixedValue && ` + ${formatCurrency(acordo.fixedValue)}`}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 col-span-2">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Base de Cálculo</p>
                  <p className="font-medium">{acordo.calculationBase}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status e Vigência */}
        <Card>
          <CardHeader>
            <CardTitle>Status e Vigência</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
              <StatusIcon className={`h-8 w-8 ${
                acordo.status === 'Ativo' ? 'text-green-600' :
                acordo.status === 'Encerrado' ? 'text-gray-400' :
                'text-red-600'
              }`} />
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={getStatusBadge(acordo.status)}>
                  {acordo.status}
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 p-2 bg-secondary rounded-lg">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Início da Vigência</p>
                  <p className="font-medium">
                    {acordo.validityStart ? new Date(acordo.validityStart).toLocaleDateString('pt-BR') : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-secondary rounded-lg">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Fim da Vigência</p>
                  <p className="font-medium">
                    {acordo.validityEnd ? new Date(acordo.validityEnd).toLocaleDateString('pt-BR') : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-secondary rounded-lg">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Criado em {new Date(acordo.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Observações */}
      {acordo.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{acordo.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
