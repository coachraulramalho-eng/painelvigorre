'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/shared/PageHeader';
import { ArrowLeft, Save, Loader2, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

const PROPOSAL_STATUS = [
  'Rascunho', 'Em análise', 'Aguardando aprovação', 'Aprovada',
  'Enviada', 'Visualizada', 'Em negociação', 'Aguardando decisão',
  'Ganha', 'Perdida', 'Cancelada', 'Expirada'
];

const PAYMENT_CONDITIONS = ['À vista', 'Sem entrada', 'Entrada + parcelas'];

interface Company {
  id: string;
  name: string;
  document: string;
}

export default function NovaPropostaPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    companyId: '',
    title: '',
    description: '',
    service: '',
    quantity: 1,
    unitPrice: 0,
    totalValue: 0,
    discount: 0,
    finalValue: 0,
    validity: '',
    paymentCondition: '',
    notes: '',
    status: 'Rascunho',
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const response = await fetch('/api/comercial/companies');
      if (response.ok) {
        const data = await response.json();
        setCompanies(data.companies || []);
      }
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Recalcular valores
    if (name === 'quantity' || name === 'unitPrice' || name === 'discount') {
      calculateValues();
    }
  };

  const calculateValues = () => {
    const quantity = Number(formData.quantity) || 1;
    const unitPrice = Number(formData.unitPrice) || 0;
    const discount = Number(formData.discount) || 0;
    
    const totalValue = quantity * unitPrice;
    const finalValue = totalValue - (totalValue * (discount / 100));
    
    setFormData(prev => ({
      ...prev,
      totalValue,
      finalValue,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/comercial/propostas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao criar proposta');
      }

      router.push('/comercial/propostas');
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao criar proposta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nova Proposta"
        description="Crie uma nova proposta comercial"
        actions={
          <Button variant="outline" asChild>
            <Link href="/comercial/propostas">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Informações da Proposta</CardTitle>
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
                <Label htmlFor="companyId">Cliente *</Label>
                <Select
                  value={formData.companyId}
                  onValueChange={(value) => handleSelectChange('companyId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name} - {company.document}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Título da proposta"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="service">Serviço *</Label>
                <Input
                  id="service"
                  name="service"
                  placeholder="Serviço oferecido"
                  value={formData.service}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentCondition">Condição de Pagamento</Label>
                <Select
                  value={formData.paymentCondition}
                  onValueChange={(value) => handleSelectChange('paymentCondition', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_CONDITIONS.map((cond) => (
                      <SelectItem key={cond} value={cond}>
                        {cond}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="w-full p-3 border rounded-lg resize-none"
                placeholder="Descrição detalhada do serviço..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantidade</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unitPrice">Valor Unitário (R$)</Label>
                <Input
                  id="unitPrice"
                  name="unitPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.unitPrice}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount">Desconto (%)</Label>
                <Input
                  id="discount"
                  name="discount"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.discount}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="validity">Validade</Label>
                <Input
                  id="validity"
                  name="validity"
                  type="date"
                  value={formData.validity}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="bg-secondary p-4 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Valor Total</p>
                  <p className="text-lg font-bold">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(formData.totalValue)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Desconto</p>
                  <p className="text-lg font-bold text-green-600">
                    {formData.discount}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valor Final</p>
                  <p className="text-lg font-bold text-primary">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(formData.finalValue)}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    {PROPOSAL_STATUS.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Input
                  id="notes"
                  name="notes"
                  placeholder="Observações..."
                  value={formData.notes}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" type="button" asChild>
                <Link href="/comercial/propostas">Cancelar</Link>
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
                    Salvar Proposta
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
