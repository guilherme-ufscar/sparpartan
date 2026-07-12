"use server";

import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { materiaisApoio } from "@/db/schema";
import { registrarAuditoria } from "@/lib/audit";
import { salvarArquivoLocal } from "@/lib/storage";
import { Validador, valoresDoFormData, type EstadoForm } from "@/lib/validacao";

type Escopo = { capituloId: string | null; aulaId: string | null; voltarPara: string };

/**
 * Cria um material de apoio vinculado a um capítulo OU a uma aula (exatamente
 * um dos dois, conforme `escopo`). Para `tipo="upload"` grava o arquivo em disco
 * via `salvarArquivoLocal`; para `drive`/`link` usa a URL informada diretamente.
 */
export async function criarMaterialApoio(
  escopo: Escopo,
  _estadoAnterior: EstadoForm,
  formData: FormData
): Promise<EstadoForm> {
  const titulo = String(formData.get("titulo") ?? "").trim();
  const tipo = String(formData.get("tipo") ?? "upload") as "upload" | "drive" | "link";
  const urlInformada = String(formData.get("url") ?? "").trim();
  const arquivo = formData.get("arquivo");
  const valores = valoresDoFormData(formData);

  const erro = new Validador()
    .exigir(!!titulo, "Informe o título do material.")
    .exigir(
      tipo === "upload" ? arquivo instanceof File && arquivo.size > 0 : !!urlInformada,
      tipo === "upload" ? "Selecione um arquivo." : "Informe a URL."
    ).erro;
  if (erro) return { erro, valores };

  let url = urlInformada;
  if (tipo === "upload" && arquivo instanceof File) {
    try {
      url = await salvarArquivoLocal(arquivo, "lms/materiais", "documento");
    } catch (e) {
      return { erro: e instanceof Error ? e.message : "Falha ao salvar o arquivo.", valores };
    }
  }

  const [{ maxOrdem }] = await db
    .select({ maxOrdem: sql<number>`coalesce(max(${materiaisApoio.ordem}), 0)` })
    .from(materiaisApoio);

  const [material] = await db
    .insert(materiaisApoio)
    .values({
      capituloId: escopo.capituloId,
      aulaId: escopo.aulaId,
      tipo,
      titulo,
      url,
      ordem: maxOrdem + 1,
    })
    .returning({ id: materiaisApoio.id });

  await registrarAuditoria("criar", "material_apoio", material.id, titulo);

  redirect(escopo.voltarPara);
}

export async function excluirMaterialApoio(materialId: string, voltarPara: string) {
  await db.delete(materiaisApoio).where(eq(materiaisApoio.id, materialId));
  await registrarAuditoria("excluir", "material_apoio", materialId);
  redirect(voltarPara);
}
