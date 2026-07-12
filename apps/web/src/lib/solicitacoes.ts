import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { solicitacoes, clientes } from "@/db/schema";
import { enviarEmail } from "@/lib/mail/adapter";

type TipoSolicitacao =
  | "cadastro_cliente"
  | "cadastro_embarcacao"
  | "documentos_processo"
  | "aprovacao_orcamento"
  | "acompanhamento_processo";

const CONVITE: Record<TipoSolicitacao, { assunto: string; chamada: string }> = {
  cadastro_cliente: {
    assunto: "Complete seu cadastro — Sparapan",
    chamada: "preencher seus dados e enviar seus documentos",
  },
  cadastro_embarcacao: {
    assunto: "Cadastre sua embarcação — Sparapan",
    chamada: "cadastrar os dados da sua embarcação",
  },
  documentos_processo: {
    assunto: "Documentos pendentes — Sparapan",
    chamada: "enviar os documentos que ainda faltam",
  },
  aprovacao_orcamento: {
    assunto: "Seu orçamento está pronto — Sparapan",
    chamada: "revisar e aprovar seu orçamento",
  },
  acompanhamento_processo: {
    assunto: "Acompanhe seu processo — Sparapan",
    chamada: "acompanhar o andamento do seu processo",
  },
};

export function urlBase() {
  return process.env.AUTH_URL || "http://localhost:8080";
}

export async function criarSolicitacao(input: {
  tipo: TipoSolicitacao;
  clienteId?: string;
  processoId?: string;
  orcamentoId?: string;
  embarcacaoId?: string;
}) {
  const token = randomUUID();
  const expiraEm = new Date();
  expiraEm.setDate(expiraEm.getDate() + 7);

  await db.insert(solicitacoes).values({
    tipo: input.tipo,
    token,
    clienteId: input.clienteId ?? null,
    processoId: input.processoId ?? null,
    orcamentoId: input.orcamentoId ?? null,
    embarcacaoId: input.embarcacaoId ?? null,
    expiraEm,
  });

  // O link ainda aparece na tela para copiar (cliente novo pode não ter e-mail),
  // mas quando dá para mandar sozinho, mandamos — antes era sempre copiar e colar à mão.
  if (input.clienteId) {
    const [cliente] = await db
      .select()
      .from(clientes)
      .where(eq(clientes.id, input.clienteId))
      .limit(1);

    if (cliente?.email) {
      const { assunto, chamada } = CONVITE[input.tipo];
      const link = `${urlBase()}/c/${token}`;
      try {
        await enviarEmail({
          to: cliente.email,
          subject: assunto,
          html: `<p>Olá ${cliente.nome},</p>
                 <p>Use o link abaixo para ${chamada}. Ele é válido por 7 dias e não exige senha.</p>
                 <p><a href="${link}">${link}</a></p>
                 <p>Sparapan Solução Naval</p>`,
        });
      } catch {
        // Falha de e-mail não invalida o link — ele continua disponível para copiar.
      }
    }
  }

  return token;
}

export async function buscarSolicitacaoValida(token: string) {
  const [solicitacao] = await db
    .select()
    .from(solicitacoes)
    .where(eq(solicitacoes.token, token))
    .limit(1);

  if (!solicitacao) return { solicitacao: null, expirada: false };

  const expirada =
    new Date(solicitacao.expiraEm) < new Date() && solicitacao.status === "pendente";

  if (expirada && solicitacao.status === "pendente") {
    await db.update(solicitacoes).set({ status: "expirada" }).where(eq(solicitacoes.id, solicitacao.id));
    solicitacao.status = "expirada";
  }

  return { solicitacao, expirada: solicitacao.status === "expirada" };
}

export async function marcarConcluida(id: string) {
  await db
    .update(solicitacoes)
    .set({ status: "concluida", concluidaEm: new Date() })
    .where(eq(solicitacoes.id, id));
}
