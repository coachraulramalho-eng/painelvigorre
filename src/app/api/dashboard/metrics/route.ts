import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request as any });
    
    if (!token) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // ========== COMERCIAL ==========
    const leadsCount = await prisma.lead.count();
    const leadsNew = await prisma.lead.count({ where: { status: 'Novo' } });
    const leadsQualified = await prisma.lead.count({ where: { status: 'Qualificado' } });
    const leadsConverted = await prisma.lead.count({ where: { status: 'Convertido' } });

    const proposalsTotal = await prisma.proposal.count();
    const proposalsSent = await prisma.proposal.count({ where: { status: 'Enviada' } });
    const proposalsNegotiation = await prisma.proposal.count({ 
      where: { status: { in: ['Em negociação', 'Aguardando decisão'] } } 
    });
    const proposalsWon = await prisma.proposal.count({ where: { status: 'Ganha' } });
    const proposalsLost = await prisma.proposal.count({ where: { status: 'Perdida' } });

    // ========== FINANCEIRO ==========
    const totalReceivable = await prisma.accountReceivable.aggregate({
      where: { status: { not: 'Recebido' } },
      _sum: { value: true },
    });

    const totalPaid = await prisma.accountReceivable.aggregate({
      where: { status: 'Recebido' },
      _sum: { value: true },
    });

    const overdueReceivables = await prisma.accountReceivable.count({
      where: {
        status: { not: 'Recebido' },
        dueDate: { lt: new Date() },
      },
    });

    const totalPayable = await prisma.accountPayable.aggregate({
      where: { status: { not: 'Pago' } },
      _sum: { value: true },
    });

    const totalPaidExpenses = await prisma.accountPayable.aggregate({
      where: { status: 'Pago' },
      _sum: { value: true },
    });

    const overduePayables = await prisma.accountPayable.count({
      where: {
        status: { not: 'Pago' },
        dueDate: { lt: new Date() },
      },
    });

    // ========== REPRESENTANTES ==========
    const representativesCount = await prisma.representative.count({
      where: { status: 'Ativo' },
    });

    const totalCommissions = await prisma.commission.aggregate({
      _sum: { value: true },
    });

    const pendingCommissions = await prisma.commission.count({
      where: { status: 'Pendente' },
    });

    // ========== CONTRATOS ==========
    const contractsActive = await prisma.contract.count({
      where: { status: 'Ativo' },
    });

    const expiringContracts = await prisma.contract.count({
      where: {
        status: 'Ativo',
        endDate: {
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          gte: new Date(),
        },
      },
    });

    // ========== TAREFAS ==========
    const tasksPending = await prisma.task.count({
      where: { status: { not: 'Concluída' } },
    });

    const tasksOverdue = await prisma.task.count({
      where: {
        status: { not: 'Concluída' },
        dueDate: { lt: new Date() },
      },
    });

    // ========== DASHBOARD DO USUÁRIO ==========
    let userLeads = 0;
    let userProposals = 0;
    let userTasks = 0;

    if (token.role !== 'ADM Master') {
      userLeads = await prisma.lead.count({
        where: { responsibleId: token.id as string },
      });
      userProposals = await prisma.proposal.count({
        where: { responsibleId: token.id as string },
      });
      userTasks = await prisma.task.count({
        where: { 
          responsibleId: token.id as string,
          status: { not: 'Concluída' },
        },
      });
    }

    return NextResponse.json({
      success: true,
      metrics: {
        commercial: {
          leads: {
            total: leadsCount,
            new: leadsNew,
            qualified: leadsQualified,
            converted: leadsConverted,
          },
          proposals: {
            total: proposalsTotal,
            sent: proposalsSent,
            negotiation: proposalsNegotiation,
            won: proposalsWon,
            lost: proposalsLost,
            conversionRate: proposalsTotal > 0 
              ? Math.round((proposalsWon / proposalsTotal) * 100) 
              : 0,
          },
        },
        financial: {
          receivable: {
            total: totalReceivable._sum.value || 0,
            overdue: overdueReceivables,
          },
          paid: {
            total: totalPaid._sum.value || 0,
          },
          payable: {
            total: totalPayable._sum.value || 0,
            overdue: overduePayables,
          },
          expenses: {
            total: totalPaidExpenses._sum.value || 0,
          },
          result: (totalPaid._sum.value || 0) - (totalPaidExpenses._sum.value || 0),
        },
        representatives: {
          total: representativesCount,
          totalCommissions: totalCommissions._sum.value || 0,
          pendingCommissions,
        },
        contracts: {
          active: contractsActive,
          expiring: expiringContracts,
        },
        tasks: {
          pending: tasksPending,
          overdue: tasksOverdue,
        },
        user: token.role !== 'ADM Master' ? {
          leads: userLeads,
          proposals: userProposals,
          tasks: userTasks,
        } : null,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erro ao buscar métricas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar métricas' },
      { status: 500 }
    );
  }
}
