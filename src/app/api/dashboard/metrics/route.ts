import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/auth'; // ✅ Usamos a função auth() em vez de getToken()
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    // ✅ 1. Verificação de autenticação robusta para NextAuth v5
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const userId = session.user.id;
    const userRole = (session.user as any).role;

    // ✅ 2. Execução em paralelo (Promise.all) para evitar timeout no Vercel
    const [
      leadsCount, leadsNew, leadsQualified, leadsConverted,
      proposalsTotal, proposalsSent, proposalsNegotiation, proposalsWon, proposalsLost,
      totalReceivable, totalPaid, overdueReceivables,
      totalPayable, totalPaidExpenses, overduePayables,
      representativesCount, totalCommissions, pendingCommissions,
      contractsActive, expiringContracts,
      tasksPending, tasksOverdue
    ] = await Promise.all([
      // Comercial
      prisma.lead.count(),
      prisma.lead.count({ where: { status: 'Novo' } }),
      prisma.lead.count({ where: { status: 'Qualificado' } }),
      prisma.lead.count({ where: { status: 'Convertido' } }),
      prisma.proposal.count(),
      prisma.proposal.count({ where: { status: 'Enviada' } }),
      prisma.proposal.count({ where: { status: { in: ['Em negociação', 'Aguardando decisão'] } } }),
      prisma.proposal.count({ where: { status: 'Ganha' } }),
      prisma.proposal.count({ where: { status: 'Perdida' } }),
      
      // Financeiro
      prisma.accountReceivable.aggregate({ where: { status: { not: 'Recebido' } }, _sum: { value: true } }),
      prisma.accountReceivable.aggregate({ where: { status: 'Recebido' }, _sum: { value: true } }),
      prisma.accountReceivable.count({ where: { status: { not: 'Recebido' }, dueDate: { lt: new Date() } } }),
      prisma.accountPayable.aggregate({ where: { status: { not: 'Pago' } }, _sum: { value: true } }),
      prisma.accountPayable.aggregate({ where: { status: 'Pago' }, _sum: { value: true } }),
      prisma.accountPayable.count({ where: { status: { not: 'Pago' }, dueDate: { lt: new Date() } } }),
      
      // Representantes
      prisma.representative.count({ where: { status: 'Ativo' } }),
      prisma.commission.aggregate({ _sum: { value: true } }),
      prisma.commission.count({ where: { status: 'Pendente' } }),
      
      // Contratos
      prisma.contract.count({ where: { status: 'Ativo' } }),
      prisma.contract.count({
        where: {
          status: 'Ativo',
          endDate: { lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), gte: new Date() },
        },
      }),
      
      // Tarefas
      prisma.task.count({ where: { status: { not: 'Concluída' } } }),
      prisma.task.count({ where: { status: { not: 'Concluída' }, dueDate: { lt: new Date() } } }),
    ]);

    // ✅ 3. Consultas condicionais do usuário (apenas se não for ADM Master)
    let userLeads = 0;
    let userProposals = 0;
    let userTasks = 0;

    if (userRole !== 'ADM Master') {
      const [uLeads, uProposals, uTasks] = await Promise.all([
        prisma.lead.count({ where: { responsibleId: userId } }),
        prisma.proposal.count({ where: { responsibleId: userId } }),
        prisma.task.count({ where: { responsibleId: userId, status: { not: 'Concluída' } } }),
      ]);
      userLeads = uLeads;
      userProposals = uProposals;
      userTasks = uTasks;
    }

    // Converter valores do Prisma Decimal para number
    const totalPaidValue = Number(totalPaid._sum.value) || 0;
    const totalPaidExpensesValue = Number(totalPaidExpenses._sum.value) || 0;
    const totalReceivableValue = Number(totalReceivable._sum.value) || 0;
    const totalPayableValue = Number(totalPayable._sum.value) || 0;
    const totalCommissionsValue = Number(totalCommissions._sum.value) || 0;

    const result = totalPaidValue - totalPaidExpensesValue;

    return NextResponse.json({
      success: true,
      metrics: {
        commercial: {
          leads: { total: leadsCount, new: leadsNew, qualified: leadsQualified, converted: leadsConverted },
          proposals: {
            total: proposalsTotal, sent: proposalsSent, negotiation: proposalsNegotiation,
            won: proposalsWon, lost: proposalsLost,
            conversionRate: proposalsTotal > 0 ? Math.round((proposalsWon / proposalsTotal) * 100) : 0,
          },
        },
        financial: {
          receivable: { total: totalReceivableValue, overdue: overdueReceivables },
          paid: { total: totalPaidValue },
          payable: { total: totalPayableValue, overdue: overduePayables },
          expenses: { total: totalPaidExpensesValue },
          result: result,
        },
        representatives: { total: representativesCount, totalCommissions: totalCommissionsValue, pendingCommissions },
        contracts: { active: contractsActive, expiring: expiringContracts },
        tasks: { pending: tasksPending, overdue: tasksOverdue },
        user: userRole !== 'ADM Master' ? { leads: userLeads, proposals: userProposals, tasks: userTasks } : null,
      },
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('💥 [API METRICS] Erro crítico ao buscar métricas:', error);
    // ✅ Retorna JSON de erro em vez de deixar o Next.js crashar e devolver HTML
    return NextResponse.json({ error: 'Erro interno ao buscar métricas' }, { status: 500 });
  }
}
