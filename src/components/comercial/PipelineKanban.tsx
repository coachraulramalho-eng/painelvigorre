'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Move, MoreVertical } from 'lucide-react';

const stages = [
  { id: 'novo', name: 'Novo', color: 'bg-gray-100' },
  { id: 'contato', name: 'Em Contato', color: 'bg-blue-100' },
  { id: 'qualificado', name: 'Qualificado', color: 'bg-green-100' },
  { id: 'proposta', name: 'Proposta', color: 'bg-yellow-100' },
  { id: 'negociacao', name: 'Negociação', color: 'bg-orange-100' },
  { id: 'ganho', name: 'Ganho', color: 'bg-green-500' },
  { id: 'perdido', name: 'Perdido', color: 'bg-red-100' },
];

const mockLeads = [
  { id: 1, name: 'Empresa ABC', value: 'R$ 25.000', responsible: 'João', stage: 'novo' },
  { id: 2, name: 'Tech Solutions', value: 'R$ 15.000', responsible: 'Maria', stage: 'contato' },
  { id: 3, name: 'Grupo XYZ', value: 'R$ 40.000', responsible: 'Carlos', stage: 'qualificado' },
  { id: 4, name: 'Startup Inovação', value: 'R$ 12.000', responsible: 'Ana', stage: 'proposta' },
  { id: 5, name: 'Empresa Beta', value: 'R$ 35.000', responsible: 'João', stage: 'negociacao' },
  { id: 6, name: 'Consultoria Alpha', value: 'R$ 8.000', responsible: 'Maria', stage: 'ganho' },
  { id: 7, name: 'Fábrica Tech', value: 'R$ 22.000', responsible: 'Pedro', stage: 'perdido' },
];

export function PipelineKanban() {
  const [leads, setLeads] = useState(mockLeads);

  const getLeadsByStage = (stageId: string) => {
    return leads.filter(lead => lead.stage === stageId);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Pipeline Comercial</h2>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Lead
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <div key={stage.id} className="min-w-[200px]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">{stage.name}</h3>
              <Badge variant="outline">{getLeadsByStage(stage.id).length}</Badge>
            </div>
            <div className="space-y-2 min-h-[200px]">
              {getLeadsByStage(stage.id).map((lead) => (
                <Card key={lead.id} className="p-3 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{lead.name}</p>
                      <p className="text-xs text-muted-foreground">{lead.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">Responsável: {lead.responsible}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {stage.name}
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-5 w-5 ml-auto">
                      <Move className="h-3 w-3" />
                    </Button>
                  </div>
                </Card>
              ))}
              <Button variant="ghost" size="sm" className="w-full text-muted-foreground">
                <Plus className="h-3 w-3 mr-1" />
                Adicionar
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
