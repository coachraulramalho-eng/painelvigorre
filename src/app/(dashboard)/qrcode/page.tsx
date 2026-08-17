'use client';

import { QRCodeGenerator } from '@/components/media/QRCodeGenerator';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, QrCode, Link2, Eye } from 'lucide-react';

export default function QRCodePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="QR Code"
        description="Gerencie QR Codes para pagamentos, propostas e documentos"
        badge="Novo"
      />

      <QRCodeGenerator />

      {/* QR Codes Recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            QR Codes Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { type: 'Pagamento', cliente: 'Empresa ABC', value: 'R$ 15.000', created: '17/08/2026', uses: 3 },
              { type: 'Proposta', cliente: 'Tech Solutions', value: 'R$ 8.500', created: '16/08/2026', uses: 1 },
              { type: 'Contrato', cliente: 'Grupo XYZ', value: 'R$ 22.000', created: '15/08/2026', uses: 5 },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <div className="flex items-center gap-3">
                  <QrCode className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{item.cliente}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline">{item.type}</Badge>
                      <span>{item.value}</span>
                      <span>• {item.created}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{item.uses} usos</Badge>
                  <button className="p-2 hover:bg-primary/10 rounded-lg transition-colors">
                    <Link2 className="h-4 w-4" />
                  </button>
                  <button className="p-2 hover:bg-primary/10 rounded-lg transition-colors">
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
