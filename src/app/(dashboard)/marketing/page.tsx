'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Filter, 
  Download,
  Eye,
  Edit,
  Calendar,
  Users,
  TrendingUp,
  BarChart3,
  Hash,
  Image,
  Video,
  FileText,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function MarketingPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const campaigns = [
    { id: 1, name: 'Campanha LinkedIn', status: 'Ativa', leads: 45, conversao: '12%', data: '2026-08-01' },
    { id: 2, name: 'Campanha Instagram', status: 'Pausada', leads: 28, conversao: '8%', data: '2026-08-05' },
    { id: 3, name: 'E-mail Marketing', status: 'Programada', leads: 120, conversao: '15%', data: '2026-08-20' },
    { id: 4, name: 'Campanha WhatsApp', status: 'Ativa', leads: 67, conversao: '22%', data: '2026-08-10' },
  ];

  const metrics = [
    { label: 'Leads Gerados', value: 260, icon: Users, color: 'text-blue-600' },
    { label: 'Taxa Conversão', value: '14.2%', icon: TrendingUp, color: 'text-green-600' },
    { label: 'Campanhas Ativas', value: 3, icon: Hash, color: 'text-purple-600' },
    { label: 'ROI Médio', value: '3.2x', icon: BarChart3, color: 'text-primary' },
  ];

  const materials = [
    { id: 1, title: 'Apresentação Institucional', type: 'PDF', category: 'Materiais', date: '2026-08-15' },
    { id: 2, title: 'Banner LinkedIn', type: 'Imagem', category: 'Artes', date: '2026-08-12' },
    { id: 3, title: 'Vídeo Institucional', type: 'Vídeo', category: 'Vídeos', date: '2026-08-10' },
    { id: 4, title: 'E-book Marketing', type: 'PDF', category: 'Conteúdos', date: '2026-08-08' },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      'Ativa': 'success',
      'Pausada': 'warning',
      'Programada': 'default',
      'Encerrada': 'secondary',
    };
    return variants[status] || 'default';
  };

  const getMaterialIcon = (type: string) => {
    const icons: Record<string, any> = {
      'PDF': FileText,
      'Imagem': Image,
      'Vídeo': Video,
      'Documento': FileText,
    };
    return icons[type] || FileText;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Marketing</h1>
          <p className="text-muted-foreground">Gerencie campanhas, conteúdos e materiais da Vigorre</p>
        </div>
        <div className="flex gap-2">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Campanha
          </Button>
          <Button variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Material
          </Button>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <p className="text-2xl font-bold mt-1">{metric.value}</p>
                </div>
                <metric.icon className={`h-8 w-8 ${metric.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Campanhas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Campanhas</CardTitle>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-3 w-3" />
              Filtrar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar campanhas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {campaigns.map((campaign) => (
                <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{campaign.name}</h4>
                        <Badge variant={getStatusBadge(campaign.status)} className="mt-1">
                          {campaign.status}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Leads</p>
                        <p className="font-medium">{campaign.leads}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Conversão</p>
                        <p className="font-medium">{campaign.conversao}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Início: {new Date(campaign.data).toLocaleDateString('pt-BR')}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Materiais */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Biblioteca de Materiais</CardTitle>
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="h-3 w-3" />
              Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {materials.map((material) => {
              const Icon = getMaterialIcon(material.type);
              return (
                <Card key={material.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{material.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{material.type}</Badge>
                          <span className="text-xs text-muted-foreground">{material.category}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(material.date).toLocaleDateString('pt-BR')}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Calendário */}
      <Card>
        <CardHeader>
          <CardTitle>Calendário de Conteúdos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                {day}
              </div>
            ))}
            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
              <div
                key={day}
                className={`text-center p-2 rounded-lg text-sm ${
                  day === 17 ? 'bg-primary text-white' : 'hover:bg-secondary'
                } ${[5, 12, 19, 26].includes(day) ? 'border-2 border-primary/20' : ''}`}
              >
                {day}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
