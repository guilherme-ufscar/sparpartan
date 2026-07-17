import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { obras, clientes, engenheiros } from "@/db/schema";
import { BackButton } from "@/components/ui";
import { NovaObraForm } from "../../novo/form";
import { atualizarObra } from "../../actions";

export default async function EditarObraPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [obra] = await db.select().from(obras).where(eq(obras.id, id)).limit(1);
  if (!obra) notFound();

  const listaClientes = await db
    .select({ id: clientes.id, nome: clientes.nome })
    .from(clientes)
    .orderBy(clientes.nome);

  const listaEngenheiros = await db
    .select()
    .from(engenheiros)
    .where(eq(engenheiros.ativo, true))
    .orderBy(engenheiros.nomeCompleto);

  return (
    <div className="space-y-gutter">
      <BackButton href={`/obras/${id}`} />
      <h1 className="font-display text-headline-lg font-bold text-primary">
        Editar Obra — {obra.titulo || obra.idObra || "Sem título"}
      </h1>
      <NovaObraForm
        listaClientes={listaClientes}
        listaEngenheiros={listaEngenheiros}
        obraInicial={obra}
        action={atualizarObra.bind(null, id)}
        submitLabel="Salvar Alterações"
      />
    </div>
  );
}
