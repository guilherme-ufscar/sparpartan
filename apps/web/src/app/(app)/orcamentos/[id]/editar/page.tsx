import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orcamentos, clientes, servicos } from "@/db/schema";
import { BackButton } from "@/components/ui";
import { NovoOrcamentoForm } from "../../novo/form";
import { atualizarOrcamento } from "../../actions";

export default async function EditarOrcamentoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [orcamento] = await db.select().from(orcamentos).where(eq(orcamentos.id, id)).limit(1);
  if (!orcamento) notFound();
  if (orcamento.status !== "pendente") notFound();

  const listaClientes = await db
    .select({ id: clientes.id, nome: clientes.nome })
    .from(clientes)
    .orderBy(clientes.nome);
  const listaServicos = await db
    .select({ id: servicos.id, nome: servicos.nome, valor: servicos.valor })
    .from(servicos)
    .orderBy(servicos.nome);

  return (
    <div className="space-y-gutter">
      <BackButton href={`/orcamentos/${id}`} />
      <h1 className="font-display text-headline-lg font-bold text-primary">
        Editar Orçamento {orcamento.numero}
      </h1>
      <NovoOrcamentoForm
        listaClientes={listaClientes}
        listaServicos={listaServicos}
        orcamentoInicial={orcamento}
        action={atualizarOrcamento.bind(null, id)}
        submitLabel="Salvar Alterações"
      />
    </div>
  );
}
