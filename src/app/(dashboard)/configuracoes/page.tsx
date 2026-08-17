'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Save, 
  Globe, 
  Mail, 
  Shield, 
  Bell, 
  Database,
  Users,
  DollarSign,
  Palette,
  Key,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Copy
} from 'lucide-react';

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState('geral');
  const [showApiKey, setShowApiKey] = useState(false);

  const configSections = [
    {
      id: 'geral',
      label: 'Geral',
      icon: Settings,
      fields: [
        { label: 'Nome da Empresa', value: 'Vigorre - Inteligência, Tecnologia e Gestão Estratégica' },
        { label: 'Site', value: 'www.vigorre.com' },
        { label: 'E-mail de Contato', value: 'contato@vigorre.com' },
        { label: 'Telefone', value: '(11) 99999-9999' },
      ]
    },
    {
      id: 'financeiro',
      label: 'Financeiro',
      icon: DollarSign,
      fields: [
        { label: 'Moeda Padrão', value: 'BRL - R$' },
        { label: 'Dias para Vencimento', value: '30' },
        { label: 'Taxa de Juros (mês)', value: '2%' },
        { label: 'Multa por Atraso', value: '2%' },
      ]
    },
    {
      id: 'notificacoes',
      label: 'Notificações',
      icon: Bell,
      fields: [
        { label: 'E-mail de Alertas', value: 'alertas@vigorre.com' },
        { label: 'Notificar Vencimentos', value: '5 dias antes' },
        { label: 'Notificar Follow-ups', value: '1 dia antes' },
        { label: 'Alerta de Segurança', value: 'Ativado' },
      ]
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Configurações</h1>
          <p className="text-muted-foreground">Gerencie as configurações gerais do sistema</p>
        </div>
        <Button className="gap-2">
          <Save className="h-4 w-4" />
          Salvar Alterações
        </Button>
      </div>

      <Tabs defaultValue="geral" className="space-y-4">
        <TabsList className="bg-secondary p-1 flex flex-wrap">
          {configSections.map((section) => (
            <TabsTrigger key={section.id} value={section.id} className="gap-2">
              <section.icon className="h-4 w-4" />
              {section.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {configSections.map((section) => (
          <TabsContent key={section.id} value={section.id}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <section.icon className="h-5 w-5" />
                  {section.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {section.fields.map((field, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                    <label className="text-sm font-medium text-muted-foreground pt-2">
                      {field.label}
                    </label>
                    <div className="md:col-span-2">
                      <Input value={field.value} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Integrações */}
      <Card>
        <CardHeader>
          <CardTitle>Integrações</CardTitle>
          <p className="text-sm text-muted-foreground">Configure as integrações com serviços externos</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'Gateway de Pagamento', status: 'Configurar', icon: '💳' },
              { name: 'WhatsApp', status: 'Configurar', icon: '💬' },
              { name: 'E-mail', status: 'Configurar', icon: '📧' },
              { name: 'Supabase', status: 'Configurar', icon: '🗄️' },
            ].map((integration) => (
              <div key={integration.name} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{integration.icon}</span>
                  <p className="font-medium">{integration.name}</p>
                </div>
                <Badge variant="warning">{integration.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Segurança */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <div>
                <p className="font-medium">Autenticação em Dois Fatores</p>
                <p className="text-sm text-muted-foreground">Proteja sua conta com verificação adicional</p>
              </div>
              <Badge variant="warning">Desativado</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <div>
                <p className="font-medium">Sessão Ativa</p>
                <p className="text-sm text-muted-foreground">Tempo de expiração: 8 horas</p>
              </div>
              <Button variant="outline" size="sm">Encerrar Todas</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Backup e Restauração
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <div>
                <p className="font-medium">Último Backup</p>
                <p className="text-sm text-muted-foreground">17/08/2026 14:30</p>
              </div>
              <Badge variant="success">Completo</Badge>
            </div>
            <div className="flex gap-2">
              <Button className="gap-2 flex-1">
                <RefreshCw className="h-4 w-4" />
                Backup Agora
              </Button>
              <Button variant="outline" className="gap-2 flex-1">
                <Database className="h-4 w-4" />
                Restaurar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
