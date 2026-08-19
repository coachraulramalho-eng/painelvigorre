'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/shared/PageHeader';
import { ArrowLeft, Save, Loader2, CheckSquare } from 'lucide-react';
import Link from 'next/link';

const PRIORITIES = ['Alta', 'Média', 'Baixa'];
const STATUS = ['A fazer', 'Em andamento', 'Concluída', 'Cancelada'];

interface Tarefa {
  id: string;
  title: string;
  description: string;
  priority: string;
  dueDate: string;
  status: string;
  leadId: string;
  notes: string;
  lead?: { id: string; name: string };
}

export default function EditarTarefaPage() {
  const router = useRouter();
  const params = useParams();
  const tarefaId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tarefa, setTarefa] = useState<Tarefa | null>(null);
  const [leads, setLeads] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Média',
    dueDate: '',
    status: 'A fazer',
    leadId: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, [tarefaId]);

  const loadData = async () => {
    setLoadingData(true);
    try {
      const [tarefaRes, leadsRes] = await Promise.all([
        fetch(`/api/tarefas/${tarefaId}`),
        fetch('/api/comercial/leads'),
      ]);

      if (tarefaRes.ok) {
        const data = await tarefaRes.json();
        setTarefa(data);
        setFormData({
          title: data.title || '',
          description: data.description || '',
          priority: data.priority || 'Média',
          dueDate: data.dueDate ? new Date(data.dueDate).toISOString().split('T')[0] : '',
          status: data.status || 'A fazer',
          leadId: data.leadId || '',
          notes: data.notes || '',
        });
      }

      if (leadsRes.ok) {
        const data = await leadsRes.json();
        setLeads(data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/tarefas/${tarefaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao atualizar tarefa');
      }

      router.push('/comercial/tarefas');
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao atualizar tarefa');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!tarefa) {
    return (
      <div className="text-center py-12">
        <CheckSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Tarefa não encontrada</p>
        <Button asChild className="mt-4">
          <Link href="/comercial/tarefas">Voltar</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Editar Tarefa: ${tarefa.title}`}
        description="Atualize as informações da tarefa"
        actions={
          <Button variant="outline" asChild>
            <Link href="/comercial/tarefas">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Informações da Tarefa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="description">Descrição</Label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className="w-full p-3 border rounded-lg resize-none"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Prioridade</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => handleSelectChange('priority', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Prazo</Label>
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="leadId">Lead Relacionado</Label>
                <Select
                  value={formData.leadId}
                  onValueChange={(value) => handleSelectChange('leadId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um lead" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum</SelectItem>
                    {leads.map((lead: any) => (
                      <SelectItem key={lead.id} value={lead.id}>
                        {lead.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <textarea
                id="notes"
                name="notes"
                rows={2}
                className="w-full p-3 border rounded-lg resize-none"
                value={formData.notes}
                onChange={handleChange}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" type="button" asChild>
                <Link href="/comercial/tarefas">Cancelar</Link>
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
