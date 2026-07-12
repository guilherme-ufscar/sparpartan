import { eq, desc } from "drizzle-orm";
import { FolderClock, FileText, Download } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { processos, servicos, documentosGerados, modelosDocumento } from "@/db/schema";
import { StatusBadge, LinkButton, Button, EmptyState } from "@/components/ui";
import { statusProcesso, urgenciaVencimento, infoUrgencia, rotuloPrazo } from "@/lib/status";
import { pedirRenovacao } from "./actions";

export default async function PortalDashboardPage() {
  const session = await auth();
  const clienteId = session!.user!.id as string;

  const meusProcessos = await db
    .select({
      id: processos.id,
      status: processos.status,
      numeroProtocolo: processos.numeroProtocolo,
      servicoNome: servicos.nome,
    })
    .from(processos)
    .innerJoin(servicos, eq(processos.servicoId, servicos.id))
    .where(eq(processos.clienteId, clienteId))
    .orderBy(desc(processos.criadoEm));

  const meusDocumentos = await db
    .select({
      id: documentosGerados.id,
      modeloNome: modelosDocumento.nome,
      vencimento: documentosGerados.vencimento,
    })
    .from(documentosGerados)
    .innerJoin(modelosDocumento, eq(documentosGerados.modeloId, modelosDocumento.id))
    .where(eq(documentosGerados.clienteId, clienteId));

  return (
    <div className="space-y-gutter">
      <h1 className="font-display text-headline-lg font-bold text-primary">
        Olá, {session!.user!.name}
      </h1>

      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
        <h2 className="mb-4 font-display text-title-lg font-semibold text-primary">Meus Processos</h2>
        {meusProcessos.length === 0 ? (
          <EmptyState icon={FolderClock} title="Nenhum processo em andamento" />
        ) : (
          <ul className="space-y-3">
            {meusProcessos.map((p) => {
              const pedirRenovacaoComId = pedirRenovacao.bind(null, p.id);
              return (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-4 rounded-lg border border-outline-variant px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-body-md font-medium text-primary">{p.servicoNome}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <StatusBadge status={statusProcesso(p.status)} size="sm" />
                      {p.numeroProtocolo && (
                        <span className="text-body-sm text-outline">Protocolo: {p.numeroProtocolo}</span>
                      )}
                    </div>
                  </div>
                  {(p.status === "protocolado" || p.status === "concluido") && (
                    <form action={pedirRenovacaoComId}>
                      <Button type="submit" variant="outlined" size="sm">
                        Pedir Renovação
                      </Button>
                    </form>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
        <h2 className="mb-4 font-display text-title-lg font-semibold text-primary">Meus Documentos</h2>
        {meusDocumentos.length === 0 ? (
          <EmptyState icon={FileText} title="Nenhum documento gerado ainda" />
        ) : (
          <ul className="space-y-2">
            {meusDocumentos.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-4 py-2">
                <div className="min-w-0 flex-1">
                  <p className="text-body-md text-primary">{d.modeloNome}</p>
                  {d.vencimento && (
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-body-sm text-outline">{rotuloPrazo(d.vencimento)}</span>
                      <StatusBadge status={infoUrgencia(urgenciaVencimento(d.vencimento))} size="sm" />
                    </div>
                  )}
                </div>
                <LinkButton href={`/api/documentos/${d.id}`} variant="outlined" size="sm" icon={Download}>
                  2ª via
                </LinkButton>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
