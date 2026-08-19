'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { PageHeader } from '@/components/shared/PageHeader';
import { ArrowLeft, Save, Loader2, Shield, Plus, Trash2 } from 'lucide-react';
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

export default function NovoPerfilPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isMaster: false,
    permissions: [] as string[],
  });

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

  const toggleAllModulePermissions = (moduleId: string, actions: string[]) => {
    const modulePermissions = actions.map(action => `${moduleId}:${action}`);
    const allSelected = modulePermissions.every(p => formData.permissions.includes(p));

    setFormData(prev => ({
      ...prev,
      permissions: allSelected
        ? prev.permissions.filter(p => !modulePermissions.includes(p))
        : [...prev.permissions, ...modulePermissions.filter(p => !prev.permissions.includes(p))],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao criar perfil');
      }

      router.push('/seguranca/perfis');
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao criar perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Novo Perfil"
        description="Crie um novo perfil de acesso"
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
                  placeholder="Ex: Gestor Comercial"
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
                  placeholder="Descreva as permissões deste perfil..."
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2 col-span-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="isMaster"
                    checked={formData.isMaster}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, isMaster: checked as boolean })
                    }
                  />
                  <Label htmlFor="isMaster" className="text-sm font-normal">
                    Perfil Master (acesso total ao sistema)
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Permissões por Módulo</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const allPermissions = MODULES.flatMap(m => 
                      m.actions.map(a => `${m.id}:${a}`)
                    );
                    const allSelected = allPermissions.every(p => formData.permissions.includes(p));
                    setFormData(prev => ({
                      ...prev,
                      permissions: allSelected ? [] : allPermissions,
                    }));
                  }}
                >
                  {MODULES.flatMap(m => m.actions).every(a => 
                    formData.permissions.includes(`${MODULES[0]?.id}:${a}`)
                  ) ? 'Desmarcar Todos' : 'Selecionar Todos'}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {MODULES.map((module) => {
                  const modulePermissions = module.actions.map(action => `${module.id}:${action}`);
                  const allSelected = modulePermissions.every(p => formData.permissions.includes(p));
                  const someSelected = modulePermissions.some(p => formData.permissions.includes(p));

                  return (
                    <Card key={module.id} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{module.label}</h4>
                        <Checkbox
                          checked={allSelected}
                          onCheckedChange={() => toggleAllModulePermissions(module.id, module.actions)}
                          className={someSelected && !allSelected ? 'opacity-50' : ''}
                        />
                      </div>
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
                              className="text-sm capitalize cursor-pointer"
                            >
                              {action}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </Card>
                  );
                })}
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
                    Criando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Criar Perfil
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
