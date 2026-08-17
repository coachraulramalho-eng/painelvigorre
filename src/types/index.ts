// ========== USUÁRIOS ==========
export interface User {
  id: string;
  name: string;
  email: string;
  active: boolean;
  roles: UserRole[];
  createdAt: string;
  updatedAt: string;
}

export interface UserRole {
  roleId: string;
  role: Role;
}

export interface Role {
  id: string;
  name: string;
  description: string | null;
  isMaster: boolean;
  permissions: RolePermission[];
}

export interface RolePermission {
  permission: Permission;
}

export interface Permission {
  id: string;
  module: string;
  action: string;
  scope: string | null;
  description: string | null;
}

// ========== CRM ==========
export interface Company {
  id: string;
  name: string;
  document: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  segment: string | null;
  website: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  companyId: string;
  name: string;
  position: string | null;
  phone: string | null;
  email: string | null;
  whatsapp: string | null;
  isMain: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: string;
  companyId: string;
  contactId: string | null;
  responsibleId: string;
  representativeId: string | null;
  name: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  city: string | null;
  state: string | null;
  segment: string | null;
  origin: string;
  status: string;
  notes: string | null;
  lostReasonId: string | null;
  lostAt: string | null;
  convertedAt: string | null;
  createdAt: string;
  updatedAt: string;
  company: Company;
  contact?: Contact | null;
  responsible: User;
  representative?: User | null;
  lostReason?: LostReason | null;
  opportunities: Opportunity[];
  activities: Activity[];
  tasks: Task[];
}

export interface Activity {
  id: string;
  leadId: string | null;
  companyId: string | null;
  contactId: string | null;
  opportunityId: string | null;
  proposalId: string | null;
  responsibleId: string;
  type: string;
  description: string;
  date: string;
  nextStep: string | null;
  nextDate: string | null;
  createdAt: string;
  updatedAt: string;
  responsible: User;
}

export interface Opportunity {
  id: string;
  companyId: string;
  leadId: string | null;
  contactId: string | null;
  responsibleId: string;
  representativeId: string | null;
  title: string;
  description: string | null;
  service: string;
  estimatedValue: number | null;
  probability: number | null;
  expectedClose: string | null;
  status: string;
  lostReasonId: string | null;
  nextStep: string | null;
  nextDate: string | null;
  createdAt: string;
  updatedAt: string;
}

// ========== PROPOSTAS ==========
export interface Proposal {
  id: string;
  number: string;
  companyId: string;
  opportunityId: string | null;
  contactId: string | null;
  responsibleId: string;
  representativeId: string | null;
  title: string;
  description: string | null;
  service: string;
  quantity: number | null;
  unitPrice: number | null;
  totalValue: number;
  discount: number | null;
  finalValue: number;
  totalCost: number | null;
  margin: number | null;
  validity: string | null;
  executionDeadline: string | null;
  paymentCondition: string | null;
  notes: string | null;
  status: string;
  approvedBy: string | null;
  approvedAt: string | null;
  sentAt: string | null;
  viewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ========== FINANCEIRO ==========
export interface AccountReceivable {
  id: string;
  companyId: string;
  proposalId: string | null;
  contractId: string | null;
  installmentId: string | null;
  description: string;
  value: number;
  dueDate: string;
  competenceDate: string | null;
  paymentMethod: string | null;
  status: string;
  receivedAt: string | null;
  receivedValue: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AccountPayable {
  id: string;
  supplierId: string | null;
  description: string;
  category: string | null;
  costCenterId: string | null;
  value: number;
  dueDate: string;
  competenceDate: string | null;
  paymentMethod: string | null;
  recurrence: string | null;
  document: string | null;
  responsibleId: string | null;
  status: string;
  paidAt: string | null;
  paidValue: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

// ========== REPRESENTANTES ==========
export interface Representative {
  id: string;
  userId: string;
  type: string;
  document: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  region: string | null;
  services: string | null;
  bankData: string | null;
  pix: string | null;
  contractFile: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Commission {
  id: string;
  representativeId: string;
  proposalId: string | null;
  accountReceivableId: string | null;
  value: number;
  status: string;
  paymentDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

// ========== TAREFAS ==========
export interface Task {
  id: string;
  title: string;
  description: string | null;
  responsibleId: string;
  priority: string;
  dueDate: string;
  status: string;
  leadId: string | null;
  proposalId: string | null;
  contractId: string | null;
  companyId: string | null;
  completedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

// ========== AUDITORIA ==========
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  module: string;
  recordId: string | null;
  oldData: any | null;
  newData: any | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

// ========== UTILITÁRIOS ==========
export interface LostReason {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
}

export interface Contract {
  id: string;
  proposalId: string | null;
  companyId: string;
  title: string;
  value: number;
  startDate: string;
  endDate: string | null;
  renewalDate: string | null;
  responsibleId: string;
  fileUrl: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}
