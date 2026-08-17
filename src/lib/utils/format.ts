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
    'Prevista': 'bg-blue-100 text-blue-700',
    'Faturada': 'bg-green-100 text-green-700',
    'Vencida': 'bg-red-100 text-red-700',
    'Recebida': 'bg-green-100 text-green-700',
    'Paga': 'bg-green-100 text-green-700',
  };

  return statusMap[status] || 'bg-gray-100 text-gray-700';
}
