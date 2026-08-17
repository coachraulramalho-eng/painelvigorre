import { prisma } from '@/lib/db/prisma';

interface AuditLogEntry {
  userId: string;
  action: string;
  module: string;
  recordId?: string;
  oldData?: any;
  newData?: any;
  ipAddress?: string;
  userAgent?: string;
}

export const createAuditLog = async (entry: AuditLogEntry) => {
  return prisma.auditLog.create({
    data: {
      userId: entry.userId,
      action: entry.action,
      module: entry.module,
      recordId: entry.recordId,
      oldData: entry.oldData,
      newData: entry.newData,
      ipAddress: entry.ipAddress,
      userAgent: entry.userAgent,
    },
  });
};

export const getAuditLogs = async (
  filters?: {
    userId?: string;
    module?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
  },
  limit: number = 50,
  offset: number = 0
) => {
  const where: any = {};

  if (filters?.userId) where.userId = filters.userId;
  if (filters?.module) where.module = filters.module;
  if (filters?.action) where.action = filters.action;
  if (filters?.startDate) where.createdAt = { gte: filters.startDate };
  if (filters?.endDate) where.createdAt = { ...where.createdAt, lte: filters.endDate };

  return prisma.auditLog.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    skip: offset,
    take: limit,
  });
};

export const getAuditLogsByUser = async (userId: string) => {
  return prisma.auditLog.findMany({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getAuditLogsByRecord = async (recordId: string) => {
  return prisma.auditLog.findMany({
    where: { recordId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getAuditSummary = async () => {
  const total = await prisma.auditLog.count();
  const actions = await prisma.auditLog.groupBy({
    by: ['action'],
    _count: true,
  });
  const modules = await prisma.auditLog.groupBy({
    by: ['module'],
    _count: true,
  });

  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);

  const recent = await prisma.auditLog.count({
    where: { createdAt: { gte: lastWeek } },
  });

  return {
    total,
    recent,
    actions: actions.map(a => ({ action: a.action, count: a._count })),
    modules: modules.map(m => ({ module: m.module, count: m._count })),
  };
};
