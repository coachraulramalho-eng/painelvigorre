'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  PenTool, 
  Eraser, 
  Undo, 
  Redo, 
  Check, 
  X, 
  Loader2,
  Download,
  RefreshCw,
  FileText,
  User,
  Mail,
  Calendar,
  Clock,
  AlertCircle
} from 'lucide-react';

interface SignaturePadProps {
  onSign?: (signatureData: string) => void;
  onDecline?: (reason?: string) => void;
  signerName?: string;
  signerEmail?: string;
  documentTitle?: string;
  token?: string;
  loading?: boolean;
}

export function SignaturePad({ 
  onSign, 
  onDecline,
  signerName = '',
  signerEmail = '',
  documentTitle = '',
  token = '',
  loading = false,
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [showDecline, setShowDecline] = useState(false);
  const [action, setAction] = useState<'sign' | 'decline'>('sign');

  const initializeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configurar tamanho do canvas
    const rect = canvas.parentElement?.getBoundingClientRect();
    const width = rect ? rect.width - 32 : 600;
    const height = 200;

    canvas.width = width;
    canvas.height = height;

    // Configurar estilo
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0B2B4A';

    // Fundo branco
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Linha de base
    ctx.beginPath();
    ctx.moveTo(40, canvas.height - 30);
    ctx.lineTo(canvas.width - 40, canvas.height - 30);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Texto de instrução
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Assine aqui', canvas.width / 2, canvas.height / 2);
  }, []);

  useEffect(() => {
    initializeCanvas();
  }, [initializeCanvas]);

  const getCanvasContext = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext('2d');
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      e.preventDefault();
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      e.preventDefault();
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    saveSignature();
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    setSignatureData(dataUrl);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Redesenhar linha de base
    ctx.beginPath();
    ctx.moveTo(40, canvas.height - 30);
    ctx.lineTo(canvas.width - 40, canvas.height - 30);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.stroke();

    setSignatureData(null);
  };

  const handleSign = () => {
    if (!signatureData) {
      alert('Por favor, assine no campo acima');
      return;
    }
    if (onSign) {
      onSign(signatureData);
    }
  };

  const handleDecline = () => {
    if (!declineReason && action === 'decline') {
      alert('Por favor, informe o motivo da recusa');
      return;
    }
    if (onDecline) {
      onDecline(declineReason);
    }
  };

  const handleDownload = () => {
    if (!signatureData) return;
    const link = document.createElement('a');
    link.href = signatureData;
    link.download = `assinatura-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const touchEvents = {
    onTouchStart: startDrawing,
    onTouchMove: draw,
    onTouchEnd: stopDrawing,
  };

  const mouseEvents = {
    onMouseDown: startDrawing,
    onMouseMove: draw,
    onMouseUp: stopDrawing,
    onMouseLeave: stopDrawing,
  };

  return (
    <div className="space-y-6">
      {/* Informações do Documento */}
      <Card>
        <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <FileText className="h-6 w-6 text-primary" />
            <div>
              <p className="font-medium">{documentTitle || 'Documento'}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {signerName || 'Signatário'}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {signerEmail || 'email@exemplo.com'}
                </span>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="px-4 py-2">
            <Clock className="h-3 w-3 mr-2" />
            Pendente
          </Badge>
        </CardContent>
      </Card>

      {/* Área de Assinatura */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <PenTool className="h-5 w-5" />
              Assinatura
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={clearSignature}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Limpar
              </Button>
              {signatureData && (
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Baixar
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
            <canvas
              ref={canvasRef}
              className="w-full cursor-crosshair"
              style={{ touchAction: 'none' }}
              {...mouseEvents}
              {...touchEvents}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Assine usando o mouse ou touch. Desenhe sua assinatura no campo acima.
          </p>
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <Button 
            onClick={handleSign} 
            className="w-full gap-2"
            disabled={loading || !signatureData}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Assinar Documento
          </Button>
        </div>

        <div className="flex-1 min-w-[200px]">
          <Button 
            variant="destructive" 
            onClick={() => setShowDecline(!showDecline)}
            className="w-full gap-2"
            disabled={loading}
          >
            <X className="h-4 w-4" />
            Recusar Assinatura
          </Button>
        </div>
      </div>

      {/* Motivo da Recusa */}
      {showDecline && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">Motivo da Recusa</p>
                <p className="text-sm text-muted-foreground">
                  Informe o motivo pelo qual você está recusando a assinatura
                </p>
              </div>
            </div>
            <textarea
              className="w-full p-3 border rounded-lg resize-none"
              rows={3}
              placeholder="Descreva o motivo da recusa..."
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
            />
            <div className="flex gap-2">
              <Button variant="destructive" onClick={handleDecline}>
                Confirmar Recusa
              </Button>
              <Button variant="outline" onClick={() => setShowDecline(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview da Assinatura */}
      {signatureData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Pré-visualização da Assinatura</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 border rounded-lg bg-white">
              <img 
                src={signatureData} 
                alt="Assinatura" 
                className="max-h-[80px] mx-auto"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
