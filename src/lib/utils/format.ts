import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatTime(date: Date | string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatPhone(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  return value;
}

export function formatDocument(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  if (cleaned.length === 14) {
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  return value;
}

export function formatCEP(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length === 8) {
    return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2');
  }
  return value;
}

export function getStatusColor(status: string): string {
  const statusMap: Record<string, string> = {
    'Novo': 'bg-blue-100 text-blue-700',
    'Em contato': 'bg-yellow-100 text-yellow-700',
    'Qualificado': 'bg-green-100 text-green-700',
    'Não qualificado': 'bg-gray-100 text-gray-700',
    'Convertido': 'bg-purple-100 text-purple-700',
    'Perdido': 'bg-red-100 text-red-700',
    'Rascunho': 'bg-gray-100 text-gray-700',
    'Aguardando aprovação': 'bg-yellow-100 text-yellow-700',
    'Aprovada': 'bg-green-100 text-green-700',
    'Enviada': 'bg-blue-100 text-blue-700',
    'Em negociação': 'bg-orange-100 text-orange-700',
    'Ganha': 'bg-green-100 text-green-700',
    'Perdida': 'bg-red-100 text-red-700',
    'Cancelada': 'bg-red-100 text-red-700',
    'Expirada': 'bg-gray-100 text-gray-700',
    'Previsto': 'bg-blue-100 text-blue-700',
    'A vencer': 'bg-yellow-100 text-yellow-700',
    'Vencido': 'bg-red-100 text-red-700',
    'Recebido': 'bg-green-100 text-green-700',
    'Pago': 'bg-green-100 text-green-700',
    'Ativo': 'bg-green-100 text-green-700',
    'Inativo': 'bg-gray-100 text-gray-700',
    'Pendente': 'bg-yellow-100 text-yellow-700',
    'Concluído': 'bg-green-100 text-green-700',
  };

  return statusMap[status] || 'bg-gray-100 text-gray-700';
}
