import { notFound } from "next/navigation";
import Link from "next/link";
import { eq, inArray } from "drizzle-orm";
import { FileText, Mail, CircleDollarSign, CalendarClock, Ship, Download } from "lucide-react";
import { db } from "@/db";
import {
  clientes,
  embarcacoes,
  habilitacoes,
  arquivos,
  documentosGerados,
  enviosEmail,
  pagamentos,
  servicosContratados,
  agendaEventos,
  modelosDocumento,
} from "@/db/schema";
import { Campo, CampoSelect, SectionCard } from "@/components/ui/form-field";
import { Badge, StatusBadge, Button, LinkButton, EmptyState } from "@/components/ui";
import { urgenciaVencimento, infoUrgencia } from "@/lib/status";
import {
  adicionarHabilitacao,
  enviarArquivo,
  definirSenhaPortal,
  gerarLinkCadastro,
  gerarLinkEmbarcacao,
} from "./actions";

type EventoTimeline = {
  data: Date;
  label: string;
  tipo: "documento" | "email" | "pagamento" | "evento";
};

const TIMELINE_ICON = {
  documento: FileText,
  email: Mail,
  pagamento: CircleDollarSign,
  evento: CalendarClock,
} as const;

export default async function ClienteDetalhesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ link?: string }>;
}) {
  const { id } = await params;
  const { link } = await searchParams;

  const [cliente] = await db.select().from(clientes).where(eq(clientes.id, id)).limit(1);
  if (!cliente) notFound();

  const gerarLinkCadastroComId = gerarLinkCadastro.bind(null, id);
  const gerarLinkEmbarcacaoComId = gerarLinkEmbarcacao.bind(null, id);

  const embarcacoesDoCliente = await db
    .select()
    .from(embarcacoes)
    .where(eq(embarcacoes.clienteId, id));

  const habilitacoesDoCliente = await db
    .select()
    .from(habilitacoes)
    .where(eq(habilitacoes.clienteId, id));

  const arquivosDoCliente = await db
    .select()
    .from(arquivos)
    .where(eq(arquivos.clienteId, id));

  const adicionarHabilitacaoComId = adicionarHabilitacao.bind(null, id);
  const enviarArquivoComId = enviarArquivo.bind(null, id);
  const definirSenhaPortalComId = definirSenhaPortal.bind(null, id);

  const documentosDoCliente = await db
    .select({
      id: documentosGerados.id,
      criadoEm: documentosGerados.criadoEm,
      modeloNome: modelosDocumento.nome,
    })
    .from(documentosGerados)
    .innerJoin(modelosDocumento, eq(documentosGerados.modeloId, modelosDocumento.id))
    .where(eq(documentosGerados.clienteId, id));

  const emailsDoCliente = await db
    .select()
    .from(enviosEmail)
    .where(eq(enviosEmail.clienteId, id));

  const vendasDoCliente = await db
    .select({ id: servicosContratados.id })
    .from(servicosContratados)
    .where(eq(servicosContratados.clienteId, id));

  const pagamentosDoCliente =
    vendasDoCliente.length > 0
      ? await db
          .select()
          .from(pagamentos)
          .where(
            inArray(
              pagamentos.servicoContratadoId,
              vendasDoCliente.map((v) => v.id)
            )
          )
      : [];

  const eventosDoCliente = await db
    .select()
    .from(agendaEventos)
    .where(eq(agendaEventos.clienteId, id));

  const timeline: EventoTimeline[] = [
    ...documentosDoCliente.map((d) => ({
      data: d.criadoEm,
      label: `Documento gerado: ${d.modeloNome}`,
      tipo: "documento" as const,
    })),
    ...emailsDoCliente.map((e) => ({
      data: e.criadoEm,
      label: `E-mail enviado: ${e.assunto}`,
      tipo: "email" as const,
    })),
    ...pagamentosDoCliente.map((p) => ({
      data: p.criadoEm,
      label: `Pagamento registrado: R$ ${Number(p.valor).toLocaleString("pt-BR")}`,
      tipo: "pagamento" as const,
    })),
    ...eventosDoCliente.map((ev) => ({
      data: ev.dataHora,
      label: `Evento: ${ev.titulo}`,
      tipo: "evento" as const,
    })),
  ].sort((a, b) => b.data.getTime() - a.data.getTime());

  return (
    <div className="space-y-gutter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-headline-lg font-bold text-primary">{cliente.nome}</h1>
          <p className="text-body-sm text-outline">{cliente.cpfCnpj}</p>
        </div>
        <LinkButton href={`/api/etiqueta/${cliente.id}`} variant="outlined" icon={Download}>
          Etiqueta de Envio
        </LinkButton>
      </div>

      <SectionCard title="Links de autoatendimento">
        <p className="mb-4 text-body-sm text-outline">
          Gere um link para o cliente preencher os próprios dados ou cadastrar uma embarcação, sem
          precisar de login.
        </p>
        {link && (
          <div className="mb-4 rounded-lg bg-info-container p-3 text-body-sm text-on-info-container">
            Link gerado: <span className="break-all font-mono">{`${process.env.AUTH_URL || "http://localhost:8080"}/c/${link}`}</span>
          </div>
        )}
        <div className="flex flex-wrap gap-3">
          <form action={gerarLinkCadastroComId}>
            <Button type="submit" variant="outlined" size="sm">
              Gerar link de cadastro
            </Button>
          </form>
          <form action={gerarLinkEmbarcacaoComId}>
            <Button type="submit" variant="outlined" size="sm">
              Gerar link para cadastrar embarcação
            </Button>
          </form>
        </div>
      </SectionCard>

      <SectionCard title="Timeline">
        {timeline.length === 0 ? (
          <EmptyState icon={CalendarClock} title="Nenhuma atividade registrada ainda" />
        ) : (
          <ul className="space-y-4">
            {timeline.map((ev, i) => {
              const Icon = TIMELINE_ICON[ev.tipo];
              return (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 rounded-pill bg-surface-container p-1.5 text-outline">
                    <Icon size={14} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-body-md text-primary">{ev.label}</p>
                    <p className="font-mono-caps text-label-sm uppercase text-outline">
                      {new Date(ev.data).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>

      <SectionCard title="Dados de Contato">
        <dl className="grid grid-cols-1 gap-4 text-body-md sm:grid-cols-3">
          <div>
            <dt className="font-mono-caps text-label-sm uppercase text-outline">E-mail</dt>
            <dd className="text-primary">{cliente.email ?? "—"}</dd>
          </div>
          <div>
            <dt className="font-mono-caps text-label-sm uppercase text-outline">Telefone</dt>
            <dd className="text-primary">{cliente.telefone ?? "—"}</dd>
          </div>
          <div>
            <dt className="font-mono-caps text-label-sm uppercase text-outline">Celular</dt>
            <dd className="text-primary">{cliente.celular ?? "—"}</dd>
          </div>
          <div>
            <dt className="font-mono-caps text-label-sm uppercase text-outline">Cidade/UF</dt>
            <dd className="text-primary">
              {cliente.cidade ?? "—"}
              {cliente.uf ? `/${cliente.uf}` : ""}
            </dd>
          </div>
        </dl>
      </SectionCard>

      <SectionCard title="Embarcações">
        {embarcacoesDoCliente.length === 0 ? (
          <EmptyState icon={Ship} title="Nenhuma embarcação vinculada" />
        ) : (
          <ul className="space-y-2">
            {embarcacoesDoCliente.map((e) => (
              <li key={e.id}>
                <Link href={`/embarcacoes/${e.id}`} className="inline-flex items-center gap-2 text-body-md text-primary hover:underline">
                  <Ship size={14} /> {e.nome} {e.numeroInscricao ? `— ${e.numeroInscricao}` : ""}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <SectionCard title="Habilitações">
        {habilitacoesDoCliente.length > 0 && (
          <table className="mb-4 w-full text-left text-body-md">
            <thead>
              <tr className="border-b border-outline-variant font-mono-caps text-label-sm uppercase tracking-wide text-outline">
                <th className="px-2 py-2">Tipo</th>
                <th className="px-2 py-2">Número</th>
                <th className="px-2 py-2">Categoria</th>
                <th className="px-2 py-2">Validade</th>
              </tr>
            </thead>
            <tbody>
              {habilitacoesDoCliente.map((h) => (
                <tr key={h.id} className="border-b border-outline-variant last:border-0">
                  <td className="px-2 py-2">
                    <Badge tone="info" size="sm">{h.tipo}</Badge>
                  </td>
                  <td className="px-2 py-2">{h.numero ?? "—"}</td>
                  <td className="px-2 py-2">{h.categoria ?? "—"}</td>
                  <td className="px-2 py-2">
                    <div className="flex items-center gap-2">
                      {h.validade ?? "—"}
                      {h.validade && <StatusBadge status={infoUrgencia(urgenciaVencimento(h.validade))} size="sm" />}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <form action={adicionarHabilitacaoComId} className="grid grid-cols-1 gap-4 sm:grid-cols-5">
          <CampoSelect
            label="Tipo"
            name="tipo"
            required
            options={[
              { value: "CHA", label: "CHA (Arrais/Motonauta)" },
              { value: "CIR", label: "CIR (Carteira de Trabalho)" },
            ]}
          />
          <Campo label="Número" name="numero" />
          <Campo label="Categoria" name="categoria" />
          <Campo label="Data de Emissão" name="dataEmissao" type="date" />
          <Campo label="Validade" name="validade" type="date" />
          <div className="sm:col-span-5">
            <Button type="submit">Adicionar Habilitação</Button>
          </div>
        </form>
      </SectionCard>

      <SectionCard title="Arquivos">
        {arquivosDoCliente.length > 0 && (
          <ul className="mb-4 space-y-2 text-body-md">
            {arquivosDoCliente.map((a) => (
              <li key={a.id} className="flex items-center justify-between">
                <span>
                  <span className="font-mono-caps text-label-sm uppercase text-outline">
                    {a.tipo}
                  </span>{" "}
                  — {a.nomeOriginal}
                </span>
                <a
                  href={`/api/arquivos/${a.id}`}
                  className="text-body-sm text-primary hover:underline"
                >
                  Baixar
                </a>
              </li>
            ))}
          </ul>
        )}

        <form action={enviarArquivoComId} className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <CampoSelect
            label="Tipo"
            name="tipo"
            required
            options={[
              { value: "RG", label: "RG" },
              { value: "CPF", label: "CPF" },
              { value: "CRLV", label: "CRLV" },
              { value: "outro", label: "Outro" },
            ]}
          />
          <label className="flex flex-col gap-1 sm:col-span-2">
            <span className="font-mono-caps text-label-sm uppercase tracking-wide text-outline">
              Arquivo
            </span>
            <input
              name="arquivo"
              type="file"
              required
              className="rounded-lg border border-outline-variant bg-surface px-3 py-2 text-body-md text-primary outline-none focus:border-primary"
            />
          </label>
          <div className="flex items-end">
            <Button type="submit">Enviar Arquivo</Button>
          </div>
        </form>
      </SectionCard>

      <SectionCard title="Acesso ao Portal do Cliente">
        <p className="mb-4 text-body-sm text-outline">
          {cliente.portalSenhaHash
            ? "Este cliente já tem acesso ao portal. Definir uma nova senha substitui a atual."
            : "Este cliente ainda não tem acesso ao portal."}
        </p>
        <form action={definirSenhaPortalComId} className="flex items-end gap-4">
          <div className="w-64">
            <Campo label="Nova Senha do Portal" name="senha" type="password" required />
          </div>
          <Button type="submit">Definir Senha</Button>
        </form>
      </SectionCard>
    </div>
  );
}
