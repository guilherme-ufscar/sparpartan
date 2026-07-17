import { desc } from "drizzle-orm";
import { BookMarked, Download } from "lucide-react";
import { db } from "@/db";
import { arquivosEmpresa } from "@/db/schema";
import { SectionCard } from "@/components/ui/form-field";
import { EmptyState } from "@/components/ui";
import { NovoArquivoEmpresaForm } from "./form";

const CATEGORIA_LABEL: Record<string, string> = {
  seguro: "Seguro",
  embarcacao: "Dados de Embarcação",
  memorial: "Memorial/Fluxograma",
  empresa: "Dados da Empresa",
};

export default async function DocumentosSparapanPage() {
  const lista = await db.select().from(arquivosEmpresa).orderBy(desc(arquivosEmpresa.criadoEm));

  const porCategoria = new Map<string, typeof lista>();
  for (const item of lista) {
    const grupo = porCategoria.get(item.categoria) ?? [];
    grupo.push(item);
    porCategoria.set(item.categoria, grupo);
  }

  return (
    <div className="space-y-gutter">
      <h1 className="font-display text-headline-lg font-bold text-primary">Documentos Sparapan</h1>
      <p className="max-w-2xl text-body-sm text-outline">
        Repositório institucional: dados de embarcações, seguros, dados da empresa e memoriais/
        fluxogramas de como funciona cada processo, passo a passo — para consulta rápida da equipe.
      </p>

      <NovoArquivoEmpresaForm />

      {lista.length === 0 ? (
        <EmptyState icon={BookMarked} title="Nenhum documento cadastrado ainda" />
      ) : (
        [...porCategoria.entries()].map(([categoria, itens]) => (
          <SectionCard key={categoria} title={CATEGORIA_LABEL[categoria] ?? categoria}>
            <ul className="space-y-2">
              {itens.map((item) => (
                <li key={item.id} className="flex items-center justify-between rounded-lg border border-outline-variant px-4 py-3">
                  <div>
                    <p className="text-body-md text-primary">{item.titulo}</p>
                    {item.descricao && <p className="text-body-sm text-outline">{item.descricao}</p>}
                  </div>
                  <a
                    href={`/api/documentos-sparapan/${item.id}`}
                    className="inline-flex items-center gap-1 text-body-sm text-primary hover:underline"
                  >
                    <Download size={12} /> Baixar
                  </a>
                </li>
              ))}
            </ul>
          </SectionCard>
        ))
      )}
    </div>
  );
}
