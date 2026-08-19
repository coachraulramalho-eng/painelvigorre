'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/shared/PageHeader';
import { ArrowLeft, Save, Loader2, UserCog } from 'lucide-react';
import Link from 'next/link';

const TYPES = ['Autônomo/Pessoa Física', 'Pessoa Jurídica'];
const STATUS = ['Ativo', 'Inativo', 'Em análise'];

interface Representante {
  id: string;
  userId: string;
  type: string;
  document: string;
  phone: string;
  email: string;
  address: string;
  region: string;
  services: string;
  bankData: string;
  pix: string;
  status: string;
  user?: { id: string; name: string; email: string };
}

export default function EditarRepresentantePage() {
  const router = useRouter();
  const params = useParams();
  const repId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [representante, setRepresentante] = useState<Representante | null>(null);

  const [formData, setFormData] = useState({
    type: 'Autônomo/Pessoa Física',
    document: '',
    phone: '',
    email: '',
    address: '',
    region: '',
    services: '',
    bankData: '',
    pix: '',
    status: 'Ativo',
  });

  useEffect(() => {
    loadRepresentante();
  }, [repId]);

  const loadRepresentante = async () => {
    setLoadingData(true);
    try {
      const response = await fetch(`/api/comercial/representantes/${repId}`);
      if (response.ok) {
        const data = await response.json();
        setRepresentante(data.representative);
        setFormData({
          type: data.representative.type || 'Autônomo/Pessoa Física',
          document: data.representative.document || '',
          phone: data.representative.phone || '',
          email: data.representative.email || '',
          address: data.representative.address || '',
          region: data.representative.region || '',
          services: data.representative.services || '',
          bankData: data.representative.bankData || '',
          pix: data.representative.pix || '',
          status: data.representative.status || 'Ativo',
        });
      }
    } catch (error) {
      console.error('Erro ao carregar representante:', error);
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
      const response = await fetch(`/api/comercial/representantes/${repId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao atualizar representante');
      }

      router.push('/comercial/representantes');
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao atualizar representante');
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

  if (!representante) {
    return (
      <div className="text-center py-12">
        <UserCog className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Representante não encontrado</p>
        <Button asChild className="mt-4">
          <Link href="/comercial/representantes">Voltar</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Editar Representante: ${representante.user?.name || '...'}`}
        description="Atualize as informações do representante"
        actions={
          <Button variant="outline" asChild>
            <Link href="/comercial/representantes">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Informações do Representante
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
                <Label htmlFor="type">Tipo</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleSelectChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="document">CPF/CNPJ *</Label>
                <Input
                  id="document"
                  name="document"
                  value={formData.document}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="region">Região</Label>
                <Input
                  id="region"
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="services">Serviços</Label>
                <Input
                  id="services"
                  name="services"
                  value={formData.services}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
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
                <Label htmlFor="bankData">Dados Bancários</Label>
                <Input
                  id="bankData"
                  name="bankData"
                  value={formData.bankData}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pix">PIX</Label>
                <Input
                  id="pix"
                  name="pix"
                  value={formData.pix}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" type="button" asChild>
                <Link href="/comercial/representantes">Cancelar</Link>
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
