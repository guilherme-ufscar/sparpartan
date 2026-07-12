import { asc, eq, notInArray } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Trash2, BookOpen } from "lucide-react";
import { db } from "@/db";
import { alunos, matriculas, materias } from "@/db/schema";
import { Badge, SectionCard, ConfirmButton, EmptyState } from "@/components/ui";
import { atualizarAluno, concederAcesso, revogarAcesso } from "../actions";
import { AlunoEditForm } from "./aluno-edit-form";
import { ConcederAcessoForm } from "./conceder-acesso-form";

const STATUS_LABEL: Record<string, { label: string; tone: "success" | "warning" | "neutral" }> = {
  ativo: { label: "Ativo", tone: "success" },
  expirado: { label: "Expirado", tone: "warning" },
  revogado: { label: "Revogado", tone: "neutral" },
};

const ORIGEM_LABEL: Record<string, string> = {
  manual: "Manual",
  mercadopago: "Mercado Pago",
};

export default async function AlunoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [aluno] = await db.select().from(alunos).where(eq(alunos.id, id)).limit(1);
  if (!aluno) notFound();

  const listaMatriculas = await db
    .select({
      id: matriculas.id,
      status: matriculas.status,
      origem: matriculas.origem,
      liberadoEm: matriculas.liberadoEm,
      expiraEm: matriculas.expiraEm,
      materiaTitulo: materias.titulo,
      materiaId: materias.id,
    })
    .from(matriculas)
    .innerJoin(materias, eq(matriculas.materiaId, materias.id))
    .where(eq(matriculas.alunoId, id))
    .orderBy(asc(materias.titulo));

  const idsMatriculadosAtivos = listaMatriculas.filter((m) => m.status === "ativo").map((m) => m.materiaId);

  const materiasDisponiveis = await db
    .select({ id: materias.id, titulo: materias.titulo })
    .from(materias)
    .where(idsMatriculadosAtivos.length > 0 ? notInArray(materias.id, idsMatriculadosAtivos) : undefined)
    .orderBy(asc(materias.titulo));

  const atualizarComId = atualizarAluno.bind(null, id);
  const concederComId = concederAcesso.bind(null, id);

  return (
    <div className="space-y-gutter">
      <h1 className="font-display text-headline-lg font-bold text-primary">{aluno.nome}</h1>

      <SectionCard title="Dados do aluno">
        <div className="mb-4 text-body-sm text-outline">
          <p>E-mail: <span className="text-primary">{aluno.email}</span></p>
        </div>
        <AlunoEditForm action={atualizarComId} telefone={aluno.telefone ?? ""} ativo={aluno.ativo} />
      </SectionCard>

      <SectionCard title="Matrículas">
        <div className="space-y-4">
          {listaMatriculas.length === 0 ? (
            <EmptyState icon={BookOpen} title="Nenhuma matrícula ainda" description="Conceda acesso a uma matéria abaixo." />
          ) : (
            <ul className="divide-y divide-outline-variant rounded-lg border border-outline-variant">
              {listaMatriculas.map((m) => {
                const statusInfo = STATUS_LABEL[m.status] ?? { label: m.status, tone: "neutral" as const };
                const revogarComId = revogarAcesso.bind(null, id, m.id);
                return (
                  <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <span className="font-medium text-primary">{m.materiaTitulo}</span>
                      <p className="text-body-sm text-outline">
                        Liberado em {new Date(m.liberadoEm).toLocaleDateString("pt-BR")} ·{" "}
                        {m.expiraEm ? `Expira em ${new Date(m.expiraEm).toLocaleDateString("pt-BR")}` : "Sem limite"}
                      </p>
                    </div>
                    <Badge tone={statusInfo.tone} size="sm">{statusInfo.label}</Badge>
                    <Badge tone="neutral" size="sm">{ORIGEM_LABEL[m.origem] ?? m.origem}</Badge>
                    {m.status === "ativo" && (
                      <form action={revogarComId}>
                        <ConfirmButton
                          mensagem={`Revogar acesso de ${aluno.nome} à matéria "${m.materiaTitulo}"?`}
                          variant="text"
                          icon={<Trash2 size={12} />}
                        >
                          Revogar
                        </ConfirmButton>
                      </form>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          <div className="border-t border-outline-variant pt-4">
            <h3 className="mb-3 font-display text-body-md font-semibold text-primary">Conceder Acesso</h3>
            <ConcederAcessoForm action={concederComId} materiasDisponiveis={materiasDisponiveis} />
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
