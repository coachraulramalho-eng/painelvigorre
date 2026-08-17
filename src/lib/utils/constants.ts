// ========== STATUS ==========
export const LEAD_STATUS = {
  NOVO: 'Novo',
  EM_CONTATO: 'Em contato',
  QUALIFICADO: 'Qualificado',
  NAO_QUALIFICADO: 'Não qualificado',
  CONVERTIDO: 'Convertido',
  PERDIDO: 'Perdido',
} as const;

export const PROPOSAL_STATUS = {
  RASCUNHO: 'Rascunho',
  EM_ANALISE: 'Em análise',
  AGUARDANDO_APROVACAO: 'Aguardando aprovação',
  APROVADA: 'Aprovada',
  ENVIADA: 'Enviada',
  VISUALIZADA: 'Visualizada',
  EM_NEGOCIACAO: 'Em negociação',
  AGUARDANDO_DECISAO: 'Aguardando decisão',
  GANHA: 'Ganha',
  PERDIDA: 'Perdida',
  CANCELADA: 'Cancelada',
  EXPIRADA: 'Expirada',
} as const;

export const FINANCIAL_STATUS = {
  PREVISTO: 'Previsto',
  A_VENCER: 'A vencer',
  VENCIDO: 'Vencido',
  RECEBIDO: 'Recebido',
  PAGO: 'Pago',
  FATURADO: 'Faturado',
  CANCELADO: 'Cancelado',
} as const;

export const TASK_STATUS = {
  A_FAZER: 'A fazer',
  EM_ANDAMENTO: 'Em andamento',
  CONCLUIDA: 'Concluída',
  CANCELADA: 'Cancelada',
  ATRASADA: 'Atrasada',
} as const;

export const TASK_PRIORITY = {
  ALTA: 'Alta',
  MEDIA: 'Média',
  BAIXA: 'Baixa',
} as const;

// ========== ORIGENS ==========
export const LEAD_ORIGINS = [
  'Instagram',
  'Facebook',
  'LinkedIn',
  'WhatsApp',
  'Site',
  'Indicação',
  'Representante',
  'Campanha',
  'Outro',
] as const;

// ========== MÓDULOS ==========
export const MODULES = {
  DASHBOARD: 'dashboard',
  COMMERCIAL: 'commercial',
  FINANCIAL: 'financial',
  MARKETING: 'marketing',
  ADMIN: 'admin',
  SECURITY: 'security',
  SETTINGS: 'settings',
} as const;

export const ACTIONS = {
  VIEW: 'view',
  CREATE: 'create',
  EDIT: 'edit',
  DELETE: 'delete',
  APPROVE: 'approve',
  EXPORT: 'export',
} as const;

// ========== PERFIS ==========
export const ROLES = {
  ADM_MASTER: 'ADM Master',
  GESTOR_COMERCIAL: 'Gestor Comercial',
  COMERCIAL: 'Comercial',
  REPRESENTANTE: 'Representante',
  FINANCEIRO: 'Financeiro',
  MARKETING: 'Marketing',
  ADMINISTRATIVO: 'Administrativo',
  FUNCIONARIO: 'Funcionário',
} as const;

// ========== PLATAFORMAS ==========
export const PLATFORMS = {
  HIRE: 'Vigorre Hire™',
  DIAGNOSTICS: 'Vigorre Diagnostics™',
  TECH: 'Vigorre TECH™',
  ACADEMY: 'Vigorre Academy™',
  CONSULTORIA: 'Consultoria',
  OUTROS: 'Outros produtos/serviços',
} as const;

export const PLATFORM_STATUS = {
  EM_DESENVOLVIMENTO: 'Em desenvolvimento',
  ATIVA: 'Ativa',
  PAUSADA: 'Pausada',
  ENCERRADA: 'Encerrada',
} as const;

// ========== CENTROS DE CUSTO ==========
export const COST_CENTERS = [
  'Comercial',
  'Marketing',
  'Financeiro',
  'Administrativo',
  'Tecnologia',
  'RH',
  'Operações',
  'Projetos',
  'Diretoria',
  'Outros',
] as const;

// ========== CATEGORIAS DE DOCUMENTOS ==========
export const DOCUMENT_CATEGORIES = [
  'Contratos',
  'Propostas',
  'Documentos empresariais',
  'Funcionários',
  'Representantes',
  'Fornecedores',
  'Materiais comerciais',
  'Outros',
] as const;

// ========== MENSAGENS ==========
export const MESSAGES = {
  // Sucesso
  SUCCESS_CREATE: 'Registro criado com sucesso!',
  SUCCESS_UPDATE: 'Registro atualizado com sucesso!',
  SUCCESS_DELETE: 'Registro excluído com sucesso!',
  SUCCESS_APPROVE: 'Registro aprovado com sucesso!',
  SUCCESS_SEND: 'Registro enviado com sucesso!',
  
  // Erro
  ERROR_CREATE: 'Erro ao criar registro',
  ERROR_UPDATE: 'Erro ao atualizar registro',
  ERROR_DELETE: 'Erro ao excluir registro',
  ERROR_APPROVE: 'Erro ao aprovar registro',
  ERROR_SEND: 'Erro ao enviar registro',
  ERROR_NOT_FOUND: 'Registro não encontrado',
  ERROR_UNAUTHORIZED: 'Sem permissão para esta ação',
  ERROR_VALIDATION: 'Erro de validação',
  
  // Confirmação
  CONFIRM_DELETE: 'Tem certeza que deseja excluir este registro?',
  CONFIRM_APPROVE: 'Tem certeza que deseja aprovar este registro?',
} as const;
