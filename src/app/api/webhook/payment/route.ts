import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { notifyPaymentReceived } from '@/lib/services/notification.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, data } = body;

    // Verificar assinatura do webhook (segurança)
    const signature = request.headers.get('x-webhook-signature');
    // TODO: Validar assinatura com a chave do gateway

    switch (event) {
      case 'payment.succeeded': {
        // Atualizar status do pagamento
        const paymentLink = await prisma.paymentLink.findUnique({
          where: { url: data.link_id },
          include: {
            proposal: {
              include: {
                company: true,
                responsible: true,
              },
            },
          },
        });

        if (paymentLink) {
          await prisma.paymentLink.update({
            where: { id: paymentLink.id },
            data: {
              status: 'Pago',
              paidAt: new Date(),
            },
          });

          // Atualizar conta a receber
          if (paymentLink.proposal) {
            const accountReceivable = await prisma.accountReceivable.findFirst({
              where: {
                proposalId: paymentLink.proposalId,
                status: { not: 'Recebido' },
              },
            });

            if (accountReceivable) {
              await prisma.accountReceivable.update({
                where: { id: accountReceivable.id },
                data: {
                  status: 'Recebido',
                  receivedAt: new Date(),
                  receivedValue: data.amount,
                },
              });
            }

            // Notificar responsável
            if (paymentLink.proposal.responsible?.email) {
              await notifyPaymentReceived(
                paymentLink.proposal.responsibleId,
                paymentLink.proposal.responsible.email,
                paymentLink.proposal.company?.name || '',
                data.amount,
                paymentLink.proposal.number
              );
            }
          }
        }

        break;
      }

      case 'payment.failed': {
        // Registrar falha e notificar
        break;
      }

      case 'payment.refunded': {
        // Processar reembolso
        break;
      }

      default:
        console.log('Evento não tratado:', event);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Erro no webhook de pagamento:', error);
    return NextResponse.json(
      { error: 'Erro ao processar webhook' },
      { status: 500 }
    );
  }
}
