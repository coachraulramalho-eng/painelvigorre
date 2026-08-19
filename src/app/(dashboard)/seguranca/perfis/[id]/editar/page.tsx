'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { PageHeader } from '@/components/shared/PageHeader';
import { ArrowLeft, Save, Loader2, Shield } from 'lucide-react';
import Link from 'next/link';

const MODULES = [
  { id: 'dashboard', label: 'Dashboard', actions: ['view'] },
  { id: 'commercial', label: 'Comercial', actions: ['view', 'create', 'edit', 'delete', 'approve', 'export'] },
  { id: 'financial', label: 'Financeiro', actions: ['view', 'create', 'edit', 'delete', 'approve', 'export'] },
  { id: 'marketing', label: 'Marketing', actions: ['view', 'create', 'edit', 'delete', 'export'] },
  { id: 'admin', label: 'Administrativo', actions: ['view', 'create', 'edit', 'delete'] },
  { id: 'security', label: 'Segurança', actions: ['view', 'create', 'edit', 'delete'] },
  { id: 'settings', label: 'Configurações', actions: ['view', 'edit'] },
  { id: 'media', label: 'Mídia', actions: ['view', 'upload', 'delete'] },
  { id: 'signature', label: 'Assinatura', actions: ['view', 'create', 'sign'] },
];

interface Role {
  id: string;
  name: string;
  description: string;
  isMaster: boolean;
  permissions: { module: string; action: string }[];
}

export default function EditarPerfilPage() {
  const router = useRouter();
  const params = useParams();
  const roleId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [loadingRole, setLoadingRole] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  });

  useEffect(() => {
    loadRole();
  }, [roleId]);

  const loadRole = async () => {
    setLoadingRole(true);
    try {
      const response = await fetch(`/api/admin/roles/${roleId}`);
      if (response.ok) {
        const data = await response.json();
        setRole(data);
        setFormData({
          name: data.name,
          description: data.description || '',
          permissions: data.permissions?.map((p: any) => `${p.module}:${p.action}`) || [],
        });
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setLoadingRole(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePermission = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/roles/${roleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          permissions: formData.permissions,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao atualizar perfil');
      }

      router.push('/seguranca/perfis');
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  if (loadingRole) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!role) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Perfil não encontrado</p>
        <Button asChild className="mt-4">
          <Link href="/seguranca/perfis">Voltar</Link>
        </Button>
      </div>
    );
  }

  if (role.isMaster) {
    return (
      <div className="text-center py-12">
        <Shield className="h-16 w-16 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Perfil Master</h2>
        <p className="text-muted-foreground">
          O perfil Master não pode ser editado.
        </p>
        <Button asChild className="mt-4">
          <Link href="/seguranca/perfis">Voltar</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Editar Perfil: ${role.name}`}
        description="Atualize as informações do perfil"
        actions={
          <Button variant="outline" asChild>
            <Link href="/seguranca/perfis">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Informações do Perfil
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
                <Label htmlFor="name">Nome do Perfil *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
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
            </div>

            <div className="space-y-4">
              <Label>Permissões por Módulo</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {MODULES.map((module) => (
                  <Card key={module.id} className="p-4">
                    <h4 className="font-medium mb-2">{module.label}</h4>
                    <div className="space-y-2">
                      {module.actions.map((action) => (
                        <div key={`${module.id}-${action}`} className="flex items-center gap-2">
                          <Checkbox
                            id={`${module.id}-${action}`}
                            checked={formData.permissions.includes(`${module.id}:${action}`)}
                            onCheckedChange={() => togglePermission(`${module.id}:${action}`)}
                          />
                          <Label 
                            htmlFor={`${module.id}-${action}`}
                            className="text-sm capitalize"
                          >
                            {action}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" type="button" asChild>
                <Link href="/seguranca/perfis">Cancelar</Link>
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
