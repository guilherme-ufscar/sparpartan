"use server";

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { redirect } from "next/navigation";
import { eq, and, gte, asc } from "drizzle-orm";
import { db } from "@/db";
import { criarSolicitacao } from "@/lib/solicitacoes";
import { pendenciasDoProcesso, reclassificarProcesso } from "@/lib/processos";
import {
  processos,
  modelosDocumento,
  documentosGerados,
  clientes,
  servicos,
  agendaEventos,
} from "@/db/schema";
import { registrarAuditoria } from "@/lib/audit";
import { enviarEmail } from "@/lib/mail/adapter";
import { Validador, valoresDoFormData, type EstadoForm } from "@/lib/validacao";
import { validarArquivo } from "@/lib/upload";

function uploadsDir() {
  return process.env.UPLOADS_DIR ?? "./data/uploads";
}

export async function criarProcesso(
  _estadoAnterior: EstadoForm,
  formData: FormData
): Promise<EstadoForm> {
  const clienteId = String(formData.get("clienteId") ?? "");
  const servicoId = String(formData.get("servicoId") ?? "");
  const embarcacaoId = String(formData.get("embarcacaoId") ?? "") || null;
  const valores = valoresDoFormData(formData);

  const erro = new Validador()
    .exigir(!!clienteId, "Selecione o cliente.")
    .exigir(!!servicoId, "Selecione o serviço.").erro;

  if (erro) return { erro, valores };

  const [processo] = await db
    .insert(processos)
    .values({ clienteId, servicoId, embarcacaoId })
    .returning({ id: processos.id });

  await reclassificarProcesso(processo.id);

  redirect(`/processos/${processo.id}`);
}

export async function protocolarProcesso(processoId: string, formData: FormData) {
  const numeroProtocolo = String(formData.get("numeroProtocolo") ?? "").trim();
  if (!numeroProtocolo) throw new Error("Número do protocolo é obrigatório");

  const [processo] = await db.select().from(processos).where(eq(processos.id, processoId)).limit(1);
  if (!processo) throw new Error("Processo não encontrado");

  const faltando = await pendenciasDoProcesso(processoId);
  if (faltando.length > 0) {
    throw new Error(`Documentos obrigatórios faltando: ${faltando.map((p) => p.nome).join(", ")}`);
  }

  let protocoloEscaneadoCaminho: string | null = null;
  const comprovante = formData.get("comprovante") as File | null;
  if (comprovante && comprovante.size > 0) {
    const erroArquivo = validarArquivo(comprovante);
    if (erroArquivo) throw new Error(erroArquivo);

    const processosDir = path.join(uploadsDir(), "processos", processoId);
    await mkdir(processosDir, { recursive: true });
    const extensao = path.extname(comprovante.name) || ".pdf";
    const nomeArquivo = `protocolo-${randomUUID()}${extensao}`;
    const bytes = Buffer.from(await comprovante.arrayBuffer());
    await writeFile(path.join(processosDir, nomeArquivo), bytes);
    protocoloEscaneadoCaminho = path.join("processos", processoId, nomeArquivo);
  }

  await db
    .update(processos)
    .set({
      status: "protocolado",
      numeroProtocolo,
      dataProtocolo: String(formData.get("dataProtocolo") ?? "") || null,
      ...(protocoloEscaneadoCaminho ? { protocoloEscaneadoCaminho } : {}),
      atualizadoEm: new Date(),
    })
    .where(eq(processos.id, processoId));

  await db
    .update(documentosGerados)
    .set({ status: "protocolado" })
    .where(and(eq(documentosGerados.processoId, processoId), eq(documentosGerados.status, "gerado")));

  await registrarAuditoria("atualizar", "processo", processoId, `protocolado sob nº ${numeroProtocolo}`);

  await notificarClienteProtocolo(processoId, numeroProtocolo);

  redirect(`/processos/${processoId}`);
}

async function notificarClienteProtocolo(processoId: string, numeroProtocolo: string) {
  const [processo] = await db.select().from(processos).where(eq(processos.id, processoId)).limit(1);
  if (!processo) return;

  const [cliente] = await db.select().from(clientes).where(eq(clientes.id, processo.clienteId)).limit(1);
  if (!cliente?.email) return;

  const [servico] = await db.select().from(servicos).where(eq(servicos.id, processo.servicoId)).limit(1);

  let mensagemProva = "";
  if (servico?.categoria === "escola") {
    const [proximaProva] = await db
      .select()
      .from(agendaEventos)
      .where(
        and(
          eq(agendaEventos.clienteId, cliente.id),
          eq(agendaEventos.tipo, "prova"),
          gte(agendaEventos.dataHora, new Date())
        )
      )
      .orderBy(asc(agendaEventos.dataHora))
      .limit(1);

    if (proximaProva) {
      const dataFormatada = new Date(proximaProva.dataHora).toLocaleString("pt-BR", {
        dateStyle: "long",
        timeStyle: "short",
      });
      mensagemProva = `<p>Sua prova está marcada para <strong>${dataFormatada}</strong>.</p>`;
    }
  }

  try {
    await enviarEmail({
      to: cliente.email,
      subject: `Processo protocolado — nº ${numeroProtocolo}`,
      html: `<p>Olá ${cliente.nome},</p><p>Seu processo &quot;${servico?.nome ?? ""}&quot; foi protocolado sob o número <strong>${numeroProtocolo}</strong>.</p>${mensagemProva}<p>Sparapan Solução Naval</p>`,
    });
  } catch {
    // Falha de e-mail não deve travar o protocolo — a equipe já viu o número na tela.
  }
}

export async function definirEmbarcacao(processoId: string, formData: FormData) {
  const embarcacaoId = String(formData.get("embarcacaoId") ?? "") || null;

  await db
    .update(processos)
    .set({ embarcacaoId, atualizadoEm: new Date() })
    .where(eq(processos.id, processoId));

  redirect(`/processos/${processoId}`);
}

export async function concluirProcesso(processoId: string) {
  await db
    .update(processos)
    .set({ status: "concluido", atualizadoEm: new Date() })
    .where(eq(processos.id, processoId));

  redirect(`/processos/${processoId}`);
}

export async function gerarLinkDocumentos(processoId: string) {
  const [processo] = await db.select().from(processos).where(eq(processos.id, processoId)).limit(1);
  if (!processo) throw new Error("Processo não encontrado");

  const token = await criarSolicitacao({
    tipo: "documentos_processo",
    processoId,
    clienteId: processo.clienteId,
  });
  redirect(`/processos/${processoId}?link=${token}`);
}

export async function gerarLinkAcompanhamento(processoId: string) {
  const [processo] = await db.select().from(processos).where(eq(processos.id, processoId)).limit(1);
  if (!processo) throw new Error("Processo não encontrado");

  const token = await criarSolicitacao({
    tipo: "acompanhamento_processo",
    processoId,
    clienteId: processo.clienteId,
  });
  redirect(`/processos/${processoId}?link=${token}`);
}
