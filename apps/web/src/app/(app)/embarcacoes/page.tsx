import { desc, eq, or, ilike, count } from "drizzle-orm";
import { Ship } from "lucide-react";
import { db } from "@/db";
import { embarcacoes, clientes } from "@/db/schema";
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
import { urgenciaVencimento, infoUrgencia } from "@/lib/status";

type LinhaEmbarcacao = {
  id: string;
  nome: string;
  tipo: string | null;
  numeroInscricao: string | null;
  clienteNome: string;
  validadeDpem: string | null;
};

export default async function EmbarcacoesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page } = await searchParams;

  const filtro = q
    ? or(ilike(embarcacoes.nome, `%${q}%`), ilike(clientes.nome, `%${q}%`), ilike(embarcacoes.numeroInscricao, `%${q}%`))
    : undefined;

  const [{ total }] = await db
    .select({ total: count() })
    .from(embarcacoes)
    .innerJoin(clientes, eq(embarcacoes.clienteId, clientes.id))
    .where(filtro);

  const { limit, offset, paginaAtual, totalPaginas } = paginar(Number(page) || 1, total);

  const lista = await db
    .select({
      id: embarcacoes.id,
      nome: embarcacoes.nome,
      tipo: embarcacoes.tipo,
      numeroInscricao: embarcacoes.numeroInscricao,
      clienteNome: clientes.nome,
      validadeDpem: embarcacoes.validadeDpem,
    })
    .from(embarcacoes)
    .innerJoin(clientes, eq(embarcacoes.clienteId, clientes.id))
    .where(filtro)
    .orderBy(desc(embarcacoes.criadoEm))
    .limit(limit)
    .offset(offset);

  const columns: Column<LinhaEmbarcacao>[] = [
    { header: "Nome", cell: (e) => <span className="font-medium text-primary">{e.nome}</span> },
    { header: "Proprietário", cell: (e) => e.clienteNome },
    { header: "Tipo", cell: (e) => e.tipo ?? "—" },
    { header: "Inscrição", cell: (e) => e.numeroInscricao ?? "—" },
    {
      header: "DPEM",
      cell: (e) =>
        e.validadeDpem ? (
          <StatusBadge status={infoUrgencia(urgenciaVencimento(e.validadeDpem))} size="sm" />
        ) : (
          "—"
        ),
    },
  ];

  return (
    <div className="space-y-gutter">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-headline-lg font-bold text-primary">Embarcações</h1>
        <LinkButton href="/embarcacoes/novo">+ Nova Embarcação</LinkButton>
      </div>

      <SearchBox placeholder="Buscar por nome, proprietário ou inscrição..." valorAtual={q} />

      <DataTable
        columns={columns}
        rows={lista}
        rowKey={(e) => e.id}
        rowHref={(e) => `/embarcacoes/${e.id}`}
        empty={
          <EmptyState
            icon={Ship}
            title={q ? "Nenhuma embarcação encontrada" : "Nenhuma embarcação cadastrada ainda"}
            action={q ? undefined : { label: "+ Nova Embarcação", href: "/embarcacoes/novo" }}
          />
        }
      />

      <Pagination paginaAtual={paginaAtual} totalPaginas={totalPaginas} totalRegistros={total} baseParams={{ q }} />
    </div>
  );
}
