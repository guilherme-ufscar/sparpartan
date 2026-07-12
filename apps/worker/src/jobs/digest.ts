import { sql } from "../db.js";
import { enviarERegistrar } from "../mail.js";

type Linha = { mensagem: string; clienteNome: string | null };

/**
 * Antes, um lembrete criado pelo worker ficava esperando o admin lembrar de abrir
 * o sistema. Este digest empurra a lista de pendências para o e-mail dele.
 */
export async function digestDiario() {
  const destinatario = process.env.ADMIN_EMAIL;
  if (!destinatario) return { enviado: false, motivo: "ADMIN_EMAIL não configurado" };

  const lembretes = await sql<Linha[]>`
    SELECT l.mensagem, c.nome as "clienteNome"
    FROM lembretes l
    LEFT JOIN clientes c ON c.id = l.cliente_id
    WHERE l.resolvido = false
    ORDER BY l.data_lembrete ASC
    LIMIT 50
  `;

  const [{ solicitacoesPendentes }] = await sql<{ solicitacoesPendentes: number }[]>`
    SELECT count(*)::int as "solicitacoesPendentes"
    FROM solicitacoes WHERE status = 'pendente'
  `;

  if (lembretes.length === 0 && solicitacoesPendentes === 0) {
    return { enviado: false, motivo: "nada pendente" };
  }

  const itens = lembretes
    .map((l) => `<li>${l.mensagem}${l.clienteNome ? ` — <em>${l.clienteNome}</em>` : ""}</li>`)
    .join("");

  await enviarERegistrar({
    to: destinatario,
    subject: `Sparapan — ${lembretes.length} pendência(s) hoje`,
    html: `<p>Bom dia,</p>
     <p>Você tem <strong>${lembretes.length}</strong> lembrete(s) em aberto:</p>
     <ul>${itens}</ul>
     ${solicitacoesPendentes > 0 ? `<p>E <strong>${solicitacoesPendentes}</strong> link(s) enviados ao cliente ainda sem resposta.</p>` : ""}
     <p>Sparapan Solução Naval</p>`,
  });

  return { enviado: true, lembretes: lembretes.length };
}
