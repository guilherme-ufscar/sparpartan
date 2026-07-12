import { db } from "@/db";
import { auditLog } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function registrarAuditoria(
  acao: "criar" | "atualizar" | "excluir" | "login",
  entidade: string,
  entidadeId: string,
  detalhes?: string
) {
  const session = await auth();
  const usuario = session?.user;
  const tipoSessao = (usuario as { tipo?: string })?.tipo;

  await db.insert(auditLog).values({
    usuarioId: tipoSessao === "equipe" ? (usuario?.id as string) : null,
    usuarioNome: usuario?.name ?? "desconhecido",
    acao,
    entidade,
    entidadeId,
    detalhes,
  });
}
