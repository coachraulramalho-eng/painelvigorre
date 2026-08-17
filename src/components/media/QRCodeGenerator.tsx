'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  Copy, 
  Check, 
  Share2, 
  QrCode,
  FileText,
  DollarSign,
  FileSignature,
  User,
  Building,
  RefreshCw,
  Loader2
} from 'lucide-react';

interface QRCodeGeneratorProps {
  onGenerate?: (data: string) => void;
  onDownload?: (dataUrl: string) => void;
}

type QRType = 'custom' | 'payment' | 'proposal' | 'contract' | 'document' | 'lead';

export function QRCodeGenerator({ onGenerate, onDownload }: QRCodeGeneratorProps) {
  const [type, setType] = useState<QRType>('custom');
  const [customData, setCustomData] = useState('');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);

  // Dados específicos por tipo
  const [paymentData, setPaymentData] = useState({
    link: '',
    value: '',
    client: '',
  });

  const [proposalData, setProposalData] = useState({
    id: '',
    number: '',
  });

  const [contractData, setContractData] = useState({
    id: '',
    title: '',
  });

  const [documentData, setDocumentData] = useState({
    id: '',
    title: '',
  });

  const [leadData, setLeadData] = useState({
    id: '',
    name: '',
  });

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      let dataToSend: any = { data: '', type: type };

      switch (type) {
        case 'custom':
          if (!customData) {
            setError('Digite os dados para o QR Code');
            setLoading(false);
            return;
          }
          dataToSend.data = customData;
          break;

        case 'payment':
          if (!paymentData.link || !paymentData.value || !paymentData.client) {
            setError('Preencha todos os campos de pagamento');
            setLoading(false);
            return;
          }
          dataToSend = {
            specificType: 'payment',
            data: paymentData,
          };
          break;

        case 'proposal':
          if (!proposalData.id || !proposalData.number) {
            setError('Preencha todos os campos da proposta');
            setLoading(false);
            return;
          }
          dataToSend = {
            specificType: 'proposal',
            data: proposalData,
          };
          break;

        case 'contract':
          if (!contractData.id || !contractData.title) {
            setError('Preencha todos os campos do contrato');
            setLoading(false);
            return;
          }
          dataToSend = {
            specificType: 'contract',
            data: contractData,
          };
          break;

        case 'document':
          if (!documentData.id || !documentData.title) {
            setError('Preencha todos os campos do documento');
            setLoading(false);
            return;
          }
          dataToSend = {
            specificType: 'document',
            data: documentData,
          };
          break;

        case 'lead':
          if (!leadData.id || !leadData.name) {
            setError('Preencha todos os campos do lead');
            setLoading(false);
            return;
          }
          dataToSend = {
            specificType: 'lead',
            data: leadData,
          };
          break;

        default:
          setError('Tipo inválido');
          setLoading(false);
          return;
      }

      const response = await fetch('/api/qrcode/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao gerar QR Code');
      }

      const result = await response.json();
      setQrCode(result.qrCode);

      if (onGenerate) {
        onGenerate(result.qrCode);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao gerar QR Code');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (qrCode && onDownload) {
      onDownload(qrCode);
      return;
    }

    if (qrCode) {
      const link = document.createElement('a');
      link.href = qrCode;
      link.download = `qrcode-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleCopy = () => {
    if (qrCode) {
      navigator.clipboard.writeText(qrCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleShare = async () => {
    if (qrCode) {
      try {
        const response = await fetch(qrCode);
        const blob = await response.blob();
        const file = new File([blob], 'qrcode.png', { type: 'image/png' });
        
        if (navigator.share) {
          await navigator.share({
            title: 'QR Code',
            text: 'QR Code gerado pelo Vigorre ADM™',
            files: [file],
          });
        }
      } catch (error) {
        console.error('Erro ao compartilhar:', error);
      }
    }
  };

  const renderForm = () => {
    switch (type) {
      case 'custom':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Dados do QR Code</label>
              <Input
                placeholder="URL, texto ou dados JSON..."
                value={customData}
                onChange={(e) => setCustomData(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Digite uma URL, texto ou dados em formato JSON
              </p>
            </div>
          </div>
        );

      case 'payment':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Link de Pagamento</label>
              <Input
                placeholder="https://pagamento.com/link/xxx"
                value={paymentData.link}
                onChange={(e) => setPaymentData({ ...paymentData, link: e.target.value })}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Valor</label>
                <Input
                  placeholder="R$ 1.000,00"
                  value={paymentData.value}
                  onChange={(e) => setPaymentData({ ...paymentData, value: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Cliente</label>
                <Input
                  placeholder="Nome do cliente"
                  value={paymentData.client}
                  onChange={(e) => setPaymentData({ ...paymentData, client: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        );

      case 'proposal':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">ID da Proposta</label>
              <Input
                placeholder="proposal_123"
                value={proposalData.id}
                onChange={(e) => setProposalData({ ...proposalData, id: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Número da Proposta</label>
              <Input
                placeholder="PR-2026-001"
                value={proposalData.number}
                onChange={(e) => setProposalData({ ...proposalData, number: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
        );

      case 'contract':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">ID do Contrato</label>
              <Input
                placeholder="contract_123"
                value={contractData.id}
                onChange={(e) => setContractData({ ...contractData, id: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Título do Contrato</label>
              <Input
                placeholder="Contrato de Prestação de Serviços"
                value={contractData.title}
                onChange={(e) => setContractData({ ...contractData, title: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
        );

      case 'document':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">ID do Documento</label>
              <Input
                placeholder="doc_123"
                value={documentData.id}
                onChange={(e) => setDocumentData({ ...documentData, id: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Título do Documento</label>
              <Input
                placeholder="Contrato Assinado"
                value={documentData.title}
                onChange={(e) => setDocumentData({ ...documentData, title: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
        );

      case 'lead':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">ID do Lead</label>
              <Input
                placeholder="lead_123"
                value={leadData.id}
                onChange={(e) => setLeadData({ ...leadData, id: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Nome do Lead</label>
              <Input
                placeholder="João Silva"
                value={leadData.name}
                onChange={(e) => setLeadData({ ...leadData, name: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getTypeIcon = () => {
    const icons: Record<QRType, any> = {
      custom: QrCode,
      payment: DollarSign,
      proposal: FileText,
      contract: FileSignature,
      document: FileText,
      lead: User,
    };
    return icons[type] || QrCode;
  };

  const getTypeLabel = () => {
    const labels: Record<QRType, string> = {
      custom: 'Personalizado',
      payment: 'Pagamento',
      proposal: 'Proposta',
      contract: 'Contrato',
      document: 'Documento',
      lead: 'Lead',
    };
    return labels[type] || 'Personalizado';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Formulário */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Gerar QR Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={type} onValueChange={(v) => setType(v as QRType)}>
            <TabsList className="grid grid-cols-3 lg:grid-cols-6">
              <TabsTrigger value="custom">Custom</TabsTrigger>
              <TabsTrigger value="payment">Pagto</TabsTrigger>
              <TabsTrigger value="proposal">Proposta</TabsTrigger>
              <TabsTrigger value="contract">Contrato</TabsTrigger>
              <TabsTrigger value="document">Doc</TabsTrigger>
              <TabsTrigger value="lead">Lead</TabsTrigger>
            </TabsList>

            <div className="mt-4">
              <TabsContent value={type}>{renderForm()}</TabsContent>
            </div>
          </Tabs>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <Button 
            onClick={handleGenerate} 
            className="w-full gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <QrCode className="h-4 w-4" />
                Gerar QR Code
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Visualização do QR Code */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              {getTypeIcon && <getTypeIcon className="h-5 w-5" />}
              {getTypeLabel()}
            </span>
            <Badge variant="outline">Pronto para uso</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {qrCode ? (
            <div className="space-y-4">
              <div 
                ref={qrRef}
                className="flex items-center justify-center p-8 bg-white rounded-lg border-2 border-dashed border-gray-200"
              >
                <img 
                  src={qrCode} 
                  alt="QR Code" 
                  className="max-w-[250px] w-full h-auto"
                />
              </div>

              <div className="flex items-center justify-center gap-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Baixar
                </Button>
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  {copied ? (
                    <Check className="h-4 w-4 mr-2 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  {copied ? 'Copiado!' : 'Copiar'}
                </Button>
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartilhar
                </Button>
                <Button variant="outline" size="sm" onClick={() => setQrCode(null)}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Novo
                </Button>
              </div>

              <div className="p-3 bg-secondary rounded-lg">
                <p className="text-xs text-muted-foreground text-center">
                  Use este QR Code para compartilhar facilmente com clientes e parceiros
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <QrCode className="h-16 w-16 mb-4 opacity-30" />
              <p className="text-center">
                Preencha os dados ao lado<br />
                e clique em "Gerar QR Code"
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
