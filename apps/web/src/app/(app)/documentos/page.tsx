import { desc, eq, or, ilike, count } from "drizzle-orm";
import { FileText, FileStack } from "lucide-react";
import { db } from "@/db";
import { modelosDocumento, documentosGerados, clientes } from "@/db/schema";
import {
  StatusBadge,
  Badge,
  LinkButton,
  EmptyState,
  DataTable,
  SearchBox,
  Pagination,
  paginar,
  type Column,
} from "@/components/ui";
import { statusDocumento } from "@/lib/status";

type LinhaModelo = {
  id: string;
  nome: string;
  norma: string | null;
  campos: string[];
  duasVias: boolean;
};

type LinhaGerado = {
  id: string;
  status: string;
  modeloNome: string;
  clienteNome: string;
};

export default async function DocumentosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page } = await searchParams;

  const modelos = await db
    .select()
    .from(modelosDocumento)
    .orderBy(desc(modelosDocumento.criadoEm));

  const filtroGerados = q
    ? or(ilike(clientes.nome, `%${q}%`), ilike(modelosDocumento.nome, `%${q}%`))
    : undefined;

  const [{ total }] = await db
    .select({ total: count() })
    .from(documentosGerados)
    .innerJoin(modelosDocumento, eq(documentosGerados.modeloId, modelosDocumento.id))
    .innerJoin(clientes, eq(documentosGerados.clienteId, clientes.id))
    .where(filtroGerados);

  const { limit, offset, paginaAtual, totalPaginas } = paginar(Number(page) || 1, total);

  const gerados = await db
    .select({
      id: documentosGerados.id,
      criadoEm: documentosGerados.criadoEm,
      status: documentosGerados.status,
      modeloNome: modelosDocumento.nome,
      clienteNome: clientes.nome,
    })
    .from(documentosGerados)
    .innerJoin(modelosDocumento, eq(documentosGerados.modeloId, modelosDocumento.id))
    .innerJoin(clientes, eq(documentosGerados.clienteId, clientes.id))
    .where(filtroGerados)
    .orderBy(desc(documentosGerados.criadoEm))
    .limit(limit)
    .offset(offset);

  const colunasModelos: Column<LinhaModelo>[] = [
    { header: "Nome", cell: (m) => <span className="font-medium text-primary">{m.nome}</span> },
    { header: "Norma", cell: (m) => m.norma ?? "—" },
    { header: "Campos", cell: (m) => m.campos.length },
    {
      header: "2 Vias",
      cell: (m) => (m.duasVias ? <Badge tone="info" size="sm">Sim</Badge> : "Não"),
    },
  ];

  const colunasGerados: Column<LinhaGerado>[] = [
    { header: "Modelo", cell: (g) => <span className="font-medium text-primary">{g.modeloNome}</span> },
    { header: "Cliente", cell: (g) => g.clienteNome },
    { header: "Status", cell: (g) => <StatusBadge status={statusDocumento(g.status)} /> },
  ];

  return (
    <div className="space-y-gutter">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-headline-lg font-bold text-primary">Documentos</h1>
        <div className="flex gap-3">
          <LinkButton href="/documentos/vencimentos" variant="outlined" size="sm">
            Vencimentos
          </LinkButton>
          <LinkButton href="/documentos/modelos/novo" variant="outlined" size="sm">
            + Importar Modelo
          </LinkButton>
          <LinkButton href="/documentos/gerar">+ Gerar Documento</LinkButton>
        </div>
      </div>

      <div>
        <h2 className="mb-3 font-display text-title-lg font-semibold text-primary">
          Modelos Cadastrados
        </h2>
        <DataTable
          columns={colunasModelos}
          rows={modelos}
          rowKey={(m) => m.id}
          empty={
            <EmptyState
              icon={FileStack}
              title="Nenhum modelo importado ainda"
              action={{ label: "+ Importar Modelo", href: "/documentos/modelos/novo" }}
            />
          }
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-title-lg font-semibold text-primary">
            Documentos Gerados
          </h2>
          <SearchBox placeholder="Buscar por cliente ou modelo..." valorAtual={q} />
        </div>
        <DataTable
          columns={colunasGerados}
          rows={gerados}
          rowKey={(g) => g.id}
          rowHref={(g) => `/documentos/${g.id}`}
          empty={<EmptyState icon={FileText} title={q ? "Nenhum documento encontrado" : "Nenhum documento gerado ainda"} />}
        />
        <Pagination paginaAtual={paginaAtual} totalPaginas={totalPaginas} totalRegistros={total} baseParams={{ q }} />
      </div>
    </div>
  );
}
