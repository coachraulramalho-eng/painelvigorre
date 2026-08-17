'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UserPlus, 
  Building2, 
  FileText, 
  Briefcase,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Plus,
  Search,
  Filter
} from 'lucide-react';

export default function AdministrativoPage() {
  const employees = [
    { id: 1, name: 'João Silva', position: 'Gestor Comercial', department: 'Comercial', status: 'Ativo', entry: '2026-01-15' },
    { id: 2, name: 'Maria Santos', position: 'Analista Financeiro', department: 'Financeiro', status: 'Ativo', entry: '2026-02-01' },
    { id: 3, name: 'Carlos Lima', position: 'Representante', department: 'Comercial', status: 'Ativo', entry: '2026-03-10' },
    { id: 4, name: 'Ana Paula', position: 'Analista de Marketing', department: 'Marketing', status: 'Ativo', entry: '2026-04-05' },
  ];

  const representatives = [
    { id: 1, name: 'Pedro Oliveira', region: 'São Paulo', services: 'Recrutamento', status: 'Ativo', contracts: 5 },
    { id: 2, name: 'Lucia Mendes', region: 'Rio de Janeiro', services: 'Consultoria', status: 'Ativo', contracts: 3 },
  ];

  const suppliers = [
    { id: 1, name: 'Fornecedor TI Ltda', service: 'Tecnologia', status: 'Ativo' },
    { id: 2, name: 'Serviços Marketing', service: 'Marketing', status: 'Ativo' },
    { id: 3, name: 'Escritório Contábil', service: 'Administrativo', status: 'Ativo' },
  ];

  const metrics = [
    { label: 'Funcionários', value: employees.length, icon: Users, color: 'text-blue-600' },
    { label: 'Representantes', value: representatives.length, icon: Briefcase, color: 'text-purple-600' },
    { label: 'Fornecedores', value: suppliers.length, icon: Building2, color: 'text-green-600' },
    { label: 'Documentos', value: 12, icon: FileText, color: 'text-orange-600' },
  ];

  const getStatusBadge = (status: string) => {
    return status === 'Ativo' ? 'success' : 'secondary';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Administrativo</h1>
          <p className="text-muted-foreground">Gerencie funcionários, representantes e fornecedores</p>
        </div>
        <div className="flex gap-2">
          <Button className="gap-2">
            <UserPlus className="h-4 w-4" />
            Novo Funcionário
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

      {/* Funcionários */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Funcionários</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Search className="h-3 w-3" />
                Buscar
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-3 w-3" />
                Filtrar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary">
                <tr>
                  <th className="text-left text-sm font-medium text-muted-foreground p-3">Nome</th>
                  <th className="text-left text-sm font-medium text-muted-foreground p-3">Cargo</th>
                  <th className="text-left text-sm font-medium text-muted-foreground p-3">Departamento</th>
                  <th className="text-left text-sm font-medium text-muted-foreground p-3">Status</th>
                  <th className="text-left text-sm font-medium text-muted-foreground p-3">Entrada</th>
                  <th className="text-right text-sm font-medium text-muted-foreground p-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.id} className="border-t hover:bg-secondary/50 transition-colors">
                    <td className="p-3">
                      <p className="font-medium">{employee.name}</p>
                    </td>
                    <td className="p-3 text-sm">{employee.position}</td>
                    <td className="p-3 text-sm">{employee.department}</td>
                    <td className="p-3">
                      <Badge variant={getStatusBadge(employee.status)}>
                        {employee.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-sm">
                      {new Date(employee.entry).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Representantes e Fornecedores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Representantes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Representantes</CardTitle>
              <Button variant="outline" size="sm" className="gap-2">
                <Plus className="h-3 w-3" />
                Adicionar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {representatives.map((rep) => (
              <div key={rep.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <div>
                  <p className="font-medium">{rep.name}</p>
                  <p className="text-sm text-muted-foreground">{rep.region} • {rep.services}</p>
                </div>
                <div className="text-right">
                  <Badge variant={getStatusBadge(rep.status)}>{rep.status}</Badge>
                  <p className="text-xs text-muted-foreground mt-1">{rep.contracts} contratos</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Fornecedores */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Fornecedores</CardTitle>
              <Button variant="outline" size="sm" className="gap-2">
                <Plus className="h-3 w-3" />
                Adicionar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {suppliers.map((supplier) => (
              <div key={supplier.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <div>
                  <p className="font-medium">{supplier.name}</p>
                  <p className="text-sm text-muted-foreground">{supplier.service}</p>
                </div>
                <Badge variant={getStatusBadge(supplier.status)}>{supplier.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Documentos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Documentos Recentes</CardTitle>
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="h-3 w-3" />
              Upload
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: 'Contrato - Empresa ABC', category: 'Contratos', date: '2026-08-15', status: 'Ativo' },
              { title: 'Proposta #001/2026', category: 'Propostas', date: '2026-08-12', status: 'Assinado' },
              { title: 'Documento Representante', category: 'Representantes', date: '2026-08-10', status: 'Pendente' },
            ].map((doc, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{doc.title}</p>
                      <p className="text-xs text-muted-foreground">{doc.category}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={doc.status === 'Ativo' || doc.status === 'Assinado' ? 'success' : 'warning'}>
                          {doc.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(doc.date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
