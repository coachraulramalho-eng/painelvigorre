import { prisma } from '@/lib/db/prisma';
import { 
  notifyTaskReminder,
  notifyContractExpiring,
  createNotification,
} from './notification.service';
import { scheduleBackup } from './backup.service';

// ========== VERIFICAÇÕES DIÁRIAS ==========
export const checkTaskReminders = async () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const tasks = await prisma.task.findMany({
    where: {
      status: { not: 'Concluída' },
      dueDate: {
        lte: tomorrow,
        gte: today,
      },
    },
    include: {
      responsible: true,
    },
  });

  for (const task of tasks) {
    if (task.responsible?.email) {
      await notifyTaskReminder(
        task.responsibleId,
        task.responsible.email,
        task.title,
        task.dueDate
      );
    }
  }

  console.log(`✅ ${tasks.length} lembretes de tarefa enviados`);
};

export const checkExpiringContracts = async () => {
  const today = new Date();
  const thirtyDaysFromNow = new Date(today);
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const contracts = await prisma.contract.findMany({
    where: {
      status: 'Ativo',
      endDate: {
        lte: thirtyDaysFromNow,
        gte: today,
      },
    },
    include: {
      company: true,
      responsible: true,
    },
  });

  for (const contract of contracts) {
    if (contract.responsible?.email && contract.company) {
      await notifyContractExpiring(
        contract.responsibleId,
        contract.responsible.email,
        contract.company.name,
        contract.title,
        contract.endDate!
      );
    }
  }

  console.log(`✅ ${contracts.length} alertas de contrato enviados`);
};

export const checkOverdueTasks = async () => {
  const today = new Date();

  const tasks = await prisma.task.findMany({
    where: {
      status: { not: 'Concluída' },
      dueDate: { lt: today },
    },
    include: {
      responsible: true,
    },
  });

  for (const task of tasks) {
    await createNotification({
      userId: task.responsibleId,
      type: 'error',
      title: '⏰ Tarefa Atrasada',
      message: `A tarefa "${task.title}" está atrasada desde ${task.dueDate.toLocaleDateString('pt-BR')}`,
      link: `/tarefas/${task.id}`,
    });
  }

  console.log(`✅ ${tasks.length} alertas de tarefas atrasadas enviados`);
};

export const checkPaymentOverdue = async () => {
  const today = new Date();

  const payments = await prisma.accountReceivable.findMany({
    where: {
      status: { not: 'Recebido' },
      dueDate: { lt: today },
    },
    include: {
      company: true,
    },
  });

  for (const payment of payments) {
    // Notificar responsável ou criar alerta
    await createNotification({
      userId: 'system', // Ou usuário responsável
      type: 'error',
      title: '⚠️ Pagamento Vencido',
      message: `Pagamento de ${payment.company?.name || ''} no valor de ${payment.value} está vencido desde ${payment.dueDate.toLocaleDateString('pt-BR')}`,
      link: `/financeiro`,
    });
  }

  console.log(`✅ ${payments.length} alertas de pagamentos vencidos enviados`);
};

// ========== EXECUTAR TODOS OS JOBS ==========
export const runDailyJobs = async () => {
  console.log('🔄 Executando jobs diários...');
  
  await checkTaskReminders();
  await checkExpiringContracts();
  await checkOverdueTasks();
  await checkPaymentOverdue();
  await scheduleBackup();

  console.log('✅ Jobs diários concluídos');
};

// ========== CONFIGURAÇÃO ==========
export const startCronJobs = () => {
  // Executar a cada 24 horas (em produção, usar um scheduler como node-cron)
  // Ou executar via API endpoint para ser chamado por um serviço externo
  console.log('⏰ Cron jobs iniciados');
  
  // Executar imediatamente
  runDailyJobs();

  // Agendar para execução diária (em produção, usar um scheduler apropriado)
  setInterval(runDailyJobs, 24 * 60 * 60 * 1000);
};
