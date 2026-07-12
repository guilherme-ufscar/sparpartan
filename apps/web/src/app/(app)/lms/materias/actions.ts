"use server";

import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { materias } from "@/db/schema";
import { registrarAuditoria } from "@/lib/audit";
import { Validador, valoresDoFormData, type EstadoForm } from "@/lib/validacao";

function precoCentavosDoFormData(formData: FormData): number | null {
  const preco = String(formData.get("preco") ?? "").trim();
  if (!preco) return null;
  const numero = Number(preco);
  return Number.isFinite(numero) && numero > 0 ? Math.round(numero * 100) : null;
}

export async function criarMateria(
  _estadoAnterior: EstadoForm,
  formData: FormData
): Promise<EstadoForm> {
  const titulo = String(formData.get("titulo") ?? "").trim();
  const descricao = String(formData.get("descricao") ?? "").trim();
  const icone = String(formData.get("icone") ?? "").trim();
  const precoCentavos = precoCentavosDoFormData(formData);
  const valores = valoresDoFormData(formData);

  const erro = new Validador().exigir(!!titulo, "Informe o título da matéria.").erro;
  if (erro) return { erro, valores };

  const [{ maxOrdem }] = await db
    .select({ maxOrdem: sql<number>`coalesce(max(${materias.ordem}), 0)` })
    .from(materias);

  const [materia] = await db
    .insert(materias)
    .values({
      titulo,
      descricao: descricao || null,
      icone: icone || null,
      precoCentavos,
      ordem: maxOrdem + 1,
    })
    .returning({ id: materias.id });

  await registrarAuditoria("criar", "materia", materia.id, titulo);

  redirect("/lms/materias");
}

export async function atualizarMateria(
  materiaId: string,
  _estadoAnterior: EstadoForm,
  formData: FormData
): Promise<EstadoForm> {
  const titulo = String(formData.get("titulo") ?? "").trim();
  const descricao = String(formData.get("descricao") ?? "").trim();
  const icone = String(formData.get("icone") ?? "").trim();
  const precoCentavos = precoCentavosDoFormData(formData);
  const valores = valoresDoFormData(formData);

  const erro = new Validador().exigir(!!titulo, "Informe o título da matéria.").erro;
  if (erro) return { erro, valores };

  await db
    .update(materias)
    .set({ titulo, descricao: descricao || null, icone: icone || null, precoCentavos })
    .where(eq(materias.id, materiaId));

  await registrarAuditoria("atualizar", "materia", materiaId, titulo);

  redirect(`/lms/materias/${materiaId}`);
}

export async function excluirMateria(materiaId: string) {
  await db.delete(materias).where(eq(materias.id, materiaId));
  await registrarAuditoria("excluir", "materia", materiaId);
  redirect("/lms/materias");
}

export async function alternarAtivoMateria(materiaId: string, ativo: boolean) {
  await db.update(materias).set({ ativo }).where(eq(materias.id, materiaId));
  await registrarAuditoria("atualizar", "materia", materiaId, ativo ? "ativada" : "desativada");
  redirect("/lms/materias");
}
