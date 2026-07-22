import Link from "next/link";
import type { ItemCalendario, CelulaMes } from "@/lib/calendario";
import { fonteCalendario, paraData } from "@/lib/status";
import { TONE_SOFT } from "./tone";

const MAX_ITENS_POR_DIA = 3;

function chaveDia(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export function CalendarMonth({
  celulas,
  itens,
}: {
  celulas: CelulaMes[];
  itens: ItemCalendario[];
}) {
  const porDia = new Map<string, ItemCalendario[]>();
  for (const item of itens) {
    const data = item.data instanceof Date ? item.data : paraData(item.data);
    const chave = chaveDia(data);
    if (!porDia.has(chave)) porDia.set(chave, []);
    porDia.get(chave)!.push(item);
  }

  const nomesDiaSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
      <div className="grid grid-cols-7 border-b border-outline-variant">
        {nomesDiaSemana.map((n) => (
          <div key={n} className="p-2 text-center font-mono-caps text-[11px] uppercase text-outline">
            {n}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {celulas.map((celula, i) => {
          const itensDoDia = porDia.get(chaveDia(celula.data)) ?? [];
          return (
            <div
              key={i}
              className={`min-h-[104px] border-b border-r border-outline-variant p-1.5 last:border-r-0 ${
                celula.noMesAtual ? "" : "bg-surface-container-low opacity-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-body-sm ${
                    celula.hoje
                      ? "flex size-6 items-center justify-center rounded-pill bg-primary font-semibold text-on-primary"
                      : "text-outline"
                  }`}
                >
                  {celula.data.getDate()}
                </span>
              </div>
              <div className="mt-1 space-y-0.5">
                {itensDoDia.slice(0, MAX_ITENS_POR_DIA).map((item, idx) => {
                  const info = fonteCalendario(item.tipo);
                  const Icon = info.icon;
                  const conteudo = (
                    <span
                      className={`flex items-center gap-1 truncate rounded px-1 py-0.5 text-[11px] ${TONE_SOFT[info.tone]}`}
                      title={item.titulo}
                    >
                      <Icon size={10} className="shrink-0" />
                      <span className="truncate">{item.titulo}</span>
                    </span>
                  );
                  return item.href ? (
                    <Link key={idx} href={item.href} className="block">
                      {conteudo}
                    </Link>
                  ) : (
                    <div key={idx}>{conteudo}</div>
                  );
                })}
                {itensDoDia.length > MAX_ITENS_POR_DIA && (
                  <span className="block text-[11px] text-outline">
                    +{itensDoDia.length - MAX_ITENS_POR_DIA} mais
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
