'use client';

import { useState } from 'react';
import { MediaGallery } from '@/components/media/MediaGallery';
import { PageHeader } from '@/components/shared/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Image, 
  Video, 
  FileText, 
  FolderOpen,
  TrendingUp,
  HardDrive,
  Clock
} from 'lucide-react';

export default function MediaPage() {
  const [activeTab, setActiveTab] = useState('todos');

  const stats = [
    { label: 'Total de Arquivos', value: '247', icon: FolderOpen, color: 'text-blue-600' },
    { label: 'Imagens', value: '156', icon: Image, color: 'text-green-600' },
    { label: 'Vídeos', value: '34', icon: Video, color: 'text-purple-600' },
    { label: 'Documentos', value: '57', icon: FileText, color: 'text-orange-600' },
    { label: 'Espaço Utilizado', value: '2.4 GB', icon: HardDrive, color: 'text-primary' },
    { label: 'Uploads Recentes', value: '12', icon: Clock, color: 'text-yellow-600' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Biblioteca de Mídia"
        description="Gerencie imagens, vídeos e documentos da Vigorre"
        badge="Marketing"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4 text-center">
              <stat.icon className={`h-6 w-6 mx-auto ${stat.color}`} />
              <p className="text-lg font-bold mt-1">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gallery */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="imagens">Imagens</TabsTrigger>
          <TabsTrigger value="videos">Vídeos</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
          <TabsTrigger value="campanhas">Campanhas</TabsTrigger>
        </TabsList>

        <TabsContent value="todos">
          <MediaGallery category="todos" />
        </TabsContent>
        <TabsContent value="imagens">
          <MediaGallery category="imagens" />
        </TabsContent>
        <TabsContent value="videos">
          <MediaGallery category="videos" />
        </TabsContent>
        <TabsContent value="documentos">
          <MediaGallery category="documentos" />
        </TabsContent>
        <TabsContent value="campanhas">
          <MediaGallery category="campanhas" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
