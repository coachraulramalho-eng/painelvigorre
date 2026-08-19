import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: Request) {
  try {
    // 1. Verificar autenticação usando a função auth() (Recomendado para NextAuth v5)
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const userId = session.user.id;
    const userRole = (session.user as any).role;

    // 2. Buscar métricas em paralelo para ser mais rápido e evitar timeout
    const [
      leadsCount, leadsNew, leadsQualified, leadsConverted,
      proposalsTotal, proposalsSent, proposalsNegotiation, proposalsWon, proposalsLost,
      totalReceivable, totalPaid, overdueReceivables,
      totalPayable, totalPaidExpenses, overduePayables,
      representativesCount, totalCommissions, pendingCommissions,
      contractsActive, expiringContracts,
      tasksPending, tasksOverdue
    ] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { status: 'Novo' } }),
      prisma.lead.count({ where: { status: 'Qualificado' } }),
      prisma.lead.count({ where: { status: 'Convertido' } }),
      prisma.proposal.count(),
      prisma.proposal.count({ where: { status: 'Enviada' } }),
      prisma.proposal.count({ where: { status: { in: ['Em negociação', 'Aguardando decisão'] } } }),
      prisma.proposal.count({ where: { status: 'Ganha' } }),
      prisma.proposal.count({ where: { status: 'Perdida' } }),
      prisma.accountReceivable.aggregate({ where: { status: { not: 'Recebido' } }, _sum: { value: true } }),
      prisma.accountReceivable.aggregate({ where: { status: 'Recebido' }, _sum: { value: true } }),
      prisma.accountReceivable.count({ where: { status: { not: 'Recebido' }, dueDate: { lt: new Date() } } }),
      prisma.accountPayable.aggregate({ where: { status: { not: 'Pago' } }, _sum: { value: true } }),
      prisma.accountPayable.aggregate({ where: { status: 'Pago' }, _sum: { value: true } }),
      prisma.accountPayable.count({ where: { status: { not: 'Pago' }, dueDate: { lt: new Date() } } }),
      prisma.representative.count({ where: { status: 'Ativo' } }),
      prisma.commission.aggregate({ _sum: { value: true } }),
      prisma.commission.count({ where: { status: 'Pendente' } }),
      prisma.contract.count({ where: { status: 'Ativo' } }),
      prisma.contract.count({ where: { status: 'Ativo', endDate: { lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), gte: new Date() } } }),
      prisma.task.count({ where: { status: { not: 'Concluída' } } }),
      prisma.task.count({ where: { status: { not: 'Concluída' }, dueDate: { lt: new Date() } } }),
    ]);

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
    // 3. TRATAMENTO DE ERRO: Se o banco falhar, devolvemos JSON, não HTML!
    console.error('💥 [API METRICS] Erro crítico ao buscar métricas:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno ao buscar métricas', 
        details: process.env.NODE_ENV === 'development' ? String(error) : 'Verifique os logs do Vercel' 
      }, 
      { status: 500 }
    );
  }
}
