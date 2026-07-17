import { and, desc, eq, isNull } from "drizzle-orm";
import { HardHat } from "lucide-react";
import { db } from "@/db";
import { obras, clientes } from "@/db/schema";
import { LinkButton, EmptyState, DataTable, type Column } from "@/components/ui";

type LinhaObra = {
  id: string;
  titulo: string | null;
  tipoObra: string | null;
  clienteNome: string;
};

export default async function ObrasPage() {
  const lista = await db
    .select({
      id: obras.id,
      titulo: obras.titulo,
      tipoObra: obras.tipoObra,
      clienteNome: clientes.nome,
    })
    .from(obras)
    .innerJoin(clientes, eq(obras.clienteId, clientes.id))
    .where(and(isNull(obras.excluidoEm), isNull(clientes.excluidoEm)))
    .orderBy(desc(obras.criadoEm));

  const columns: Column<LinhaObra>[] = [
    {
      header: "Título",
      cell: (o) => <span className="font-medium text-primary">{o.titulo ?? "(sem título)"}</span>,
    },
    { header: "Tipo", cell: (o) => o.tipoObra ?? "—" },
    { header: "Proprietário", cell: (o) => o.clienteNome },
  ];

  return (
    <div className="space-y-gutter">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-headline-lg font-bold text-primary">Obras</h1>
        <LinkButton href="/obras/novo">+ Nova Obra</LinkButton>
      </div>
      <p className="text-body-sm text-outline">
        Cadastro técnico para o Memorial Descritivo e o Requerimento 2-B-1 da NORMAM-303
        (preenchimento de obras — trapiches, flutuantes, marinas).
      </p>

      <DataTable
        columns={columns}
        rows={lista}
        rowKey={(o) => o.id}
        rowHref={(o) => `/obras/${o.id}`}
        empty={
          <EmptyState
            icon={HardHat}
            title="Nenhuma obra cadastrada ainda"
            action={{ label: "+ Nova Obra", href: "/obras/novo" }}
          />
        }
      />
    </div>
  );
}
