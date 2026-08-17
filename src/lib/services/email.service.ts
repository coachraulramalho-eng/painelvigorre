import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface EmailTemplate {
  subject: string;
  html: (data: any) => string;
  text?: (data: any) => string;
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ========== TEMPLATES ==========
export const emailTemplates = {
  welcome: {
    subject: 'Bem-vindo ao Vigorre ADM™',
    html: (data: { name: string }) => `
      <h1>Olá ${data.name}!</h1>
      <p>Seu acesso ao Vigorre ADM™ foi criado com sucesso.</p>
      <p>Acesse o sistema através do link abaixo:</p>
      <a href="${process.env.NEXTAUTH_URL}">${process.env.NEXTAUTH_URL}</a>
      <br/><br/>
      <p>Equipe Vigorre</p>
    `,
  } as EmailTemplate,

  proposalSent: {
    subject: 'Proposta Enviada - Vigorre ADM™',
    html: (data: { client: string; number: string; value: string }) => `
      <h1>Proposta Enviada</h1>
      <p>A proposta <strong>#${data.number}</strong> foi enviada para o cliente <strong>${data.client}</strong>.</p>
      <p>Valor: ${data.value}</p>
      <br/>
      <p>Acompanhe o status no Vigorre ADM™.</p>
    `,
  } as EmailTemplate,

  paymentReceived: {
    subject: 'Pagamento Recebido - Vigorre ADM™',
    html: (data: { client: string; value: string; proposal: string }) => `
      <h1>Pagamento Recebido! 🎉</h1>
      <p>Recebemos o pagamento de <strong>${data.value}</strong> do cliente <strong>${data.client}</strong>.</p>
      <p>Proposta: ${data.proposal}</p>
      <br/>
      <p>Atualize o status no Vigorre ADM™.</p>
    `,
  } as EmailTemplate,

  taskReminder: {
    subject: '🔔 Lembrete de Tarefa - Vigorre ADM™',
    html: (data: { title: string; dueDate: string; responsible: string }) => `
      <h1>Lembrete de Tarefa</h1>
      <p><strong>${data.title}</strong></p>
      <p>Vencimento: ${data.dueDate}</p>
      <p>Responsável: ${data.responsible}</p>
      <br/>
      <p>Não esqueça de concluir sua tarefa!</p>
    `,
  } as EmailTemplate,

  contractExpiring: {
    subject: '⚠️ Contrato Próximo do Vencimento',
    html: (data: { client: string; contract: string; endDate: string }) => `
      <h1>Contrato Próximo do Vencimento</h1>
      <p>O contrato do cliente <strong>${data.client}</strong> (${data.contract}) vence em ${data.endDate}.</p>
      <p>Inicie o processo de renovação.</p>
      <br/>
      <p>Equipe Vigorre</p>
    `,
  } as EmailTemplate,

  commissionPaid: {
    subject: 'Comissão Paga - Vigorre ADM™',
    html: (data: { representative: string; value: string; proposal: string }) => `
      <h1>Comissão Paga</h1>
      <p>${data.representative}, sua comissão de <strong>${data.value}</strong> foi paga.</p>
      <p>Proposta: ${data.proposal}</p>
      <br/>
      <p>Parabéns pelo resultado!</p>
    `,
  } as EmailTemplate,
};

// ========== ENVIO ==========
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
    return true;
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    return false;
  }
};

export const sendTemplateEmail = async (
  to: string,
  template: EmailTemplate,
  data: any
): Promise<boolean> => {
  return sendEmail({
    to,
    subject: template.subject,
    html: template.html(data),
    text: template.text?.(data),
  });
};

// ========== FUNÇÕES DE DISPARO ==========
export const sendWelcomeEmail = async (name: string, email: string) => {
  return sendTemplateEmail(email, emailTemplates.welcome, { name });
};

export const sendProposalSentEmail = async (
  client: string,
  email: string,
  proposalNumber: string,
  value: string
) => {
  return sendTemplateEmail(email, emailTemplates.proposalSent, {
    client,
    number: proposalNumber,
    value,
  });
};

export const sendPaymentReceivedEmail = async (
  client: string,
  email: string,
  value: string,
  proposal: string
) => {
  return sendTemplateEmail(email, emailTemplates.paymentReceived, {
    client,
    value,
    proposal,
  });
};

export const sendTaskReminderEmail = async (
  title: string,
  dueDate: string,
  responsible: string,
  email: string
) => {
  return sendTemplateEmail(email, emailTemplates.taskReminder, {
    title,
    dueDate,
    responsible,
  });
};

export const sendContractExpiringEmail = async (
  client: string,
  email: string,
  contract: string,
  endDate: string
) => {
  return sendTemplateEmail(email, emailTemplates.contractExpiring, {
    client,
    contract,
    endDate,
  });
};

export const sendCommissionPaidEmail = async (
  representative: string,
  email: string,
  value: string,
  proposal: string
) => {
  return sendTemplateEmail(email, emailTemplates.commissionPaid, {
    representative,
    value,
    proposal,
  });
};
