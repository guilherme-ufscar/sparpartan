import { db } from "@/db";
import { clientes } from "@/db/schema";
import { NovaObraForm } from "./form";

export default async function NovaObraPage() {
  const listaClientes = await db
    .select({ id: clientes.id, nome: clientes.nome })
    .from(clientes)
    .orderBy(clientes.nome);

  return (
    <div className="space-y-gutter">
      <h1 className="font-display text-headline-lg font-bold text-primary">Nova Obra</h1>
      <p className="max-w-2xl text-sm text-outline">
        Preenche o Memorial Descritivo e o Requerimento 2-B-1 (NORMAM-303) automaticamente
        quando você gerar o documento em Documentos → Gerar.
      </p>
      <NovaObraForm listaClientes={listaClientes} />
    </div>
  );
}
