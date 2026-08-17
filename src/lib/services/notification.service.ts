import { prisma } from '@/lib/db/prisma';
import { 
  sendTaskReminderEmail,
  sendContractExpiringEmail,
  sendProposalSentEmail,
  sendPaymentReceivedEmail,
  sendCommissionPaidEmail,
  sendWelcomeEmail,
} from './email.service';

// ========== TIPOS ==========
interface Notification {
  userId: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  link?: string;
  read?: boolean;
}

// ========== NOTIFICAÇÕES NO BANCO ==========
export const createNotification = async (notification: Notification) => {
  return prisma.notification.create({
    data: {
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      link: notification.link,
      read: notification.read || false,
    },
  });
};

export const getNotifications = async (userId: string) => {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
};

export const markNotificationAsRead = async (notificationId: string) => {
  return prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  });
};

export const markAllNotificationsAsRead = async (userId: string) => {
  return prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
};

export const getUnreadCount = async (userId: string) => {
  return prisma.notification.count({
    where: { userId, read: false },
  });
};

// ========== DISPARO DE NOTIFICAÇÕES ==========
export const notifyTaskReminder = async (
  userId: string,
  email: string,
  taskTitle: string,
  dueDate: Date
) => {
  const formattedDate = dueDate.toLocaleDateString('pt-BR');
  
  await createNotification({
    userId,
    type: 'warning',
    title: '🔔 Lembrete de Tarefa',
    message: `A tarefa "${taskTitle}" vence em ${formattedDate}`,
    link: '/tarefas',
  });

  await sendTaskReminderEmail(taskTitle, formattedDate, '', email);
};

export const notifyContractExpiring = async (
  userId: string,
  email: string,
  client: string,
  contract: string,
  endDate: Date
) => {
  const formattedDate = endDate.toLocaleDateString('pt-BR');
  
  await createNotification({
    userId,
    type: 'warning',
    title: '⚠️ Contrato Próximo do Vencimento',
    message: `Contrato de ${client} vence em ${formattedDate}`,
    link: '/contratos',
  });

  await sendContractExpiringEmail(client, email, contract, formattedDate);
};

export const notifyProposalSent = async (
  userId: string,
  email: string,
  client: string,
  proposalNumber: string,
  value: number
) => {
  const formattedValue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);

  await createNotification({
    userId,
    type: 'success',
    title: '📤 Proposta Enviada',
    message: `Proposta #${proposalNumber} enviada para ${client}`,
    link: `/propostas/${proposalNumber}`,
  });

  await sendProposalSentEmail(client, email, proposalNumber, formattedValue);
};

export const notifyPaymentReceived = async (
  userId: string,
  email: string,
  client: string,
  value: number,
  proposalNumber: string
) => {
  const formattedValue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);

  await createNotification({
    userId,
    type: 'success',
    title: '💰 Pagamento Recebido',
    message: `Recebido ${formattedValue} de ${client}`,
    link: `/financeiro`,
  });

  await sendPaymentReceivedEmail(client, email, formattedValue, proposalNumber);
};

export const notifyCommissionPaid = async (
  userId: string,
  email: string,
  representative: string,
  value: number,
  proposal: string
) => {
  const formattedValue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);

  await createNotification({
    userId,
    type: 'success',
    title: '💵 Comissão Paga',
    message: `Comissão de ${formattedValue} paga para ${representative}`,
    link: `/comissoes`,
  });

  await sendCommissionPaidEmail(representative, email, formattedValue, proposal);
};

export const notifyUserWelcome = async (userId: string, email: string, name: string) => {
  await createNotification({
    userId,
    type: 'info',
    title: '👋 Bem-vindo',
    message: 'Seja bem-vindo ao Vigorre ADM™!',
    link: '/',
  });

  await sendWelcomeEmail(name, email);
};
