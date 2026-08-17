'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { SignaturePad } from '@/components/signature/SignaturePad';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText,
  AlertTriangle,
  Home
} from 'lucide-react';
import Link from 'next/link';

interface SignatureStatus {
  id: string;
  documentId: string;
  documentTitle: string;
  signerName: string;
  signerEmail: string;
  status: 'pending' | 'viewed' | 'signed' | 'declined' | 'expired' | 'cancelled';
  expiresAt?: string;
  createdAt: string;
  document: {
    fileUrl: string;
    company?: { name: string };
  };
}

export default function SignaturePage() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [status, setStatus] = useState<SignatureStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchStatus();
  }, [token]);

  const fetchStatus = async () => {
    try {
      const response = await fetch(`/api/signature/status?token=${token}`);
      if (!response.ok) {
        throw new Error('Solicitação de assinatura inválida');
      }
      const data = await response.json();
      setStatus(data.signatureRequest);
      
      // Marcar como visualizado
      await fetch('/api/signature/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action: 'view' }),
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao carregar');
    } finally {
      setLoading(false);
    }
  };

  const handleSign = async (signatureData: string) => {
    setSigning(true);
    try {
      const response = await fetch('/api/signature/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          action: 'sign',
          signatureData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao assinar');
      }

      const data = await response.json();
      setSuccess('Documento assinado com sucesso!');
      setStatus(prev => prev ? { ...prev, status: 'signed' } : null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao assinar');
    } finally {
      setSigning(false);
    }
  };

  const handleDecline = async (reason?: string) => {
    setSigning(true);
    try {
      const response = await fetch('/api/signature/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          action: 'decline',
          reason,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao recusar');
      }

      setSuccess('Assinatura recusada');
      setStatus(prev => prev ? { ...prev, status: 'declined' } : null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao recusar');
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6">
            <Alert variant="destructive">
              <AlertTriangle className="h-5 w-5" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button className="w-full mt-4" asChild>
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Voltar ao Início
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6">
            <Alert variant="destructive">
              <AlertTriangle className="h-5 w-5" />
              <AlertTitle>Não Encontrado</AlertTitle>
              <AlertDescription>Solicitação de assinatura não encontrada</AlertDescription>
            </Alert>
            <Button className="w-full mt-4" asChild>
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Voltar ao Início
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status.status === 'expired') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <Clock className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold">Solicitação Expirada</h2>
            <p className="text-muted-foreground mt-2">
              Esta solicitação de assinatura expirou em{' '}
              {status.expiresAt && new Date(status.expiresAt).toLocaleDateString('pt-BR')}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Solicite um novo link de assinatura
            </p>
            <Button className="w-full mt-4" asChild>
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Voltar ao Início
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status.status === 'signed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold">Documento Assinado!</h2>
            <p className="text-muted-foreground mt-2">
              {status.signerName}, você assinou <strong>{status.documentTitle}</strong>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Assinado em {status.signatureDate ? new Date(status.signatureDate).toLocaleString('pt-BR') : ''}
            </p>
            <Button className="w-full mt-4" asChild>
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Voltar ao Início
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status.status === 'declined') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold">Assinatura Recusada</h2>
            <p className="text-muted-foreground mt-2">
              Você recusou a assinatura de <strong>{status.documentTitle}</strong>
            </p>
            {status.notes && (
              <div className="mt-4 p-3 bg-secondary rounded-lg text-sm">
                Motivo: {status.notes}
              </div>
            )}
            <Button className="w-full mt-4" asChild>
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Voltar ao Início
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-primary rounded-xl mb-4">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-primary">Assinatura Digital</h1>
          <p className="text-muted-foreground">
            Assine o documento de forma segura e digital
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <Alert variant="success" className="mb-6">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Sucesso!</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Signature Pad */}
        <SignaturePad
          onSign={handleSign}
          onDecline={handleDecline}
          signerName={status.signerName}
          signerEmail={status.signerEmail}
          documentTitle={status.documentTitle}
          token={token as string}
          loading={signing}
        />

        {/* Informações Adicionais */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Documento</p>
                <p className="font-medium">{status.documentTitle}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Empresa</p>
                <p className="font-medium">{status.document?.company?.name || 'Vigorre'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Solicitado em</p>
                <p className="font-medium">
                  {new Date(status.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Expira em</p>
                <p className="font-medium">
                  {status.expiresAt 
                    ? new Date(status.expiresAt).toLocaleDateString('pt-BR')
                    : 'Sem expiração'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações Legais */}
        <p className="text-xs text-muted-foreground text-center mt-6">
          Ao assinar, você concorda com os termos do documento.
          A assinatura eletrônica tem validade jurídica conforme Lei nº 14.063/2020.
        </p>
      </div>
    </div>
  );
}
