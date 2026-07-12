import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { matriculas } from "@/db/schema";

/**
 * Confere se o aluno tem matrícula ativa (e não expirada) para a matéria.
 * Usada no topo de toda página de conteúdo do portal do aluno.
 */
export async function verificarMatriculaAtiva(alunoId: string, materiaId: string): Promise<boolean> {
  const agora = new Date();
  const [matricula] = await db
    .select()
    .from(matriculas)
    .where(
      and(
        eq(matriculas.alunoId, alunoId),
        eq(matriculas.materiaId, materiaId),
        eq(matriculas.status, "ativo")
      )
    )
    .limit(1);

  if (!matricula) return false;
  if (matricula.expiraEm && matricula.expiraEm < agora) return false;
  return true;
}
