import Link from "next/link";
import { and, eq, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { materias, matriculas, capitulos, aulas, progressoAula } from "@/db/schema";
import { authAluno } from "@/lib/auth-aluno";
import { ProgressBar, EmptyState } from "@/components/ui";
import { GraduationCap } from "lucide-react";

export default async function AlunoHomePage() {
  const session = await authAluno();
  if (!session?.user?.id) redirect("/aluno/login");
  const alunoId = session.user.id as string;

  const agora = new Date();

  const minhasMatriculas = await db
    .select({ materia: materias, matricula: matriculas })
    .from(matriculas)
    .innerJoin(materias, eq(matriculas.materiaId, materias.id))
    .where(and(eq(matriculas.alunoId, alunoId), eq(matriculas.status, "ativo"), eq(materias.ativo, true)));

  const matriculasValidas = minhasMatriculas.filter(
    (m) => !m.matricula.expiraEm || m.matricula.expiraEm >= agora
  );

  const materiaIds = matriculasValidas.map((m) => m.materia.id);

  const totalAulasPorMateria = new Map<string, number>();
  const concluidasPorMateria = new Map<string, number>();

  if (materiaIds.length > 0) {
    const capsPublicados = await db
      .select({ id: capitulos.id, materiaId: capitulos.materiaId })
      .from(capitulos)
      .where(and(inArray(capitulos.materiaId, materiaIds), eq(capitulos.status, "publicado")));

    const capIds = capsPublicados.map((c) => c.id);
    const capMateriaMap = new Map(capsPublicados.map((c) => [c.id, c.materiaId]));

    if (capIds.length > 0) {
      const aulasPublicadas = await db
        .select({ id: aulas.id, capituloId: aulas.capituloId })
        .from(aulas)
        .where(and(inArray(aulas.capituloId, capIds), eq(aulas.status, "publicado")));

      for (const aula of aulasPublicadas) {
        const materiaId = capMateriaMap.get(aula.capituloId);
        if (!materiaId) continue;
        totalAulasPorMateria.set(materiaId, (totalAulasPorMateria.get(materiaId) ?? 0) + 1);
      }

      const aulaIds = aulasPublicadas.map((a) => a.id);
      const aulaMateriaMap = new Map(
        aulasPublicadas.map((a) => [a.id, capMateriaMap.get(a.capituloId)])
      );

      if (aulaIds.length > 0) {
        const progresso = await db
          .select({ aulaId: progressoAula.aulaId })
          .from(progressoAula)
          .where(
            and(
              eq(progressoAula.alunoId, alunoId),
              inArray(progressoAula.aulaId, aulaIds),
              eq(progressoAula.concluida, true)
            )
          );

        for (const p of progresso) {
          const materiaId = aulaMateriaMap.get(p.aulaId);
          if (!materiaId) continue;
          concluidasPorMateria.set(materiaId, (concluidasPorMateria.get(materiaId) ?? 0) + 1);
        }
      }
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-title-md font-semibold text-on-surface">
        Bem-vindo{session?.user?.name ? `, ${session.user.name}` : ""}
      </h2>

      {matriculasValidas.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="Nenhuma matéria liberada ainda"
          description="Assim que uma matéria for liberada para você, ela aparece aqui."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {matriculasValidas.map(({ materia }) => {
            const total = totalAulasPorMateria.get(materia.id) ?? 0;
            const concluidas = concluidasPorMateria.get(materia.id) ?? 0;
            return (
              <Link
                key={materia.id}
                href={`/aluno/materias/${materia.id}`}
                className="block space-y-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-5 hover:border-primary"
              >
                <h3 className="font-display text-title-md font-bold text-primary">{materia.titulo}</h3>
                {materia.descricao && <p className="text-body-sm text-outline">{materia.descricao}</p>}
                <ProgressBar value={concluidas} total={total} label="Progresso" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
