import { desc, eq, or, ilike, count } from "drizzle-orm";
import { FolderClock } from "lucide-react";
import { db } from "@/db";
import { processos, clientes, servicos } from "@/db/schema";
import {
  StatusBadge,
  LinkButton,
  EmptyState,
  DataTable,
  SearchBox,
  Pagination,
  paginar,
  type Column,
} from "@/components/ui";
import { statusProcesso } from "@/lib/status";

type LinhaProcesso = {
  id: string;
  status: string;
  numeroProtocolo: string | null;
  clienteNome: string;
  servicoNome: string;
};

export default async function ProcessosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page } = await searchParams;

  const filtro = q
    ? or(ilike(clientes.nome, `%${q}%`), ilike(servicos.nome, `%${q}%`), ilike(processos.numeroProtocolo, `%${q}%`))
    : undefined;

  const [{ total }] = await db
    .select({ total: count() })
    .from(processos)
    .innerJoin(clientes, eq(processos.clienteId, clientes.id))
    .innerJoin(servicos, eq(processos.servicoId, servicos.id))
    .where(filtro);

  const { limit, offset, paginaAtual, totalPaginas } = paginar(Number(page) || 1, total);

  const lista = await db
    .select({
      id: processos.id,
      status: processos.status,
      numeroProtocolo: processos.numeroProtocolo,
      criadoEm: processos.criadoEm,
      clienteNome: clientes.nome,
      servicoNome: servicos.nome,
    })
    .from(processos)
    .innerJoin(clientes, eq(processos.clienteId, clientes.id))
    .innerJoin(servicos, eq(processos.servicoId, servicos.id))
    .where(filtro)
    .orderBy(desc(processos.criadoEm))
    .limit(limit)
    .offset(offset);

  const columns: Column<LinhaProcesso>[] = [
    { header: "Cliente", cell: (p) => <span className="font-medium text-primary">{p.clienteNome}</span> },
    { header: "Serviço", cell: (p) => p.servicoNome },
    { header: "Status", cell: (p) => <StatusBadge status={statusProcesso(p.status)} /> },
    { header: "Protocolo", cell: (p) => p.numeroProtocolo ?? "—" },
  ];

  return (
    <div className="space-y-gutter">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-headline-lg font-bold text-primary">Processos</h1>
        <LinkButton href="/processos/novo">+ Novo Atendimento</LinkButton>
      </div>

      <SearchBox placeholder="Buscar por cliente, serviço ou protocolo..." valorAtual={q} />

      <DataTable
        columns={columns}
        rows={lista}
        rowKey={(p) => p.id}
        rowHref={(p) => `/processos/${p.id}`}
        empty={
          <EmptyState
            icon={FolderClock}
            title={q ? "Nenhum processo encontrado" : "Nenhum processo aberto ainda"}
            action={q ? undefined : { label: "+ Novo Atendimento", href: "/processos/novo" }}
          />
        }
      />

      <Pagination paginaAtual={paginaAtual} totalPaginas={totalPaginas} totalRegistros={total} baseParams={{ q }} />
    </div>
  );
}
