import { desc } from "drizzle-orm";
import { Wrench } from "lucide-react";
import { db } from "@/db";
import { servicos } from "@/db/schema";
import { LinkButton, EmptyState, DataTable, type Column } from "@/components/ui";

function formatMoney(v: string | null) {
  if (!v) return "—";
  return Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

type LinhaServico = typeof servicos.$inferSelect;

export default async function ServicosPage() {
  const lista = await db.select().from(servicos).orderBy(desc(servicos.criadoEm));

  const columns: Column<LinhaServico>[] = [
    { header: "Nome", cell: (s) => <span className="font-medium text-primary">{s.nome}</span> },
    { header: "Categoria", cell: (s) => <span className="capitalize">{s.categoria}</span> },
    { header: "Norma", cell: (s) => s.norma ?? "—" },
    { header: "Valor", cell: (s) => formatMoney(s.valor) },
    { header: "Custo", cell: (s) => formatMoney(s.custo) },
    {
      header: "Margem",
      cell: (s) => {
        const margem = s.valor && s.custo ? Number(s.valor) - Number(s.custo) : null;
        if (margem === null) return "—";
        return (
          <span className={margem < 0 ? "text-danger" : "text-success"}>
            {margem.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-gutter">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-headline-lg font-bold text-primary">Serviços</h1>
        <div className="flex gap-3">
          <LinkButton href="/servicos/catalogo" variant="outlined" size="sm">
            Catálogo
          </LinkButton>
          <LinkButton href="/servicos/novo">+ Novo Serviço</LinkButton>
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={lista}
        rowKey={(s) => s.id}
        rowHref={(s) => `/servicos/${s.id}`}
        empty={
          <EmptyState
            icon={Wrench}
            title="Nenhum serviço cadastrado ainda"
            action={{ label: "+ Novo Serviço", href: "/servicos/novo" }}
          />
        }
      />
    </div>
  );
}
