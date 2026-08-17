'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ActivityTimeline } from '@/components/comercial/ActivityTimeline';
import { 
  ArrowLeft, 
  Edit, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Calendar,
  FileText,
  DollarSign,
  MessageSquare,
  MoreVertical
} from 'lucide-react';

export default function LeadDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  // Dados mockados - substituir por API
  const lead = {
    id: id,
    name: 'Empresa ABC Ltda',
    document: '12.345.678/0001-90',
    phone: '(11) 98765-4321',
    email: 'contato@empresaabc.com',
    address: 'Rua Exemplo, 123 - São Paulo, SP',
    segment: 'Tecnologia',
    status: 'Em contato',
    origin: 'LinkedIn',
    responsible: 'João Silva',
    representative: 'Carlos Santos',
    createdAt: '2026-08-10',
    notes: 'Empresa com potencial para contratar serviços de recrutamento.',
  };

  const activities = [
    { type: 'Ligação', description: 'Primeiro contato com o lead', date: '2026-08-10 10:00', responsible: 'João Silva' },
    { type: 'E-mail', description: 'Envio de material institucional', date: '2026-08-12 14:30', responsible: 'João Silva' },
    { type: 'Reunião', description: 'Apresentação comercial', date: '2026-08-15 09:00', responsible: 'João Silva' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-primary">{lead.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <Badge variant={lead.status === 'Em contato' ? 'default' : 'secondary'}>
              {lead.status}
            </Badge>
            <span className="text-sm text-muted-foreground">• {lead.segment}</span>
            <span className="text-sm text-muted-foreground">• Origem: {lead.origin}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Follow-up
          </Button>
          <Button variant="outline" className="gap-2">
            <Edit className="h-4 w-4" />
            Editar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações principais */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Empresa</p>
                    <p className="font-medium">{lead.name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-0.5">CNPJ</Badge>
                  <div>
                    <p className="text-sm text-muted-foreground">Documento</p>
                    <p className="font-medium">{lead.document}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Telefone</p>
                    <p className="font-medium">{lead.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">E-mail</p>
                    <p className="font-medium">{lead.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Endereço</p>
                    <p className="font-medium">{lead.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Cadastrado em</p>
                    <p className="font-medium">{new Date(lead.createdAt).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Atividades</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityTimeline activities={activities} />
            </CardContent>
          </Card>

          {/* Propostas e Oportunidades */}
          <Card>
            <CardHeader>
              <CardTitle>Oportunidades e Propostas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { title: 'Recrutamento Executivo', value: 'R$ 30.000', status: 'Em negociação', probability: '80%' },
                  { title: 'Consultoria em Gestão', value: 'R$ 15.000', status: 'Proposta enviada', probability: '60%' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-secondary rounded">
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.value}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">{item.status}</Badge>
                      <p className="text-sm text-muted-foreground mt-1">Prob: {item.probability}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Responsáveis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-2 bg-secondary rounded">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">JS</span>
                </div>
                <div>
                  <p className="text-sm font-medium">{lead.responsible}</p>
                  <p className="text-xs text-muted-foreground">Responsável</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 bg-secondary rounded">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-700 text-sm font-semibold">CS</span>
                </div>
                <div>
                  <p className="text-sm font-medium">{lead.representative}</p>
                  <p className="text-xs text-muted-foreground">Representante</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2">
                <FileText className="h-4 w-4" />
                Criar Proposta
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <DollarSign className="h-4 w-4" />
                Gerar Link de Pagamento
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <MessageSquare className="h-4 w-4" />
                Agendar Follow-up
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{lead.notes}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
