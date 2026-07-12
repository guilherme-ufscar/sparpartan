import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { db } from "@/db";
import { pedidosPagamento, matriculas, alunos } from "@/db/schema";
import { enviarEmail } from "@/lib/mail/adapter";

/**
 * Notificação do Mercado Pago. Nunca confiamos no payload em si — sempre
 * reconsultamos o pagamento na API do MP pelo id recebido antes de liberar
 * acesso, o que já protege contra notificações forjadas mesmo sem validação
 * de assinatura (não configurada nesta v1).
 */
export async function POST(req: Request) {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    return NextResponse.json({ error: "Mercado Pago não configurado" }, { status: 500 });
  }

  const url = new URL(req.url);
  let paymentId = url.searchParams.get("data.id") ?? url.searchParams.get("id");

  if (!paymentId) {
    try {
      const body = await req.json();
      paymentId = body?.data?.id ?? body?.id ?? null;
    } catch {
      // corpo vazio/inválido — segue sem paymentId, tratado abaixo.
    }
  }

  if (!paymentId) {
    return NextResponse.json({ error: "id do pagamento não informado" }, { status: 400 });
  }

  const client = new MercadoPagoConfig({ accessToken });
  const paymentClient = new Payment(client);

  let pagamento;
  try {
    pagamento = await paymentClient.get({ id: paymentId });
  } catch {
    return NextResponse.json({ error: "pagamento não encontrado" }, { status: 404 });
  }

  const pedidoId = pagamento.external_reference;
  if (!pedidoId) {
    return NextResponse.json({ ok: true });
  }

  const [pedido] = await db.select().from(pedidosPagamento).where(eq(pedidosPagamento.id, pedidoId)).limit(1);
  if (!pedido) {
    return NextResponse.json({ ok: true });
  }

  if (pagamento.status === "approved") {
    await db.transaction(async (tx) => {
      await tx
        .update(pedidosPagamento)
        .set({
          status: "aprovado",
          mercadopagoPaymentId: String(pagamento.id),
          atualizadoEm: new Date(),
        })
        .where(eq(pedidosPagamento.id, pedido.id));

      const [matriculaExistente] = await tx
        .select({ id: matriculas.id })
        .from(matriculas)
        .where(and(eq(matriculas.alunoId, pedido.alunoId), eq(matriculas.materiaId, pedido.materiaId)))
        .limit(1);

      if (!matriculaExistente) {
        await tx.insert(matriculas).values({
          alunoId: pedido.alunoId,
          materiaId: pedido.materiaId,
          status: "ativo",
          origem: "mercadopago",
          pagamentoId: String(pagamento.id),
        });
      } else {
        await tx
          .update(matriculas)
          .set({ status: "ativo", origem: "mercadopago", pagamentoId: String(pagamento.id) })
          .where(eq(matriculas.id, matriculaExistente.id));
      }
    });

    const [aluno] = await db.select().from(alunos).where(eq(alunos.id, pedido.alunoId)).limit(1);
    if (aluno) {
      try {
        await enviarEmail({
          to: aluno.email,
          subject: "Pagamento aprovado — acesso liberado",
          html: `<p>Olá, ${aluno.nome}!</p><p>Seu pagamento foi aprovado e o acesso já está liberado na Área do Aluno.</p>`,
        });
      } catch {
        // falha no envio de e-mail não deve impedir a confirmação do webhook.
      }
    }
  } else if (pagamento.status === "rejected" || pagamento.status === "cancelled") {
    await db
      .update(pedidosPagamento)
      .set({
        status: pagamento.status === "rejected" ? "rejeitado" : "cancelado",
        mercadopagoPaymentId: String(pagamento.id),
        atualizadoEm: new Date(),
      })
      .where(eq(pedidosPagamento.id, pedido.id));
  }

  return NextResponse.json({ ok: true });
}
