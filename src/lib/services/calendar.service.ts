import { prisma } from '@/lib/db/prisma';
import { addDays, formatDate, isSameDay } from '@/lib/utils/date';

// ========== TIPOS ==========
interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  type: 'task' | 'followup' | 'meeting' | 'deadline' | 'contract';
  status: 'pending' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  link?: string;
  userId: string;
  relatedId?: string;
}

// ========== CRUD ==========
export const createCalendarEvent = async (event: Omit<CalendarEvent, 'id'>) => {
  return prisma.calendarEvent.create({
    data: {
      title: event.title,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      type: event.type,
      status: event.status,
      priority: event.priority,
      link: event.link,
      userId: event.userId,
      relatedId: event.relatedId,
    },
  });
};

export const getCalendarEvents = async (userId: string, startDate?: Date, endDate?: Date) => {
  const where: any = { userId };
  
  if (startDate && endDate) {
    where.startDate = {
      gte: startDate,
      lte: endDate,
    };
  }

  return prisma.calendarEvent.findMany({
    where,
    orderBy: { startDate: 'asc' },
  });
};

export const getCalendarEventsByDate = async (userId: string, date: Date) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return prisma.calendarEvent.findMany({
    where: {
      userId,
      startDate: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    orderBy: { startDate: 'asc' },
  });
};

export const updateCalendarEvent = async (id: string, data: Partial<CalendarEvent>) => {
  return prisma.calendarEvent.update({
    where: { id },
    data,
  });
};

export const deleteCalendarEvent = async (id: string) => {
  return prisma.calendarEvent.delete({
    where: { id },
  });
};

// ========== FUNÇÕES DE AUTOMAÇÃO ==========
export const generateTasksEvents = async (userId: string) => {
  const tasks = await prisma.task.findMany({
    where: {
      responsibleId: userId,
      status: { not: 'Concluída' },
    },
  });

  for (const task of tasks) {
    await createCalendarEvent({
      title: task.title,
      description: task.description || undefined,
      startDate: task.dueDate,
      type: 'task',
      status: 'pending',
      priority: task.priority.toLowerCase() as 'low' | 'medium' | 'high',
      link: `/tarefas/${task.id}`,
      userId,
      relatedId: task.id,
    });
  }
};

export const generateFollowupEvents = async (userId: string) => {
  const activities = await prisma.activity.findMany({
    where: {
      responsibleId: userId,
      nextDate: { not: null },
      nextStep: { not: null },
    },
  });

  for (const activity of activities) {
    if (activity.nextDate) {
      await createCalendarEvent({
        title: activity.nextStep || 'Follow-up',
        description: activity.description,
        startDate: activity.nextDate,
        type: 'followup',
        status: 'pending',
        priority: 'medium',
        link: `/leads/${activity.leadId}`,
        userId,
        relatedId: activity.id,
      });
    }
  }
};

export const generateContractEvents = async (userId: string) => {
  const contracts = await prisma.contract.findMany({
    where: {
      responsibleId: userId,
      status: 'Ativo',
      endDate: { not: null },
    },
  });

  for (const contract of contracts) {
    if (contract.endDate) {
      // Criar alerta 30 dias antes
      const alertDate = new Date(contract.endDate);
      alertDate.setDate(alertDate.getDate() - 30);

      await createCalendarEvent({
        title: `⚠️ Contrato vence: ${contract.title}`,
        description: `Contrato do cliente ${contract.companyId} vence em ${formatDate(contract.endDate)}`,
        startDate: alertDate,
        type: 'contract',
        status: 'pending',
        priority: 'high',
        link: `/contratos/${contract.id}`,
        userId,
        relatedId: contract.id,
      });
    }
  }
};

// ========== DASHBOARD ==========
export const getUpcomingEvents = async (userId: string, days: number = 7) => {
  const today = new Date();
  const future = addDays(today, days);

  return prisma.calendarEvent.findMany({
    where: {
      userId,
      startDate: {
        gte: today,
        lte: future,
      },
      status: 'pending',
    },
    orderBy: { startDate: 'asc' },
    take: 20,
  });
};

export const getOverdueEvents = async (userId: string) => {
  const today = new Date();

  return prisma.calendarEvent.findMany({
    where: {
      userId,
      startDate: {
        lt: today,
      },
      status: 'pending',
    },
    orderBy: { startDate: 'asc' },
  });
};
