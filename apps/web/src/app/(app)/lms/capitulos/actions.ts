"use server";

import { redirect } from "next/navigation";
import { asc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { capitulos } from "@/db/schema";
import { registrarAuditoria } from "@/lib/audit";
import { Validador, valoresDoFormData, type EstadoForm } from "@/lib/validacao";

export async function criarCapitulo(
  materiaId: string,
  _estadoAnterior: EstadoForm,
  formData: FormData
): Promise<EstadoForm> {
  const titulo = String(formData.get("titulo") ?? "").trim();
  const descricao = String(formData.get("descricao") ?? "").trim();
  const valores = valoresDoFormData(formData);

  const erro = new Validador().exigir(!!titulo, "Informe o título do capítulo.").erro;
  if (erro) return { erro, valores };

  const [{ maxOrdem }] = await db
    .select({ maxOrdem: sql<number>`coalesce(max(${capitulos.ordem}), 0)` })
    .from(capitulos)
    .where(eq(capitulos.materiaId, materiaId));

  const [capitulo] = await db
    .insert(capitulos)
    .values({ materiaId, titulo, descricao: descricao || null, ordem: maxOrdem + 1 })
    .returning({ id: capitulos.id });

  await registrarAuditoria("criar", "capitulo", capitulo.id, titulo);

  redirect(`/lms/materias/${materiaId}`);
}

export async function atualizarCapitulo(
  materiaId: string,
  capituloId: string,
  _estadoAnterior: EstadoForm,
  formData: FormData
): Promise<EstadoForm> {
  const titulo = String(formData.get("titulo") ?? "").trim();
  const descricao = String(formData.get("descricao") ?? "").trim();
  const valores = valoresDoFormData(formData);

  const erro = new Validador().exigir(!!titulo, "Informe o título do capítulo.").erro;
  if (erro) return { erro, valores };

  await db
    .update(capitulos)
    .set({ titulo, descricao: descricao || null })
    .where(eq(capitulos.id, capituloId));

  await registrarAuditoria("atualizar", "capitulo", capituloId, titulo);

  redirect(`/lms/materias/${materiaId}`);
}

export async function alternarStatusCapitulo(
  materiaId: string,
  capituloId: string,
  status: "rascunho" | "publicado"
) {
  await db.update(capitulos).set({ status }).where(eq(capitulos.id, capituloId));
  await registrarAuditoria("atualizar", "capitulo", capituloId, status);
  redirect(`/lms/materias/${materiaId}`);
}

export async function excluirCapitulo(materiaId: string, capituloId: string) {
  await db.delete(capitulos).where(eq(capitulos.id, capituloId));
  await registrarAuditoria("excluir", "capitulo", capituloId);
  redirect(`/lms/materias/${materiaId}`);
}

/**
 * Troca a `ordem` do capítulo com a do vizinho imediato (acima ou abaixo, dentro
 * da mesma matéria) — mesmo princípio de reordenação usado pelos botões
 * subir/descer já existentes no projeto (ex.: itens ordenáveis por `ordem`).
 */
export async function reordenarCapitulo(materiaId: string, capituloId: string, direcao: "cima" | "baixo") {
  const lista = await db
    .select({ id: capitulos.id, ordem: capitulos.ordem })
    .from(capitulos)
    .where(eq(capitulos.materiaId, materiaId))
    .orderBy(asc(capitulos.ordem));

  const indice = lista.findIndex((c) => c.id === capituloId);
  const indiceVizinho = direcao === "cima" ? indice - 1 : indice + 1;

  if (indice === -1 || indiceVizinho < 0 || indiceVizinho >= lista.length) {
    redirect(`/lms/materias/${materiaId}`);
  }

  const atual = lista[indice];
  const vizinho = lista[indiceVizinho];

  await db.transaction(async (tx) => {
    await tx.update(capitulos).set({ ordem: vizinho.ordem }).where(eq(capitulos.id, atual.id));
    await tx.update(capitulos).set({ ordem: atual.ordem }).where(eq(capitulos.id, vizinho.id));
  });

  redirect(`/lms/materias/${materiaId}`);
}
