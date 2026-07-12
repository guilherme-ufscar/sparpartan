import { notFound } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { embarcacoes, motores, aquisicoes, salvatagemItens, clientes } from "@/db/schema";
import { Campo, SectionCard } from "@/components/ui/form-field";
import { StatusBadge, Button } from "@/components/ui";
import { urgenciaVencimento, infoUrgencia } from "@/lib/status";
import { adicionarItemSalvatagem } from "./actions";

export default async function EmbarcacaoDetalhesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [embarcacao] = await db.select().from(embarcacoes).where(eq(embarcacoes.id, id)).limit(1);
  if (!embarcacao) notFound();

  const [proprietario] = await db
    .select({ id: clientes.id, nome: clientes.nome })
    .from(clientes)
    .where(eq(clientes.id, embarcacao.clienteId))
    .limit(1);

  const motoresDaEmbarcacao = await db
    .select()
    .from(motores)
    .where(eq(motores.embarcacaoId, id))
    .orderBy(motores.ordem);

  const aquisicoesDaEmbarcacao = await db
    .select()
    .from(aquisicoes)
    .where(eq(aquisicoes.embarcacaoId, id));

  const salvatagemDaEmbarcacao = await db
    .select()
    .from(salvatagemItens)
    .where(eq(salvatagemItens.embarcacaoId, id));

  const adicionarItemComId = adicionarItemSalvatagem.bind(null, id);

  return (
    <div className="space-y-gutter">
      <div>
        <h1 className="font-display text-headline-lg font-bold text-primary">{embarcacao.nome}</h1>
        <p className="text-body-sm text-outline">
          Proprietário:{" "}
          <Link href={`/clientes/${proprietario.id}`} className="hover:underline">
            {proprietario.nome}
          </Link>
        </p>
      </div>

      <SectionCard title="Dados Técnicos">
        <dl className="grid grid-cols-2 gap-4 text-body-md sm:grid-cols-4">
          {[
            ["Tipo", embarcacao.tipo],
            ["Inscrição", embarcacao.numeroInscricao],
            ["Comprimento", embarcacao.comprimento],
            ["Boca", embarcacao.boca],
            ["Casco Nº", embarcacao.numeroCasco],
            ["Material Casco", embarcacao.materialCasco],
            ["Ano", embarcacao.ano],
            ["Lotação", embarcacao.lotacao],
          ].map(([label, value]) => (
            <div key={label as string}>
              <dt className="font-mono-caps text-label-sm uppercase text-outline">{label}</dt>
              <dd className="text-primary">{value ?? "—"}</dd>
            </div>
          ))}
          <div>
            <dt className="font-mono-caps text-label-sm uppercase text-outline">Validade DPEM</dt>
            <dd className="flex items-center gap-2 text-primary">
              {embarcacao.validadeDpem ?? "—"}
              {embarcacao.validadeDpem && (
                <StatusBadge status={infoUrgencia(urgenciaVencimento(embarcacao.validadeDpem))} size="sm" />
              )}
            </dd>
          </div>
        </dl>
      </SectionCard>

      {motoresDaEmbarcacao.length > 0 && (
        <SectionCard title="Motores">
          <table className="w-full text-left text-body-md">
            <thead>
              <tr className="border-b border-outline-variant font-mono-caps text-label-sm uppercase tracking-wide text-outline">
                <th className="px-2 py-2">#</th>
                <th className="px-2 py-2">Marca</th>
                <th className="px-2 py-2">Potência</th>
                <th className="px-2 py-2">Nº Série</th>
              </tr>
            </thead>
            <tbody>
              {motoresDaEmbarcacao.map((m) => (
                <tr key={m.id} className="border-b border-outline-variant last:border-0">
                  <td className="px-2 py-2">{m.ordem}</td>
                  <td className="px-2 py-2">{m.marca ?? "—"}</td>
                  <td className="px-2 py-2">{m.potencia ?? "—"}</td>
                  <td className="px-2 py-2">{m.numeroSerie ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>
      )}

      {aquisicoesDaEmbarcacao.length > 0 && (
        <SectionCard title="Aquisição">
          {aquisicoesDaEmbarcacao.map((a) => (
            <dl key={a.id} className="grid grid-cols-2 gap-4 text-body-md sm:grid-cols-4">
              <div>
                <dt className="font-mono-caps text-label-sm uppercase text-outline">NF</dt>
                <dd className="text-primary">{a.numeroNf ?? "—"}</dd>
              </div>
              <div>
                <dt className="font-mono-caps text-label-sm uppercase text-outline">Data</dt>
                <dd className="text-primary">{a.dataVenda ?? "—"}</dd>
              </div>
              <div>
                <dt className="font-mono-caps text-label-sm uppercase text-outline">Vendedor</dt>
                <dd className="text-primary">{a.vendedor ?? "—"}</dd>
              </div>
              <div>
                <dt className="font-mono-caps text-label-sm uppercase text-outline">Valor</dt>
                <dd className="text-primary">{a.valor ?? "—"}</dd>
              </div>
            </dl>
          ))}
        </SectionCard>
      )}

      <SectionCard title="Controle de Salvatagem">
        {salvatagemDaEmbarcacao.length > 0 && (
          <table className="mb-4 w-full text-left text-body-md">
            <thead>
              <tr className="border-b border-outline-variant font-mono-caps text-label-sm uppercase tracking-wide text-outline">
                <th className="px-2 py-2">Item</th>
                <th className="px-2 py-2">Quantidade</th>
                <th className="px-2 py-2">Validade</th>
              </tr>
            </thead>
            <tbody>
              {salvatagemDaEmbarcacao.map((s) => (
                <tr key={s.id} className="border-b border-outline-variant last:border-0">
                  <td className="px-2 py-2">{s.item}</td>
                  <td className="px-2 py-2">{s.quantidade}</td>
                  <td className="px-2 py-2">
                    <div className="flex items-center gap-2">
                      {s.validade ?? "—"}
                      {s.validade && (
                        <StatusBadge status={infoUrgencia(urgenciaVencimento(s.validade))} size="sm" />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <form action={adicionarItemComId} className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <Campo label="Item" name="item" required />
          <Campo label="Quantidade" name="quantidade" type="number" defaultValue={1} />
          <Campo label="Validade" name="validade" type="date" />
          <div className="flex items-end">
            <Button type="submit">Adicionar Item</Button>
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
