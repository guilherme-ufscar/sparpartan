import { and, desc, eq, ne } from "drizzle-orm";
import { BellRing, Bot, UserRound, User } from "lucide-react";
import { db } from "@/db";
import { lembretes, clientes } from "@/db/schema";
import { Badge, Button, ConfirmButton, EmptyState, LinkButton } from "@/components/ui";
import { urgenciaVencimento, infoUrgencia, rotuloPrazo } from "@/lib/status";
import { resolverLembrete, resolverTodosLembretes } from "./actions";

const ORIGEM_INFO = {
  auto: { label: "automático", icon: Bot },
  cliente_solicitacao: { label: "pedido do cliente", icon: UserRound },
  manual: { label: "manual", icon: User },
} as const;

export default async function LembretesPage() {
  const lista = await db
    .select({
      id: lembretes.id,
      mensagem: lembretes.mensagem,
      dataLembrete: lembretes.dataLembrete,
      resolvido: lembretes.resolvido,
      origem: lembretes.origem,
      clienteNome: clientes.nome,
    })
    .from(lembretes)
    .leftJoin(clientes, eq(lembretes.clienteId, clientes.id))
    .where(and(eq(lembretes.resolvido, false), ne(lembretes.origem, "manual")))
    .orderBy(desc(lembretes.dataLembrete));

  return (
    <div className="space-y-gutter">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-headline-lg font-bold text-primary">Lembretes</h1>
          <p className="text-body-sm text-outline">
            Gerados automaticamente pelo sistema — vencimentos de documento em 30/15/7 dias e
            confirmação de compromissos/provas do dia seguinte. Resolvidos sozinhos quando a
            causa deixa de existir (documento renovado, evento confirmado). Para criar um
            lembrete manual (ou ver os que a equipe já cadastrou), use a página{" "}
            <strong>Pendentes</strong>.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <LinkButton href="/pendentes" variant="outlined" size="sm">
            Ir para Pendentes
          </LinkButton>
        </div>
        {lista.length > 0 && (
          <form action={resolverTodosLembretes}>
            <ConfirmButton
              mensagem={`Marcar todos os ${lista.length} lembrete(s) como resolvidos?`}
              variant="outlined"
            >
              Resolver todos
            </ConfirmButton>
          </form>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
        {lista.length === 0 ? (
          <EmptyState icon={BellRing} title="Nenhum lembrete pendente" />
        ) : (
          <ul className="divide-y divide-outline-variant">
            {lista.map((lembrete) => {
              const resolverComId = resolverLembrete.bind(null, lembrete.id);
              const origem = ORIGEM_INFO[lembrete.origem as keyof typeof ORIGEM_INFO] ?? ORIGEM_INFO.manual;
              const urgencia = urgenciaVencimento(lembrete.dataLembrete);
              return (
                <li key={lembrete.id} className="flex items-center justify-between gap-4 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-body-md text-primary">{lembrete.mensagem}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-body-sm text-outline">
                      <span>{lembrete.clienteNome ?? "—"}</span>
                      <span>· {rotuloPrazo(lembrete.dataLembrete)}</span>
                      <Badge tone="neutral" icon={origem.icon} size="sm">
                        {origem.label}
                      </Badge>
                      {(urgencia === "vencido" || urgencia === "critico") && (
                        <Badge tone={infoUrgencia(urgencia).tone} icon={infoUrgencia(urgencia).icon} size="sm">
                          {infoUrgencia(urgencia).label}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <form action={resolverComId}>
                    <Button type="submit" variant="outlined" size="sm">
                      Marcar como Resolvido
                    </Button>
                  </form>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
