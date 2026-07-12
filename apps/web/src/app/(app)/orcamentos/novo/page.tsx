import { db } from "@/db";
import { clientes, servicos } from "@/db/schema";
import { NovoOrcamentoForm } from "./form";

export default async function NovoOrcamentoPage() {
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
      <h1 className="font-display text-headline-lg font-bold text-primary">Novo Orçamento</h1>
      <NovoOrcamentoForm listaClientes={listaClientes} listaServicos={listaServicos} />
    </div>
  );
}
