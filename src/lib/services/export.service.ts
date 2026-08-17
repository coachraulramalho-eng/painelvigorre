import { prisma } from '@/lib/db/prisma';
import { formatDate, formatDateTime } from '@/lib/utils/date';
import { formatCurrency } from '@/lib/utils/format';

// ========== TIPOS ==========
interface ExportData {
  headers: string[];
  rows: any[][];
  filename: string;
}

// ========== EXPORTAÇÃO CSV ==========
export const generateCSV = (data: ExportData): string => {
  const headerRow = data.headers.join(',');
  const rows = data.rows.map(row => row.join(','));
  return [headerRow, ...rows].join('\n');
};

export const downloadCSV = (data: ExportData) => {
  const csv = generateCSV(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${data.filename}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
};

// ========== EXPORTAÇÃO DE RELATÓRIOS ==========
export const exportLeadsReport = async (filters?: any) => {
  const leads = await prisma.lead.findMany({
    where: filters,
    include: {
      company: true,
      responsible: true,
      representative: true,
    },
  });

  return {
    filename: `relatorio-leads-${formatDate(new Date())}`,
    headers: ['ID', 'Lead', 'Empresa', 'Telefone', 'E-mail', 'Status', 'Origem', 'Responsável', 'Data Cadastro'],
    rows: leads.map(lead => [
      lead.id,
      lead.name,
      lead.company?.name || '',
      lead.phone || '',
      lead.email || '',
      lead.status,
      lead.origin,
      lead.responsible?.name || '',
      formatDate(lead.createdAt),
    ]),
  };
};

export const exportProposalsReport = async (filters?: any) => {
  const proposals = await prisma.proposal.findMany({
    where: filters,
    include: {
      company: true,
      responsible: true,
      representative: true,
    },
  });

  return {
    filename: `relatorio-propostas-${formatDate(new Date())}`,
    headers: ['ID', 'Cliente', 'Título', 'Valor', 'Status', 'Responsável', 'Data'],
    rows: proposals.map(proposal => [
      proposal.number,
      proposal.company?.name || '',
      proposal.title,
      formatCurrency(Number(proposal.finalValue)),
      proposal.status,
      proposal.responsible?.name || '',
      formatDate(proposal.createdAt),
    ]),
  };
};

export const exportFinancialReport = async (filters?: any) => {
  const receivables = await prisma.accountReceivable.findMany({
    where: filters,
    include: {
      company: true,
      proposal: true,
    },
  });

  return {
    filename: `relatorio-financeiro-${formatDate(new Date())}`,
    headers: ['Cliente', 'Descrição', 'Valor', 'Vencimento', 'Status', 'Data Recebimento'],
    rows: receivables.map(item => [
      item.company?.name || '',
      item.description,
      formatCurrency(Number(item.value)),
      formatDate(item.dueDate),
      item.status,
      item.receivedAt ? formatDate(item.receivedAt) : '-',
    ]),
  };
};

export const exportRepresentativesReport = async (filters?: any) => {
  const representatives = await prisma.representative.findMany({
    where: filters,
    include: {
      user: true,
      commissions: {
        where: { status: 'Paga' },
      },
    },
  });

  return {
    filename: `relatorio-representantes-${formatDate(new Date())}`,
    headers: ['Nome', 'Tipo', 'Região', 'Status', 'Total Comissões', 'Contratos'],
    rows: representatives.map(rep => [
      rep.user?.name || '',
      rep.type,
      rep.region || '',
      rep.status,
      formatCurrency(rep.commissions.reduce((acc, c) => acc + Number(c.value), 0)),
      rep.commissions.length,
    ]),
  };
};

export const exportMarketingReport = async (filters?: any) => {
  const campaigns = await prisma.marketingCampaign.findMany({
    where: filters,
    include: {
      leads: true,
    },
  });

  return {
    filename: `relatorio-marketing-${formatDate(new Date())}`,
    headers: ['Campanha', 'Status', 'Leads Gerados', 'Conversões', 'ROI'],
    rows: campaigns.map(campaign => [
      campaign.name,
      campaign.status,
      campaign.leads.length,
      campaign.leads.filter(l => l.status === 'Convertido').length,
      '0%', // Será calculado com dados reais futuramente
    ]),
  };
};

// ========== FUNÇÃO AUXILIAR PARA CONVERTER DECIMAL ==========
export const toNumber = (value: any): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseFloat(value) || 0;
  if (value.constructor?.name === 'Decimal') return Number(value);
  return Number(value) || 0;
};
