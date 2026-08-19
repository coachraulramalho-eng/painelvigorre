'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { 
  ArrowLeft, 
  Edit, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase,
  DollarSign,
  FileText,
  Building2,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Loader2
} from 'lucide-react';

interface Representative {
  id: string;
  userId: string;
  type: string;
  document: string;
  phone: string;
  email: string;
  address: string;
  region: string;
  services: string;
  bankData: string;
  pix: string;
  status: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  commissions: Array<{
    id: string;
    value: number;
    status: string;
    paymentDate: string;
    proposal: { number: string; title: string };
  }>;
  agreements: Array<{
    id: string;
    service: string;
    percentage: number;
    fixedValue: number;
    status: string;
    company: { name: string };
  }>;
  _count: {
    commissions: number;
    agreements: number;
  };
}

export default function VisualizarRepresentantePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [representante, setRepresentante] = useState<Representative | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRepresentante();
  }, [id]);

  const loadRepresentante = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/comercial/representantes/${id}`);
      if (response.ok) {
        const data = await response.json();
        setRepresentante(data.representative);
      } else {
        setError('Representante não encontrado');
      }
    } catch (error) {
      console.error('Erro ao carregar representante:', error);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      'Ativo': 'success',
      'Inativo': 'secondary',
      'Em análise': 'warning',
    };
    return variants[status] || 'secondary';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, any> = {
      'Ativo': CheckCircle,
      'Inativo': XCircle,
      'Em análise': Clock,
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

  if (error || !representante) {
    return (
      <div className="text-center py-12">
        <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">{error || 'Representante não encontrado'}</p>
        <Button asChild className="mt-4">
          <Link href="/comercial/representantes">Voltar</Link>
        </Button>
      </div>
    );
  }

  const StatusIcon = getStatusIcon(representante.status);

  const commissionColumns = [
    { key: 'proposal', label: 'Proposta' },
    { key: 'value', label: 'Valor', render: (value: number) => formatCurrency(value) },
    { key: 'status', label: 'Status' },
    { key: 'paymentDate', label: 'Data Pagamento' },
  ];

  const agreementColumns = [
    { key: 'company', label: 'Cliente' },
    { key: 'service', label: 'Serviço' },
    { key: 'percentage', label: 'Comissão %' },
    { key: 'fixedValue', label: 'Valor Fixo' },
    { key: 'status', label: 'Status' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={representante.user?.name || 'Representante'}
        description="Detalhes do representante"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/comercial/representantes">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/comercial/representantes/${id}/editar`}>
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
            <CardTitle>Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-medium">{representante.user?.name || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">E-mail</p>
                  <p className="font-medium">{representante.user?.email || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="font-medium">{representante.phone || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Tipo</p>
                  <p className="font-medium">{representante.type}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Documento</p>
                  <p className="font-medium">{representante.document}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Região</p>
                  <p className="font-medium">{representante.region || 'N/A'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status e Resumo */}
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
              <StatusIcon className={`h-8 w-8 ${
                representante.status === 'Ativo' ? 'text-green-600' :
                representante.status === 'Inativo' ? 'text-gray-400' :
                'text-yellow-600'
              }`} />
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={getStatusBadge(representante.status)}>
                  {representante.status}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-secondary rounded-lg">
                <p className="text-2xl font-bold">{representante._count.commissions}</p>
                <p className="text-xs text-muted-foreground">Comissões</p>
              </div>
              <div className="text-center p-3 bg-secondary rounded-lg">
                <p className="text-2xl font-bold">{representante._count.agreements}</p>
                <p className="text-xs text-muted-foreground">Acordos</p>
              </div>
            </div>

            <div className="p-3 bg-secondary rounded-lg">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Cadastrado em {new Date(representante.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dados Bancários */}
      <Card>
        <CardHeader>
          <CardTitle>Dados Bancários</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Dados Bancários</p>
              <p className="font-medium">{representante.bankData || 'Não informado'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">PIX</p>
              <p className="font-medium">{representante.pix || 'Não informado'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comissões */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Comissões
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={commissionColumns}
            data={representante.commissions.map(c => ({
              ...c,
              proposal: c.proposal ? `#${c.proposal.number} - ${c.proposal.title}` : 'N/A',
            }))}
            pageSize={5}
          />
        </CardContent>
      </Card>

      {/* Acordos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Acordos Comerciais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={agreementColumns}
            data={representante.agreements.map(a => ({
              ...a,
              company: a.company?.name || 'Geral',
            }))}
            pageSize={5}
          />
        </CardContent>
      </Card>
    </div>
  );
}
