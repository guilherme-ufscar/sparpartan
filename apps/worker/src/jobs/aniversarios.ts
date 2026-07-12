import { sql } from "../db.js";
import { enviarERegistrar } from "../mail.js";
import { resolverVariaveis } from "../templates.js";

const ASSUNTO_PADRAO = "Feliz Aniversário! 🎉 — Sparapan";
const CORPO_PADRAO =
  "<p>Olá {{nome}},</p><p>A equipe da Sparapan Solução Naval deseja um feliz aniversário! " +
  "Que seu novo ano venha com muitas boas navegações.</p><p>Abraços,<br>Sparapan Solução Naval</p>";

export async function enviarAniversarios() {
  // Aniversariantes de hoje. 29/02 é tratado no dia 28 em ano não bissexto,
  // senão quem nasceu nesse dia nunca receberia o e-mail.
  const aniversariantes = await sql<
    { id: string; nome: string; email: string }[]
  >`
    SELECT id, nome, email
    FROM clientes
    WHERE data_nascimento IS NOT NULL
      AND email IS NOT NULL
      AND excluido_em IS NULL
      AND (
        (EXTRACT(MONTH FROM data_nascimento) = EXTRACT(MONTH FROM current_date)
          AND EXTRACT(DAY FROM data_nascimento) = EXTRACT(DAY FROM current_date))
        OR (
          EXTRACT(MONTH FROM data_nascimento) = 2 AND EXTRACT(DAY FROM data_nascimento) = 29
          AND EXTRACT(MONTH FROM current_date) = 2 AND EXTRACT(DAY FROM current_date) = 28
          AND NOT (
            EXTRACT(YEAR FROM current_date)::int % 4 = 0
            AND (EXTRACT(YEAR FROM current_date)::int % 100 != 0 OR EXTRACT(YEAR FROM current_date)::int % 400 = 0)
          )
        )
      )
  `;

  const [template] = await sql<{ assunto: string; corpo: string }[]>`
    SELECT assunto, corpo FROM templates_email WHERE tipo = 'aniversario' ORDER BY criado_em DESC LIMIT 1
  `;

  let enviados = 0;

  for (const cliente of aniversariantes) {
    // Trava de idempotência: sem isso, um restart do worker ou retry do BullMQ
    // reenviaria o e-mail no mesmo dia.
    const [jaEnviado] = await sql`
      SELECT id FROM envios_email
      WHERE cliente_id = ${cliente.id}
        AND criado_em::date = current_date
        AND assunto ILIKE '%aniversário%'
        AND status = 'enviado'
    `;
    if (jaEnviado) continue;

    const variaveis = { nome: cliente.nome, email: cliente.email };
    const assunto = template ? resolverVariaveis(template.assunto, variaveis) : ASSUNTO_PADRAO;
    const html = template ? resolverVariaveis(template.corpo, variaveis) : resolverVariaveis(CORPO_PADRAO, variaveis);

    const status = await enviarERegistrar({
      clienteId: cliente.id,
      to: cliente.email,
      subject: assunto,
      html,
    });

    if (status === "enviado") enviados++;
  }

  return { enviados, total: aniversariantes.length };
}
