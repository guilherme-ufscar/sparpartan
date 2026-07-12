import { desc } from "drizzle-orm";
import { Receipt } from "lucide-react";
import { db } from "@/db";
import { despesas } from "@/db/schema";
import { Badge, EmptyState, DataTable, type Column } from "@/components/ui";
import { NovaDespesaForm } from "./form";

function formatMoney(v: string) {
  return Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

type LinhaDespesa = typeof despesas.$inferSelect;

export default async function DespesasPage() {
  const lista = await db.select().from(despesas).orderBy(desc(despesas.data));

  const columns: Column<LinhaDespesa>[] = [
    { header: "Descrição", cell: (d) => <span className="font-medium text-primary">{d.descricao}</span> },
    {
      header: "Categoria",
      cell: (d) => (
        <Badge tone="neutral" size="sm">
          {d.categoria}
        </Badge>
      ),
    },
    { header: "Data", cell: (d) => d.data },
    { header: "Valor", cell: (d) => formatMoney(d.valor) },
  ];

  return (
    <div className="space-y-gutter">
      <h1 className="font-display text-headline-lg font-bold text-primary">Despesas</h1>

      <NovaDespesaForm />

      <DataTable
        columns={columns}
        rows={lista}
        rowKey={(d) => d.id}
        empty={<EmptyState icon={Receipt} title="Nenhuma despesa registrada ainda" />}
      />
    </div>
  );
}
