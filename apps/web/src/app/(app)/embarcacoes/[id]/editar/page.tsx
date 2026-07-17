import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { embarcacoes, clientes } from "@/db/schema";
import { BackButton } from "@/components/ui/back-button";
import { EditarEmbarcacaoForm } from "./form";

export default async function EditarEmbarcacaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [embarcacao] = await db.select().from(embarcacoes).where(eq(embarcacoes.id, id)).limit(1);
  if (!embarcacao) notFound();

  const listaClientes = await db
    .select({ id: clientes.id, nome: clientes.nome })
    .from(clientes)
    .orderBy(clientes.nome);

  return (
    <div className="space-y-gutter">
      <BackButton href={`/embarcacoes/${id}`} />
      <h1 className="font-display text-headline-lg font-bold text-primary">
        Editar Embarcação — {embarcacao.nome}
      </h1>
      <EditarEmbarcacaoForm embarcacao={embarcacao} listaClientes={listaClientes} />
    </div>
  );
}
