import { sql, eq } from "drizzle-orm";
import { TrendingUp, TrendingDown, Wallet, Clock } from "lucide-react";
import { db } from "@/db";
import { servicosContratados, pagamentos, despesas, servicos, processos, usuarios } from "@/db/schema";
import { StatCard, LinkButton, BarChart, DataTable, type Column } from "@/components/ui";

function formatMoney(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

type LinhaMargem = {
  servicoNome: string;
  qtdVendida: number;
  receitaTotal: number;
  margemUnitaria: number | null;
};

export default async function FinanceiroPage() {
  const [{ totalEntradas }] = await db
    .select({ totalEntradas: sql<number>`coalesce(sum(${pagamentos.valor}), 0)::float` })
    .from(pagamentos)
    .where(eq(pagamentos.status, "pago"));

  const [{ totalSaidas }] = await db
    .select({ totalSaidas: sql<number>`coalesce(sum(${despesas.valor}), 0)::float` })
    .from(despesas);

  const lucro = totalEntradas - totalSaidas;

  const margemPorServico = await db
    .select({
      servicoNome: servicos.nome,
      valorServico: servicos.valor,
      custoServico: servicos.custo,
      qtdVendida: sql<number>`count(${servicosContratados.id})::int`,
      receitaTotal: sql<number>`coalesce(sum(${servicosContratados.valor}), 0)::float`,
    })
    .from(servicos)
    .leftJoin(servicosContratados, eq(servicosContratados.servicoId, servicos.id))
    .groupBy(servicos.id, servicos.nome, servicos.valor, servicos.custo)
    .orderBy(sql`count(${servicosContratados.id}) desc`);

  const linhasMargem: LinhaMargem[] = margemPorServico.map((s) => ({
    servicoNome: s.servicoNome,
    qtdVendida: s.qtdVendida,
    receitaTotal: s.receitaTotal,
    margemUnitaria:
      s.valorServico && s.custoServico ? Number(s.valorServico) - Number(s.custoServico) : null,
  }));

  const sazonalidade = await db
    .select({
      mes: sql<string>`to_char(${servicosContratados.dataContratacao}, 'YYYY-MM')`,
      total: sql<number>`count(*)::int`,
    })
    .from(servicosContratados)
    .groupBy(sql`to_char(${servicosContratados.dataContratacao}, 'YYYY-MM')`)
    .orderBy(sql`to_char(${servicosContratados.dataContratacao}, 'YYYY-MM')`);

  // Vendas com orçamento sem vendedor (histórico, antes deste campo existir) caem
  // no bucket "Sem vendedor" — o dado não existe e não há como reconstituí-lo.
  const vendasPorColaborador = await db
    .select({
      vendedorNome: sql<string>`coalesce(${usuarios.nome}, 'Sem vendedor')`,
      receitaTotal: sql<number>`coalesce(sum(${servicosContratados.valor}), 0)::float`,
    })
    .from(servicosContratados)
    .leftJoin(usuarios, eq(servicosContratados.vendedorId, usuarios.id))
    .groupBy(usuarios.nome)
    .orderBy(sql`sum(${servicosContratados.valor}) desc`);

  const [{ tempoMedioDias }] = await db
    .select({
      tempoMedioDias: sql<number | null>`
        avg(extract(epoch from (${processos.atualizadoEm} - ${processos.criadoEm})) / 86400)::float
      `,
    })
    .from(processos)
    .where(sql`${processos.status} in ('protocolado', 'concluido')`);

  const columns: Column<LinhaMargem>[] = [
    { header: "Serviço", cell: (s) => <span className="font-medium text-primary">{s.servicoNome}</span> },
    { header: "Vendidos", cell: (s) => s.qtdVendida },
    { header: "Receita", cell: (s) => formatMoney(s.receitaTotal) },
    {
      header: "Margem/Un.",
      cell: (s) =>
        s.margemUnitaria === null ? (
          "—"
        ) : (
          <span className={s.margemUnitaria < 0 ? "text-danger" : "text-success"}>
            {formatMoney(s.margemUnitaria)}
          </span>
        ),
    },
  ];

  return (
    <div className="space-y-gutter">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-headline-lg font-bold text-primary">Financeiro</h1>
        <div className="flex gap-3">
          <LinkButton href="/vendas/despesas" variant="outlined" size="sm">
            Despesas
          </LinkButton>
          <LinkButton href="/api/exportar/vendas" variant="outlined" size="sm">
            Exportar CSV
          </LinkButton>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-gutter sm:grid-cols-4">
        <StatCard label="Entradas" value={formatMoney(totalEntradas)} icon={TrendingUp} tone="success" />
        <StatCard label="Saídas" value={formatMoney(totalSaidas)} icon={TrendingDown} tone="danger" />
        <StatCard
          label="Lucro"
          value={formatMoney(lucro)}
          icon={Wallet}
          tone={lucro >= 0 ? "success" : "danger"}
        />
        <StatCard
          label="Tempo Médio de Processo"
          value={tempoMedioDias !== null ? `${tempoMedioDias.toFixed(1)}d` : "—"}
          icon={Clock}
          tone="info"
        />
      </div>

      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
        <h2 className="mb-4 font-display text-title-lg font-semibold text-primary">
          Ranking de Serviços (margem real)
        </h2>
        <DataTable
          columns={columns}
          rows={linhasMargem}
          rowKey={(s) => s.servicoNome}
          empty={<p className="p-6 text-body-sm text-outline">Nenhum serviço cadastrado ainda.</p>}
        />
      </div>

      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
        <h2 className="mb-4 font-display text-title-lg font-semibold text-primary">
          Sazonalidade (vendas por mês)
        </h2>
        {sazonalidade.length === 0 ? (
          <p className="p-6 text-body-sm text-outline">Sem dados suficientes ainda.</p>
        ) : (
          <BarChart data={sazonalidade.map((s) => ({ label: s.mes.slice(5), value: s.total }))} />
        )}
      </div>

      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
        <h2 className="mb-4 font-display text-title-lg font-semibold text-primary">
          Vendas por Colaborador
        </h2>
        {vendasPorColaborador.every((v) => v.receitaTotal === 0) ? (
          <p className="p-6 text-body-sm text-outline">Sem vendas registradas ainda.</p>
        ) : (
          <BarChart
            orientation="horizontal"
            data={vendasPorColaborador.map((v) => ({ label: v.vendedorNome, value: v.receitaTotal }))}
            formatValue={formatMoney}
          />
        )}
      </div>
    </div>
  );
}
