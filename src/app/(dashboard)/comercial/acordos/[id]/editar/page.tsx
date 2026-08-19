'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/shared/PageHeader';
import { ArrowLeft, Save, Loader2, Handshake } from 'lucide-react';
import Link from 'next/link';

const STATUS = ['Ativo', 'Encerrado', 'Cancelado'];
const CALCULATION_BASE = ['Valor efetivamente recebido', 'Valor da proposta', 'Valor líquido'];

interface Acordo {
  id: string;
  representativeId: string;
  companyId: string;
  service: string;
  percentage: number;
  fixedValue: number;
  calculationBase: string;
  validityStart: string;
  validityEnd: string;
  status: string;
  notes: string;
  representative?: { id: string; user?: { name: string } };
  company?: { id: string; name: string };
}

export default function EditarAcordoPage() {
  const router = useRouter();
  const params = useParams();
  const acordoId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acordo, setAcordo] = useState<Acordo | null>(null);
  const [representatives, setRepresentatives] = useState([]);
  const [companies, setCompanies] = useState([]);

  const [formData, setFormData] = useState({
    representativeId: '',
    companyId: '',
    service: '',
    percentage: '',
    fixedValue: '',
    calculationBase: 'Valor efetivamente recebido',
    validityStart: '',
    validityEnd: '',
    status: 'Ativo',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, [acordoId]);

  const loadData = async () => {
    setLoadingData(true);
    try {
      const [acordoRes, repRes, compRes] = await Promise.all([
        fetch(`/api/comercial/acordos/${acordoId}`),
        fetch('/api/comercial/representantes'),
        fetch('/api/comercial/empresas'),
      ]);

      if (acordoRes.ok) {
        const data = await acordoRes.json();
        setAcordo(data);
        setFormData({
          representativeId: data.representativeId || '',
          companyId: data.companyId || '',
          service: data.service || '',
          percentage: data.percentage ? String(data.percentage) : '',
          fixedValue: data.fixedValue ? String(data.fixedValue) : '',
          calculationBase: data.calculationBase || 'Valor efetivamente recebido',
          validityStart: data.validityStart ? new Date(data.validityStart).toISOString().split('T')[0] : '',
          validityEnd: data.validityEnd ? new Date(data.validityEnd).toISOString().split('T')[0] : '',
          status: data.status || 'Ativo',
          notes: data.notes || '',
        });
      }

      if (repRes.ok) {
        const data = await repRes.json();
        setRepresentatives(data.representatives || []);
      }

      if (compRes.ok) {
        const data = await compRes.json();
        setCompanies(data);
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
      const response = await fetch(`/api/comercial/acordos/${acordoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao atualizar acordo');
      }

      router.push('/comercial/acordos');
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao atualizar acordo');
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

  if (!acordo) {
    return (
      <div className="text-center py-12">
        <Handshake className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Acordo não encontrado</p>
        <Button asChild className="mt-4">
          <Link href="/comercial/acordos">Voltar</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Editar Acordo: ${acordo.service}`}
        description="Atualize as informações do acordo"
        actions={
          <Button variant="outline" asChild>
            <Link href="/comercial/acordos">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Handshake className="h-5 w-5" />
            Informações do Acordo
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
              <div className="space-y-2">
                <Label htmlFor="representativeId">Representante *</Label>
                <Select
                  value={formData.representativeId}
                  onValueChange={(value) => handleSelectChange('representativeId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um representante" />
                  </SelectTrigger>
                  <SelectContent>
                    {representatives.map((rep: any) => (
                      <SelectItem key={rep.id} value={rep.id}>
                        {rep.user?.name || rep.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyId">Cliente</Label>
                <Select
                  value={formData.companyId}
                  onValueChange={(value) => handleSelectChange('companyId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum</SelectItem>
                    {companies.map((company: any) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="service">Serviço *</Label>
                <Input
                  id="service"
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="percentage">Comissão (%)</Label>
                <Input
                  id="percentage"
                  name="percentage"
                  type="number"
                  step="0.01"
                  value={formData.percentage}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fixedValue">Valor Fixo (R$)</Label>
                <Input
                  id="fixedValue"
                  name="fixedValue"
                  type="number"
                  step="0.01"
                  value={formData.fixedValue}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="calculationBase">Base de Cálculo</Label>
                <Select
                  value={formData.calculationBase}
                  onValueChange={(value) => handleSelectChange('calculationBase', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a base" />
                  </SelectTrigger>
                  <SelectContent>
                    {CALCULATION_BASE.map((base) => (
                      <SelectItem key={base} value={base}>
                        {base}
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
                <Label htmlFor="validityStart">Início da Vigência</Label>
                <Input
                  id="validityStart"
                  name="validityStart"
                  type="date"
                  value={formData.validityStart}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="validityEnd">Fim da Vigência</Label>
                <Input
                  id="validityEnd"
                  name="validityEnd"
                  type="date"
                  value={formData.validityEnd}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                className="w-full p-3 border rounded-lg resize-none"
                value={formData.notes}
                onChange={handleChange}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" type="button" asChild>
                <Link href="/comercial/acordos">Cancelar</Link>
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
