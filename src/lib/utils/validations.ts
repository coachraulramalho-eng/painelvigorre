import { z } from 'zod';

// ========== SCHEMAS ==========
export const leadSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  email: z.string().email('E-mail inválido').optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  company: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  segment: z.string().optional(),
  origin: z.string().min(1, 'Origem é obrigatória'),
  notes: z.string().optional(),
});

export const proposalSchema = z.object({
  client: z.string().min(1, 'Cliente é obrigatório'),
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  service: z.string().min(1, 'Serviço é obrigatório'),
  value: z.number().min(0, 'Valor deve ser maior que zero'),
  discount: z.number().min(0).optional(),
  validity: z.string().optional(),
  paymentCondition: z.string().optional(),
  notes: z.string().optional(),
});

export const userSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  role: z.string().optional(),
  active: z.boolean().default(true),
});

export const companySchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  document: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('E-mail inválido').optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  segment: z.string().optional(),
  website: z.string().url('URL inválida').optional(),
  notes: z.string().optional(),
});

// ========== VALIDAÇÕES ==========
export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  return /^\(\d{2}\) \d{4,5}-\d{4}$/.test(phone) || /^\d{10,11}$/.test(phone);
};

export const isValidDocument = (doc: string): boolean => {
  // CPF ou CNPJ
  return /^\d{11}$/.test(doc) || /^\d{14}$/.test(doc);
};

export const isValidURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// ========== FORMATAÇÃO ==========
export const formatPhone = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  return value;
};

export const formatDocument = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  if (cleaned.length === 14) {
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  return value;
};
