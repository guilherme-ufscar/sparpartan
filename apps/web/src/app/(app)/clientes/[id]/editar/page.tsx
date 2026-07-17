import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { clientes } from "@/db/schema";
import { BackButton } from "@/components/ui";
import { EditarClienteForm } from "./form";

export default async function EditarClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [cliente] = await db.select().from(clientes).where(eq(clientes.id, id)).limit(1);
  if (!cliente) notFound();

  return (
    <div className="space-y-gutter">
      <BackButton href={`/clientes/${id}`} />
      <h1 className="font-display text-headline-lg font-bold text-primary">
        Editar Cliente — {cliente.nome}
      </h1>
      <EditarClienteForm cliente={cliente} />
    </div>
  );
}
