import { asc, eq, gte, and } from "drizzle-orm";
import { ChevronLeft, ChevronRight, CalendarClock } from "lucide-react";
import Link from "next/link";
import { db } from "@/db";
import { agendaEventos, clientes, processos, servicos } from "@/db/schema";
import { CampoSelect } from "@/components/ui/form-field";
import { Badge, LinkButton, Button, EmptyState, CalendarMonth } from "@/components/ui";
import { statusEvento, tipoEvento, fonteCalendario, type FonteCalendarioTipo } from "@/lib/status";
import { gradeDoMes, buscarItensCalendario, FONTES_PADRAO, TODAS_FONTES } from "@/lib/calendario";
import { confirmarEvento, concluirEvento } from "./actions";

const NOMES_MES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function montarUrl(mes: string, fontes: FonteCalendarioTipo[], vista?: string) {
  const params = new URLSearchParams();
  params.set("mes", mes);
  if (fontes.length !== FONTES_PADRAO.length || fontes.some((f) => !FONTES_PADRAO.includes(f))) {
    params.set("fontes", fontes.join(","));
  }
  if (vista) params.set("vista", vista);
  return `?${params.toString()}`;
}

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ clienteId?: string; processoId?: string; mes?: string; fontes?: string; vista?: string }>;
}) {
  const { clienteId, processoId, mes, fontes, vista } = await searchParams;

  if (vista === "lista") {
    return <VistaLista clienteId={clienteId} processoId={processoId} />;
  }

  const agora = new Date();
  const mesRef = mes ? new Date(`${mes}-01T00:00:00`) : new Date(agora.getFullYear(), agora.getMonth(), 1);
  const mesStr = `${mesRef.getFullYear()}-${String(mesRef.getMonth() + 1).padStart(2, "0")}`;

  const fontesAtivas = (fontes ? (fontes.split(",") as FonteCalendarioTipo[]) : FONTES_PADRAO).filter((f) =>
    TODAS_FONTES.includes(f)
  );

  const { inicio, fim, celulas } = gradeDoMes(mesRef);
  const itens = await buscarItensCalendario(inicio, fim, fontesAtivas);

  const mesAnterior = new Date(mesRef.getFullYear(), mesRef.getMonth() - 1, 1);
  const mesSeguinte = new Date(mesRef.getFullYear(), mesRef.getMonth() + 1, 1);
  const mesAnteriorStr = `${mesAnterior.getFullYear()}-${String(mesAnterior.getMonth() + 1).padStart(2, "0")}`;
  const mesSeguinteStr = `${mesSeguinte.getFullYear()}-${String(mesSeguinte.getMonth() + 1).padStart(2, "0")}`;

  return (
    <div className="space-y-gutter">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-headline-lg font-bold text-primary">Agenda</h1>
        <div className="flex gap-3">
          <LinkButton href={montarUrl(mesStr, fontesAtivas, "lista")} variant="outlined" size="sm">
            Ver Lista
          </LinkButton>
          <LinkButton href="/agenda/novo">+ Novo Evento</LinkButton>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-outline-variant bg-surface-container-lowest p-3">
        <Link
          href={montarUrl(mesAnteriorStr, fontesAtivas)}
          className="flex items-center gap-1 rounded-lg border border-outline-variant px-3 py-1.5 text-body-sm hover:bg-surface-container-low"
        >
          <ChevronLeft size={14} /> Anterior
        </Link>
        <span className="font-display text-title-lg font-semibold text-primary">
          {NOMES_MES[mesRef.getMonth()]} {mesRef.getFullYear()}
        </span>
        <Link
          href={montarUrl(mesSeguinteStr, fontesAtivas)}
          className="flex items-center gap-1 rounded-lg border border-outline-variant px-3 py-1.5 text-body-sm hover:bg-surface-container-low"
        >
          Próximo <ChevronRight size={14} />
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {TODAS_FONTES.map((tipo) => {
          const ativa = fontesAtivas.includes(tipo);
          const novasFontes = ativa ? fontesAtivas.filter((f) => f !== tipo) : [...fontesAtivas, tipo];
          const info = fonteCalendario(tipo);
          return (
            <Link key={tipo} href={montarUrl(mesStr, novasFontes)}>
              <Badge tone={ativa ? info.tone : "neutral"} icon={info.icon} size="sm">
                {info.label}
              </Badge>
            </Link>
          );
        })}
      </div>

      <CalendarMonth celulas={celulas} itens={itens} />
    </div>
  );
}

async function VistaLista({ clienteId, processoId }: { clienteId?: string; processoId?: string }) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const condicoes = [gte(agendaEventos.dataHora, hoje)];
  if (clienteId) condicoes.push(eq(agendaEventos.clienteId, clienteId));
  if (processoId) condicoes.push(eq(agendaEventos.processoId, processoId));

  const eventos = await db
    .select({
      id: agendaEventos.id,
      titulo: agendaEventos.titulo,
      dataHora: agendaEventos.dataHora,
      tipo: agendaEventos.tipo,
      status: agendaEventos.status,
      clienteNome: clientes.nome,
      servicoNome: servicos.nome,
    })
    .from(agendaEventos)
    .leftJoin(clientes, eq(agendaEventos.clienteId, clientes.id))
    .leftJoin(processos, eq(agendaEventos.processoId, processos.id))
    .leftJoin(servicos, eq(processos.servicoId, servicos.id))
    .where(and(...condicoes))
    .orderBy(asc(agendaEventos.dataHora));

  const listaClientes = await db
    .select({ id: clientes.id, nome: clientes.nome })
    .from(clientes)
    .orderBy(clientes.nome);

  const listaProcessos = clienteId
    ? await db
        .select({ id: processos.id, servicoNome: servicos.nome })
        .from(processos)
        .innerJoin(servicos, eq(processos.servicoId, servicos.id))
        .where(eq(processos.clienteId, clienteId))
    : [];

  return (
    <div className="space-y-gutter">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-headline-lg font-bold text-primary">Agenda</h1>
        <div className="flex gap-3">
          <LinkButton href="/agenda" variant="outlined" size="sm">
            Ver Calendário
          </LinkButton>
          <LinkButton href="/agenda/novo">+ Novo Evento</LinkButton>
        </div>
      </div>

      <form
        method="get"
        className="grid grid-cols-1 gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 sm:grid-cols-3"
      >
        <input type="hidden" name="vista" value="lista" />
        <CampoSelect
          label="Filtrar por Cliente"
          name="clienteId"
          defaultValue={clienteId ?? ""}
          options={[
            { value: "", label: "Todos" },
            ...listaClientes.map((c) => ({ value: c.id, label: c.nome })),
          ]}
        />
        <CampoSelect
          label="Filtrar por Processo"
          name="processoId"
          defaultValue={processoId ?? ""}
          options={[
            { value: "", label: clienteId ? "Todos deste cliente" : "Selecione um cliente primeiro" },
            ...listaProcessos.map((p) => ({ value: p.id, label: p.servicoNome })),
          ]}
        />
        <div className="flex items-end">
          <Button type="submit" variant="outlined">
            Filtrar
          </Button>
        </div>
      </form>

      <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
        {eventos.length === 0 ? (
          <EmptyState icon={CalendarClock} title="Nenhum evento futuro agendado" />
        ) : (
          <ul className="divide-y divide-outline-variant">
            {eventos.map((evento) => {
              const confirmarComId = confirmarEvento.bind(null, evento.id);
              const concluirComId = concluirEvento.bind(null, evento.id);
              return (
                <li key={evento.id} className="flex items-center justify-between gap-4 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-body-md font-medium text-primary">{evento.titulo}</p>
                      <Badge tone={tipoEvento(evento.tipo).tone} icon={tipoEvento(evento.tipo).icon} size="sm">
                        {tipoEvento(evento.tipo).label}
                      </Badge>
                      <Badge tone={statusEvento(evento.status).tone} icon={statusEvento(evento.status).icon} size="sm">
                        {statusEvento(evento.status).label}
                      </Badge>
                    </div>
                    <p className="text-body-sm text-outline">
                      {new Date(evento.dataHora).toLocaleString("pt-BR")}
                      {evento.clienteNome && ` — ${evento.clienteNome}`}
                      {evento.servicoNome && ` (${evento.servicoNome})`}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {evento.status === "pendente" && (
                      <form action={confirmarComId}>
                        <Button type="submit" variant="outlined" size="sm">
                          Confirmar
                        </Button>
                      </form>
                    )}
                    {evento.status !== "concluido" && (
                      <form action={concluirComId}>
                        <Button type="submit" size="sm">
                          Concluir
                        </Button>
                      </form>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
