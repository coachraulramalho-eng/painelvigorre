'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/shared/PageHeader';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';

const STATUS = ['Ativo', 'Encerrado', 'Cancelado'];
const CALCULATION_BASE = ['Valor efetivamente recebido', 'Valor da proposta', 'Valor líquido'];

export default function NovoAcordoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [representatives, setRepresentatives] = useState([]);
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [repRes, compRes] = await Promise.all([
        fetch('/api/comercial/representantes'),
        fetch('/api/comercial/empresas'),
      ]);

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
    }
  };

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
      const response = await fetch('/api/comercial/acordos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao criar acordo');
      }

      router.push('/comercial/acordos');
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao criar acordo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Novo Acordo Comercial"
        description="Crie um novo acordo com representante"
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
          <CardTitle>Informações do Acordo</CardTitle>
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
                  placeholder="Ex: Recrutamento e Seleção"
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
                  placeholder="15"
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
                  placeholder="0,00"
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
                placeholder="Observações..."
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
                    Salvar Acordo
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
