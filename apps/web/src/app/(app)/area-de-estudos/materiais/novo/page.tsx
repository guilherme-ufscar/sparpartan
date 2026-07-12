import { db } from "@/db";
import { servicos } from "@/db/schema";
import { NovoMaterialForm } from "./form";

export default async function NovoMaterialPage() {
  const listaServicos = await db
    .select({ id: servicos.id, nome: servicos.nome })
    .from(servicos)
    .orderBy(servicos.nome);

  return (
    <div className="space-y-gutter">
      <h1 className="font-display text-headline-lg font-bold text-primary">Novo Material</h1>
      <NovoMaterialForm listaServicos={listaServicos} />
    </div>
  );
}
