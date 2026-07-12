"use server";

import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { aulas } from "@/db/schema";
import { registrarAuditoria } from "@/lib/audit";
import { salvarArquivoLocal } from "@/lib/storage";
import { Validador, valoresDoFormData, type EstadoForm } from "@/lib/validacao";

type TipoConteudo = "video_upload" | "video_link" | "texto" | "misto";

async function extrairCampos(formData: FormData) {
  const titulo = String(formData.get("titulo") ?? "").trim();
  const tipoConteudo = String(formData.get("tipoConteudo") ?? "texto") as TipoConteudo;
  const corpoHtml = String(formData.get("corpoHtml") ?? "").trim();
  const videoUrl = String(formData.get("videoUrl") ?? "").trim();
  const ordem = Number(formData.get("ordem") ?? 1) || 1;
  const duracaoMinutosRaw = String(formData.get("duracaoMinutos") ?? "").trim();
  const duracaoMinutos = duracaoMinutosRaw ? Number(duracaoMinutosRaw) : null;
  const arquivoVideo = formData.get("videoArquivo");
  return { titulo, tipoConteudo, corpoHtml, videoUrl, ordem, duracaoMinutos, arquivoVideo };
}

export async function criarAula(
  capituloId: string,
  _estadoAnterior: EstadoForm,
  formData: FormData
): Promise<EstadoForm> {
  const { titulo, tipoConteudo, corpoHtml, videoUrl, duracaoMinutos, arquivoVideo } =
    await extrairCampos(formData);
  const valores = valoresDoFormData(formData);

  const erro = new Validador()
    .exigir(!!titulo, "Informe o título da aula.")
    .exigir(
      tipoConteudo !== "video_link" || !!videoUrl,
      "Informe o link do vídeo."
    )
    .exigir(
      tipoConteudo !== "video_upload" || arquivoVideo instanceof File,
      "Selecione o arquivo de vídeo."
    ).erro;
  if (erro) return { erro, valores };

  let videoArquivo: string | null = null;
  if (tipoConteudo === "video_upload" && arquivoVideo instanceof File && arquivoVideo.size > 0) {
    try {
      videoArquivo = await salvarArquivoLocal(arquivoVideo, "lms/videos", "video");
    } catch (e) {
      return { erro: e instanceof Error ? e.message : "Falha ao salvar o vídeo.", valores };
    }
  }

  const [{ maxOrdem }] = await db
    .select({ maxOrdem: sql<number>`coalesce(max(${aulas.ordem}), 0)` })
    .from(aulas)
    .where(eq(aulas.capituloId, capituloId));

  const [aula] = await db
    .insert(aulas)
    .values({
      capituloId,
      titulo,
      tipoConteudo,
      corpoHtml: corpoHtml || null,
      videoUrl: tipoConteudo === "video_link" ? videoUrl || null : null,
      videoArquivo,
      ordem: maxOrdem + 1,
      duracaoMinutos,
    })
    .returning({ id: aulas.id });

  await registrarAuditoria("criar", "aula", aula.id, titulo);

  redirect(`/lms/capitulos/${capituloId}`);
}

export async function atualizarAula(
  aulaId: string,
  _estadoAnterior: EstadoForm,
  formData: FormData
): Promise<EstadoForm> {
  const { titulo, tipoConteudo, corpoHtml, videoUrl, ordem, duracaoMinutos, arquivoVideo } =
    await extrairCampos(formData);
  const valores = valoresDoFormData(formData);

  const erro = new Validador()
    .exigir(!!titulo, "Informe o título da aula.")
    .exigir(tipoConteudo !== "video_link" || !!videoUrl, "Informe o link do vídeo.").erro;
  if (erro) return { erro, valores };

  const [aulaAtual] = await db.select().from(aulas).where(eq(aulas.id, aulaId)).limit(1);
  if (!aulaAtual) return { erro: "Aula não encontrada.", valores };

  let videoArquivo = aulaAtual.videoArquivo;
  if (tipoConteudo === "video_upload" && arquivoVideo instanceof File && arquivoVideo.size > 0) {
    try {
      videoArquivo = await salvarArquivoLocal(arquivoVideo, "lms/videos", "video");
    } catch (e) {
      return { erro: e instanceof Error ? e.message : "Falha ao salvar o vídeo.", valores };
    }
  }

  await db
    .update(aulas)
    .set({
      titulo,
      tipoConteudo,
      corpoHtml: corpoHtml || null,
      videoUrl: tipoConteudo === "video_link" ? videoUrl || null : null,
      videoArquivo: tipoConteudo === "video_upload" ? videoArquivo : null,
      ordem,
      duracaoMinutos,
    })
    .where(eq(aulas.id, aulaId));

  await registrarAuditoria("atualizar", "aula", aulaId, titulo);

  redirect(`/lms/aulas/${aulaId}`);
}

export async function alternarStatusAula(
  capituloId: string,
  aulaId: string,
  status: "rascunho" | "publicado"
) {
  await db.update(aulas).set({ status }).where(eq(aulas.id, aulaId));
  await registrarAuditoria("atualizar", "aula", aulaId, status);
  redirect(`/lms/capitulos/${capituloId}`);
}

export async function excluirAula(capituloId: string, aulaId: string) {
  await db.delete(aulas).where(eq(aulas.id, aulaId));
  await registrarAuditoria("excluir", "aula", aulaId);
  redirect(`/lms/capitulos/${capituloId}`);
}

export async function capituloDaAula(aulaId: string): Promise<string | null> {
  const [linha] = await db
    .select({ capituloId: aulas.capituloId })
    .from(aulas)
    .where(eq(aulas.id, aulaId))
    .limit(1);
  return linha?.capituloId ?? null;
}

